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

export type Category =
  | 'Jeans'
  | 'Hat'
  | 'Shirt'
  | 'Hoodie'
  | 'Pants'
  | 'Jacket'
  | 'Accessory'

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'OneSize'

export type Color =
  | 'Red'
  | 'Blue'
  | 'Green'
  | 'Yellow'
  | 'Black'
  | 'White'
  | 'Gray'
  | 'Pink'
  | 'Purple'
  | 'Orange'
  | 'Brown'
  | 'Navy'
  | 'Beige'

export type SortDirection = 'Ascending' | 'Descending'

export type ProductFilters = {
  uaName?: string
  enName?: string
  description?: string
  minPrice?: number
  maxPrice?: number
  category?: Category
  count?: number
  likes?: number
  size?: Size
  color?: Color
  orderBy?: string
  sortDirection?: SortDirection
  page?: number
  pageSize?: number
}

export type ProductsResponse = {
  data: Array<Product>
  totalCount: number
}

export type ProductResponse = Product
