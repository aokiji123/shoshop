export type Product = {
  id: string
  uaName: string
  enName: string
  description: string
  price: number
  category: string
  count: number
  likes: number
  image: string
  size: string
  color: string
}

export type ProductsResponse = Array<Product>

export type ProductResponse = Product
