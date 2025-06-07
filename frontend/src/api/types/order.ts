export type Order = {
  id: string
  tgTag: string
  price: number
  userId: string
  createdAt: string
  orderProducts: Array<OrderProduct>
}

export type OrderProduct = {
  productId: string
  productName: string
  quantity: number
  priceAtTime: number
}

export type CreateOrderRequest = {
  tgTag: string
  price: number
  products: Array<{
    productId: string
    quantity: number
  }>
}
