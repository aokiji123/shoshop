import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/auth'

// Token management functions
export function saveAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// API functions
async function registerUser(
  userData: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post('/auth/register', {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    isAdmin: userData.isAdmin || false,
    image: userData.image || '',
  })

  // Backend now returns { Token: string, UserId: string, IsAdmin: boolean }
  return {
    success: true,
    token: data.Token || data.token,
    user: {
      id: data.UserId || data.userId,
      isAdmin: data.IsAdmin || data.isAdmin,
    },
  }
}

async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post('/auth/login', credentials)

  return {
    success: true,
    token: data.Token || data.token,
    user: {
      id: data.UserId || data.userId,
      isAdmin: data.IsAdmin || data.isAdmin,
    },
  }
}

async function getCurrentUser(): Promise<User | null> {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const token = getAuthToken()
    if (!token) {
      return null
    }

    const { data } = await axiosInstance.get('/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Backend returns UserDto: { Id, Name, Email, IsAdmin, Image }
    return {
      id: data.Id || data.id,
      name: data.Name || data.name,
      email: data.Email || data.email,
      isAdmin: data.IsAdmin || data.isAdmin,
      image: data.Image || data.image,
      success: true,
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// React Query hooks
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.success && data.token) {
        saveAuthToken(data.token)
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      }
    },
    onError: (error) => {
      console.error('Registration error:', error)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.success && data.token) {
        saveAuthToken(data.token)
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      }
    },
    onError: (error) => {
      console.error('Login error:', error)
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      clearAuthToken()
      return true
    },
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}
