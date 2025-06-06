import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../axios'
import { getAuthToken } from './useAuth'
import type {
  Category,
  Color,
  Product,
  ProductFilters,
  ProductsResponse,
  Size,
} from '../types/product'

async function getAllProducts(
  filters: ProductFilters = {},
): Promise<ProductsResponse> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Build query parameters
    const params = new URLSearchParams()

    if (filters.uaName) params.append('UaName', filters.uaName)
    if (filters.enName) params.append('EnName', filters.enName)
    if (filters.description) params.append('Description', filters.description)
    if (filters.minPrice !== undefined)
      params.append('MinPrice', filters.minPrice.toString())
    if (filters.maxPrice !== undefined)
      params.append('MaxPrice', filters.maxPrice.toString())
    if (filters.category) params.append('Category', filters.category)
    if (filters.count !== undefined)
      params.append('Count', filters.count.toString())
    if (filters.likes !== undefined)
      params.append('Likes', filters.likes.toString())
    if (filters.size) params.append('Size', filters.size)
    if (filters.color) params.append('Color', filters.color)
    if (filters.orderBy) params.append('OrderBy', filters.orderBy)
    if (filters.sortDirection)
      params.append('SortDirection', filters.sortDirection)
    if (filters.page !== undefined)
      params.append('Page', filters.page.toString())
    if (filters.pageSize !== undefined)
      params.append('PageSize', filters.pageSize.toString())

    const url = `/product${params.toString() ? `?${params.toString()}` : ''}`

    const { data } = await axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return {
      data: data.data.map((product: any) => ({
        id: product.Id || product.id,
        uaName: product.UaName || product.uaName,
        enName: product.EnName || product.enName,
        description: product.Description || product.description,
        price: product.Price || product.price,
        category: product.Category || product.category,
        count: product.Count || product.count,
        likes: product.Likes || product.likes,
        image: product.Image || product.image,
        size: product.Size || product.size,
        color: product.Color || product.color,
      })),
      totalCount: data.totalCount,
    }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch products',
    )
  }
}

async function getProductById(id: string): Promise<Product> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const { data } = await axiosInstance.get(`/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return {
      id: data.Id || data.id,
      uaName: data.UaName || data.uaName,
      enName: data.EnName || data.enName,
      description: data.Description || data.description,
      price: data.Price || data.price,
      category: data.Category || data.category,
      count: data.Count || data.count,
      likes: data.Likes || data.likes,
      image: data.Image || data.image,
      size: data.Size || data.size,
      color: data.Color || data.color,
    }
  } catch (error: any) {
    console.error('Error fetching product:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch product',
    )
  }
}

async function getPopularProducts(limit = 10): Promise<ProductsResponse> {
  try {
    // Use the main getAllProducts function with sorting by likes
    return getAllProducts({
      orderBy: 'likes',
      sortDirection: 'Descending',
      pageSize: limit,
      page: 1,
    })
  } catch (error: any) {
    console.error('Error fetching popular products:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch popular products',
    )
  }
}

// Product creation/update/delete functions
async function createProduct(productData: FormData): Promise<Product> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const { data } = await axiosInstance.post('/product', productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      id: data.Id || data.id,
      uaName: data.UaName || data.uaName,
      enName: data.EnName || data.enName,
      description: data.Description || data.description,
      price: data.Price || data.price,
      category: data.Category || data.category,
      count: data.Count || data.count,
      likes: data.Likes || data.likes,
      image: data.Image || data.image,
      size: data.Size || data.size,
      color: data.Color || data.color,
    }
  } catch (error: any) {
    console.error('Error creating product:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to create product',
    )
  }
}

async function updateProduct(
  id: string,
  productData: FormData,
): Promise<Product> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const { data } = await axiosInstance.put(`/product/${id}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      id: data.Id || data.id,
      uaName: data.UaName || data.uaName,
      enName: data.EnName || data.enName,
      description: data.Description || data.description,
      price: data.Price || data.price,
      category: data.Category || data.category,
      count: data.Count || data.count,
      likes: data.Likes || data.likes,
      image: data.Image || data.image,
      size: data.Size || data.size,
      color: data.Color || data.color,
    }
  } catch (error: any) {
    console.error('Error updating product:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to update product',
    )
  }
}

async function deleteProduct(id: string): Promise<void> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    await axiosInstance.delete(`/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to delete product',
    )
  }
}

async function getCategories(): Promise<Array<Category>> {
  try {
    const { data } = await axiosInstance.get('/product/categories')
    return data.map((item: any) => item.name)
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch categories',
    )
  }
}

async function getSizes(): Promise<Array<Size>> {
  try {
    const { data } = await axiosInstance.get('/product/sizes')
    return data.map((item: any) => item.name)
  } catch (error: any) {
    console.error('Error fetching sizes:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch sizes',
    )
  }
}

async function getColors(): Promise<Array<Color>> {
  try {
    const { data } = await axiosInstance.get('/product/colors')
    return data.map((item: any) => item.name)
  } catch (error: any) {
    console.error('Error fetching colors:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch colors',
    )
  }
}

// React Query hooks
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getAllProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    enabled: typeof window !== 'undefined' && !!getAuthToken(),
    refetchOnWindowFocus: false,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    enabled: typeof window !== 'undefined' && !!getAuthToken() && !!id,
    refetchOnWindowFocus: false,
  })
}

export function usePopularProducts(limit = 10) {
  return useQuery({
    queryKey: ['products', 'popular', limit],
    queryFn: () => getPopularProducts(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    enabled: typeof window !== 'undefined' && !!getAuthToken(),
    refetchOnWindowFocus: false,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour - categories don't change often
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

export function useSizes() {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: getSizes,
    staleTime: 1000 * 60 * 60, // 1 hour - sizes don't change often
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

export function useColors() {
  return useQuery({
    queryKey: ['colors'],
    queryFn: getColors,
    staleTime: 1000 * 60 * 60, // 1 hour - colors don't change often
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Mutation hooks
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', 'popular'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products', 'popular'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', 'popular'] })
    },
  })
}
