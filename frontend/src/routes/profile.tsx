import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MdClose } from 'react-icons/md'
import Footer from '@/components/Footer'
import { useCurrentUser, useLogout } from '@/api/queries/useAuth'
import { useDeleteUser, useUpdateUser } from '@/api/queries/useUser'
import { requireAuth } from '@/lib/auth'

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: user, isLoading, error, isFetching } = useCurrentUser()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string>('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        navigate({ to: '/login', search: { message: undefined } })
      },
    })
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userData: { name: string; email: string; imageFile?: File } = {
      name: formData.name,
      email: formData.email,
    }
    if (selectedFile) {
      userData.imageFile = selectedFile
    }
    updateUser(userData, {
      onSuccess: (data) => {
        if (data.success) {
          setIsEditModalOpen(false)
          setSelectedFile(null)
          setPreviewImage(null)
          setFileError('')
        }
      },
    })
  }

  function handleDeleteAccount() {
    deleteUser(undefined, {
      onSuccess: (data) => {
        if (data.success) {
          navigate({ to: '/login', search: { message: undefined } })
        }
      },
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setFileError('')
    setPreviewImage(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ]
    if (!allowedTypes.includes(file.type)) {
      setFileError(
        'Please select a valid image file (JPG, JPEG, PNG, WebP, or GIF)',
      )
      setSelectedFile(null)
      return
    }

    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setFileError('File size must be less than 5MB')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)

    // Generate preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
    }
    reader.onerror = () => {
      setFileError('Error reading file')
      setSelectedFile(null)
    }
    reader.readAsDataURL(file)
  }

  if (isLoading || isFetching) {
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
        {user.isAdmin && <p className="text-xl px-2 py-1">Admin</p>}
        <div className="relative flex items-center justify-center">
          <img
            src={`http://localhost:5077/${user.image}` || 'https://placehold.co/200x200'}
            className="rounded-full w-[200px] h-[200px]"
            alt="Profile"
          />
        </div>
        <div className="flex flex-col gap-2 text-center">
          <p className="text-2xl font-bold">{user.name}</p>
          <p className="text-lg">{user.email}</p>
        </div>
        <div className="w-[300px] flex flex-col gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300"
          >
            Edit user
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-red-500 w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300"
          >
            Delete account
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 cursor-pointer transition-all duration-200 hover:scale-110"
              >
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border-1 border-black focus:outline-none w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border-1 border-black focus:outline-none w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium mb-1"
                >
                  Profile Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="px-3 py-2 border-1 border-black focus:outline-none w-full"
                />
                {fileError && (
                  <p className="text-red-500 text-sm mt-1">{fileError}</p>
                )}
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover mt-2"
                  />
                ) : user.image ? (
                  <img
                    src={`http://localhost:5077/${user?.image}` || 'https://placehold.co/40x40'}
                    alt="Current profile"
                    className="w-16 h-16 rounded-full object-cover mt-2"
                  />
                ) : null}
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-white text-black border-1 border-black px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="transition-all duration-200 hover:scale-110 p-1 cursor-pointer"
              >
                <MdClose />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete your account?
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-black hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
