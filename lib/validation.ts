import { z } from 'zod'

export const CartItem = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive()
})

export const CustomerSchema = z.object({
  name: z.string().min(2),
  whatsapp: z.string().min(6),
  address: z.string().min(5),
  zone: z.string().optional()
})

export const CheckoutSchema = z.object({
  items: z.array(CartItem).min(1),
  customer: CustomerSchema,
  shipping: z.number().int().min(0).optional()
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>
