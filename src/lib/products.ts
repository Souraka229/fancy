export type Product = {
  id: number | string
  sku?: string
  name: string
  description?: string
  price: number
  discount?: number
  stock?: number
  images?: string[]
  badges?: string[]
  is_sponsored?: boolean
  slug?: string
}

export const products: Product[] = []

export default products
