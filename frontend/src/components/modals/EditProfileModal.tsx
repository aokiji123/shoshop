import { useEffect, useState } from 'react'
import { MdClose } from 'react-icons/md'
import type { User } from '@/api/types/auth'

type EditProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  user: User
  onUpdate: (userData: {
    name: string
    email: string
    tgTag: string
    imageFile?: File
  }) => void
  isUpdating: boolean
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onUpdate,
  isUpdating,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tgTag: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string>('')

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      tgTag: user.tgTag || '',
    })
  }, [user])

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userData: {
      name: string
      email: string
      tgTag: string
      imageFile?: File
    } = {
      name: formData.name,
      email: formData.email,
      tgTag: formData.tgTag,
    }
    if (selectedFile) {
      userData.imageFile = selectedFile
    }
    onUpdate(userData)
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

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setFileError('File size must be less than 5MB')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)

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

  function handleClose() {
    setSelectedFile(null)
    setPreviewImage(null)
    setFileError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 w-full max-w-md rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button
            onClick={handleClose}
            className="p-1 cursor-pointer transition-all duration-200 hover:scale-110 rounded-md"
          >
            <MdClose />
          </button>
        </div>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border-1 border-black focus:outline-none w-full rounded-md"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border-1 border-black focus:outline-none w-full rounded-md"
            />
          </div>
          <div>
            <label htmlFor="tgTag" className="block text-sm font-medium mb-1">
              Telegram Tag
            </label>
            <input
              id="tgTag"
              name="tgTag"
              type="text"
              value={formData.tgTag}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border-1 border-black focus:outline-none w-full rounded-md"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              Profile Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="px-3 py-2 border-1 border-black focus:outline-none w-full rounded-md"
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
                src={`http://localhost:5077/${user.image}`}
                alt="Current profile"
                className="w-16 h-16 rounded-full object-cover mt-2"
              />
            ) : null}
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white text-black border-1 border-black px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
