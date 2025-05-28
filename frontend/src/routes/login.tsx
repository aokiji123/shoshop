import { useEffect, useState } from 'react'
import {
  Link,
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import Footer from '@/components/Footer'
import { useLogin } from '@/api/queries/useAuth'
import { requireNoAuth } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    requireNoAuth()
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    message: search.message as string | undefined,
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { message } = useSearch({ from: '/login' })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState(message || '')

  const loginMutation = useLogin()

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    loginMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success) {
          navigate({ to: '/' })
        } else {
          setErrors({ general: data.error || 'Login failed' })
        }
      },
      onError: (error: any) => {
        setErrors({
          general: error.response?.data?.message || 'Invalid email or password',
        })
      },
    })
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[90vh]">
        <div className="space-y-5">
          <h2 className="text-4xl font-bold">ShoShop</h2>
          <h2 className="text-3xl font-bold">Login</h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-[400px]"
          >
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                className={`px-3 py-2 border-1 ${
                  errors.email ? 'border-red-500' : 'border-black'
                } focus:outline-none`}
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <input
                className={`px-3 py-2 border-1 ${
                  errors.password ? 'border-red-500' : 'border-black'
                } focus:outline-none`}
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              className="bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>

            {successMessage && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="text-red-500 text-sm text-center">
                {errors.general}
              </div>
            )}

            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/register">
                <span className="cursor-pointer hover:underline">Register</span>
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
