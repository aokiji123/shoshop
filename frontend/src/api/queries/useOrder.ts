import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../axios'
import { getAuthToken } from './useAuth'
import type { CreateOrderRequest, Order } from '../types/order'

async function getOrders(): Promise<Array<Order>> {
  const token = getAuthToken()
  try {
    const { data } = await axiosInstance.get('/order', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

async function getOrderByUserId(userId: string): Promise<Array<Order>> {
  const token = getAuthToken()
  try {
    const { data } = await axiosInstance.get(`/order/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  const token = getAuthToken()
  try {
    const { data } = await axiosInstance.post('/order', orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data
  } catch (error: any) {
    console.error('Error creating order:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useOrdersByUserId(userId: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => getOrderByUserId(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
