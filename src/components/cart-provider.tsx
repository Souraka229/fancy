"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("daydays-fancy-cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem("daydays-fancy-cart");
      }
    }

    const storedWishlist = window.localStorage.getItem("daydays-fancy-wishlist");
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch {
        window.localStorage.removeItem("daydays-fancy-wishlist");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("daydays-fancy-cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem("daydays-fancy-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setItems((current) => {
      const exist = current.find((item) => item.product.id === product.id);
      if (exist) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: number) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const toggleWishlist = (product: Product) => {
    setWishlist((current) => (current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product]));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product.promoPrice ?? item.product.price) * item.quantity, 0),
    [items],
  );

  const discount = subtotal > 100000 ? subtotal * 0.1 : 0;
  const shipping = subtotal > 100000 ? 0 : 3500;
  const total = subtotal - discount + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    wishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    subtotal,
    shipping,
    discount,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
