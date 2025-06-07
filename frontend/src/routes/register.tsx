import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useRegister } from '@/api/queries/useAuth'
import { requireNoAuth } from '@/lib/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    requireNoAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { mutate: register, isPending } = useRegister()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    register(formData, {
      onSuccess: (data) => {
        if (data.success) {
          navigate({ to: '/' })
        } else {
          setErrors({ general: data.error || 'Registration failed' })
        }
      },
      onError: (error: any) => {
        setErrors({
          general:
            error.response?.data?.message ||
            error.response?.data ||
            'An error occurred during registration',
        })
      },
    })
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[90vh]">
        <div className="space-y-5">
          <h2 className="text-4xl font-bold">ShoShop</h2>
          <h2 className="text-3xl font-bold">Register</h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-[400px]"
          >
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                className={`px-3 py-2 border-1 rounded-md ${
                  errors.name ? 'border-red-500' : 'border-black'
                } focus:outline-none`}
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">{errors.name}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                className={`px-3 py-2 border-1 rounded-md ${
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
                className={`px-3 py-2 border-1 rounded-md ${
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
              className="bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              type="submit"
              disabled={isPending}
            >
              {isPending ? 'Registering...' : 'Register'}
            </button>

            {errors.general && (
              <div className="text-red-500 text-sm text-center rounded-md">
                {errors.general}
              </div>
            )}

            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" search={{ message: undefined }}>
                <span className="cursor-pointer hover:underline">Login</span>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
