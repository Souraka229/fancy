-- 04_create_order_rpc.sql

-- Atomic order creation function: creates order, inserts items, decrements stock in a transaction, returns order number

CREATE OR REPLACE FUNCTION public.create_order_atomic(p_items jsonb, p_customer jsonb, p_shipping integer DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id integer;
  v_order_number text;
  v_total integer := 0;
  v_item record;
  v_price integer;
  v_discount integer;
  v_stock integer;
  v_sku text;
  v_name text;
  v_unit integer;
  v_line_total integer;
BEGIN
  -- generate unique 5-digit numeric order number
  LOOP
    v_order_number := lpad(((floor(random()*90000)+10000))::int::text, 5, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE order_number = v_order_number);
  END LOOP;

  -- create order placeholder
  INSERT INTO orders(order_number, customer_name, whatsapp_phone, address, delivery_zone, total, metadata, status)
  VALUES (v_order_number, p_customer->>'name', p_customer->>'whatsapp', p_customer->>'address', p_customer->>'zone', 0, jsonb_build_object('shipping', p_shipping), 'Reçue')
  RETURNING id INTO v_order_id;

  -- iterate items
  FOR v_item IN SELECT (elem->>'product_id')::int AS product_id, (elem->>'quantity')::int AS quantity FROM jsonb_array_elements(p_items) AS elem LOOP
    -- lock product row
    SELECT price, coalesce(discount,0), coalesce(stock,0), sku, name INTO v_price, v_discount, v_stock, v_sku, v_name
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    IF v_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_name;
    END IF;

    v_unit := v_price - v_discount;
    v_line_total := v_unit * v_item.quantity;

    INSERT INTO order_items(order_id, product_id, sku, name, unit_price, quantity, total_price)
    VALUES (v_order_id, v_item.product_id, v_sku, v_name, v_unit, v_item.quantity, v_line_total);

    -- decrement stock
    UPDATE products SET stock = stock - v_item.quantity WHERE id = v_item.product_id;

    v_total := v_total + v_line_total;
  END LOOP;

  -- update order total (including shipping)
  UPDATE orders SET total = v_total + COALESCE(p_shipping,0) WHERE id = v_order_id;

  RETURN jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'total', v_total + COALESCE(p_shipping,0));
END;
$$;

-- grant execute to anon and authenticated? Keep restricted: only service role should call this in production.
