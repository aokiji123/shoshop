import { redirect } from '@tanstack/react-router'
import { getAuthToken } from '../api/queries/useAuth'

export function requireAuth() {
  const token = getAuthToken()
  if (!token) {
    throw redirect({
      to: '/login',
      search: { message: 'Please log in to access site' },
    })
  }
}

export function requireNoAuth() {
  const token = getAuthToken()
  if (token) {
    throw redirect({
      to: '/',
    })
  }
}
