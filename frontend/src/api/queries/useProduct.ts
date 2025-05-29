import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../axios'
import { getAuthToken } from './useAuth'
import type { Product } from '../types/product'

async function getAllProducts(): Promise<Array<Product>> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const { data } = await axiosInstance.get('/product', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return data.map((product: any) => ({
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
    }))
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

async function getPopularProducts(limit = 10): Promise<Array<Product>> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const { data } = await axiosInstance.get(
      `/product/popular?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return data.map((product: any) => ({
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
    }))
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

// React Query hooks
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
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
