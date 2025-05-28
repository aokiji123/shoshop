export type RegisterRequest = {
  name: string
  email: string
  password: string
  isAdmin?: boolean
  image?: string
}

export type RegisterResponse = {
  success: boolean
  token?: string
  user?: {
    id?: string
    name?: string
    email?: string
    isAdmin?: boolean
    image?: string
  }
  error?: string
  message?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  success: boolean
  token?: string
  user?: {
    id?: string
    name?: string
    email?: string
    isAdmin?: boolean
    image?: string
  }
  error?: string
  message?: string
}

export type User = {
  id?: string
  name?: string
  email?: string
  isAdmin?: boolean
  image?: string
  success?: boolean
  error?: string
}
