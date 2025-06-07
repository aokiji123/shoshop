import { useState } from 'react'
import { MdClose } from 'react-icons/md'
import type { Product } from '@/api/types/product'
import { useCategories, useColors, useSizes } from '@/api/queries/useProduct'

type ProductFormData = {
  uaName: string
  enName: string
  description: string
  price: number
  category: string
  count: number
  likes: number
  size: string
  color: string
  imageFile?: File
}

type ProductFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => void
  product?: Product
  isLoading?: boolean
  title: string
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
  title,
}: ProductFormProps) {
  // Fetch dynamic options
  const { data: categories = [] } = useCategories()
  const { data: sizes = [] } = useSizes()
  const { data: colors = [] } = useColors()

  const [formData, setFormData] = useState<ProductFormData>({
    uaName: product?.uaName || '',
    enName: product?.enName || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    count: product?.count || 0,
    likes: product?.likes || 0,
    size: product?.size || '',
    color: product?.color || '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = new FormData()
    submitData.append('UaName', formData.uaName)
    submitData.append('EnName', formData.enName)
    submitData.append('Description', formData.description)
    submitData.append('Price', formData.price.toString())
    submitData.append('Category', formData.category)
    submitData.append('Count', formData.count.toString())
    submitData.append('Likes', formData.likes.toString())
    submitData.append('Size', formData.size)
    submitData.append('Color', formData.color)

    if (imageFile) {
      submitData.append('imageFile', imageFile)
    }

    onSubmit(submitData)
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ukrainian Name *
              </label>
              <input
                type="text"
                name="uaName"
                value={formData.uaName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                English Name *
              </label>
              <input
                type="text"
                name="enName"
                value={formData.enName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 outline-none focus:border-black resize-none rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Count *</label>
              <input
                type="number"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Size *</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              >
                <option value="">Select size</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color *</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
              >
                <option value="">Select color</option>
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Likes</label>
            <input
              type="number"
              name="likes"
              value={formData.likes}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Product Image {!product && '*'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!product}
              className="w-full p-2 border border-gray-300 outline-none focus:border-black rounded"
            />
            {product?.image && !imageFile && (
              <p className="text-sm text-gray-600 mt-1">
                Current image: {product.image}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:scale-105 transition-all duration-300 cursor-pointer rounded-md"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-black text-white cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
            >
              {isLoading
                ? 'Saving...'
                : product
                  ? 'Update Product'
                  : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
