export type Product = {
  id: number | string
  sku?: string
  name: string
  description?: string
  price: number
  promoPrice?: number
  discount?: number
  stock?: number
  images?: string[]
  image?: string
  imageAlt?: string
  badges?: string[]
  badge?: string
  rating?: number
  category?: string
  accent?: string
  is_sponsored?: boolean
  slug?: string
}

export const products: Product[] = []

export default products
