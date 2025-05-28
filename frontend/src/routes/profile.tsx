import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MdEdit } from 'react-icons/md'
import Footer from '@/components/Footer'
import { useCurrentUser, useLogout } from '@/api/queries/useAuth'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: user, isLoading, error } = useCurrentUser()
  const { mutate: logout, isPending } = useLogout()

  console.log(user)

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      navigate({ to: '/login', search: { message: undefined } })
    }
  }, [user, isLoading, error, navigate])

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        navigate({ to: '/login', search: { message: undefined } })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="w-12 h-12 border-2 border-t-black border-gray-300 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || error) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8 items-center h-[90vh] justify-center">
        <div className="relative flex items-center justify-center">
          <img
            src={user.image || 'https://github.com/shadcn.png'}
            className="rounded-full w-[200px] h-[200px]"
            alt="Profile"
          />
          <div className="absolute top-3 right-3 bg-white border-1 border-black rounded-full p-2 cursor-pointer hover:scale-105 transition-all duration-300">
            <MdEdit />
          </div>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <p className="text-2xl font-bold">{user.name}</p>
          <p className="text-lg">{user.email}</p>
          {user.isAdmin && (
            <p className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Admin
            </p>
          )}
        </div>
        <div className="w-[300px] flex flex-col gap-2">
          <button className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
            Edit user
          </button>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isPending ? 'Logging out...' : 'Logout'}
          </button>
          <button className="bg-red-500 w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
            Delete account
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
