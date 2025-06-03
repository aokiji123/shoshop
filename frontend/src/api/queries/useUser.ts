import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../axios'
import { clearAuthToken, getAuthToken } from './useAuth'
import type { User } from '../types/auth'
import { clearCartFromStorage } from '@/lib/cart'

export type UpdateUserRequest = {
  name?: string
  email?: string
  image?: string
  imageFile?: File
}

export type UpdateUserResponse = {
  success: boolean
  user?: User
  error?: string
  errors?: string[]
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

    const formData = new FormData()
    
    if (userData.name) {
      formData.append('Name', userData.name)
    }
    
    if (userData.email) {
      formData.append('Email', userData.email)
    }
    
    if (userData.image) {
      formData.append('Image', userData.image)
    }
    
    if (userData.imageFile) {
      formData.append('imageFile', userData.imageFile)
    }

    console.log('Sending FormData with:', {
      name: userData.name,
      email: userData.email,
      image: userData.image,
      hasFile: !!userData.imageFile
    })

    const { data } = await axiosInstance.put('/user', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
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

    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
      console.error('Response headers:', error.response.headers)
      
      const responseData = error.response.data
      return {
        success: false,
        error: responseData.message || 'Failed to update user',
        errors: responseData.errors || [],
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to update user',
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

        // Clear cart on account deletion with immediate UI update
        clearCartFromStorage()
      }
    },
    onError: (error) => {
      console.error('Delete user error:', error)
    },
  })
}
