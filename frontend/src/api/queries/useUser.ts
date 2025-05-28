import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../axios'
import { clearAuthToken, getAuthToken } from './useAuth'
import type { User } from '../types/auth'

export type UpdateUserRequest = {
  name?: string
  email?: string
  image?: string
}

export type UpdateUserResponse = {
  success: boolean
  user?: User
  error?: string
  message?: string
}

export type DeleteUserResponse = {
  success: boolean
  error?: string
  message?: string
}

async function updateUser(
  userData: UpdateUserRequest,
): Promise<UpdateUserResponse> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const { data } = await axiosInstance.put('/user', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return {
      success: true,
      user: {
        id: data.Id || data.id,
        name: data.Name || data.name,
        email: data.Email || data.email,
        isAdmin: data.IsAdmin || data.isAdmin,
        image: data.Image || data.image,
      },
    }
  } catch (error: any) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to update user',
    }
  }
}

async function deleteUser(): Promise<DeleteUserResponse> {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    await axiosInstance.delete('/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to delete user',
    }
  }
}

// React Query hooks
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Update the current user in the cache
        queryClient.setQueryData(['currentUser'], data.user)
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      }
    },
    onError: (error) => {
      console.error('Update user error:', error)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data) => {
      if (data.success) {
        // Clear auth token and user data
        clearAuthToken()
        queryClient.setQueryData(['currentUser'], null)
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      }
    },
    onError: (error) => {
      console.error('Delete user error:', error)
    },
  })
}
