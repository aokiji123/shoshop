import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { MdClear } from 'react-icons/md'
import type { Category, Color, ProductFilters, Size } from '@/api/types/product'
import {
  useCategories,
  useColors,
  useCreateProduct,
  useProducts,
  useSizes,
} from '@/api/queries/useProduct'
import { useCurrentUser } from '@/api/queries/useAuth'
import { Item } from '@/components/Item'
import { ProductForm } from '@/components/modals/ProductForm'
import { Toast, useToast } from '@/components/Toast'
import { requireAuth } from '@/lib/auth'

export const Route = createFileRoute('/items/')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: user } = useCurrentUser()
  const createProductMutation = useCreateProduct()
  const { toast, showToast, hideToast } = useToast()

  const { data: categories = [] } = useCategories()
  const { data: sizes = [] } = useSizes()
  const { data: colors = [] } = useColors()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    'all',
  )
  const [selectedSize, setSelectedSize] = useState<Size | 'all'>('all')
  const [selectedColor, setSelectedColor] = useState<Color | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('enName')
  const [sortDirection, setSortDirection] = useState<
    'Ascending' | 'Descending'
  >('Ascending')

  const pageSize = 12

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filters = useMemo<ProductFilters>(() => {
    const filterObj: ProductFilters = {
      page: currentPage,
      pageSize,
      orderBy: sortBy,
      sortDirection,
    }

    if (debouncedSearchTerm.trim()) {
      filterObj.enName = debouncedSearchTerm.trim()
    }

    if (selectedCategory !== 'all') {
      filterObj.category = selectedCategory
    }

    if (selectedSize !== 'all') {
      filterObj.size = selectedSize
    }

    if (selectedColor !== 'all') {
      filterObj.color = selectedColor
    }

    return filterObj
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedSize,
    selectedColor,
    currentPage,
    sortBy,
    sortDirection,
  ])

  const { data: productsResponse, isLoading, error } = useProducts(filters)

  const products = productsResponse?.data || []
  const totalCount = productsResponse?.totalCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleCreateProduct = (data: FormData) => {
    createProductMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        showToast('Product created successfully!', 'success')
      },
      onError: (error) => {
        showToast(`Failed to create product: ${error.message}`, 'error')
      },
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSizeChange = (size: Size | 'all') => {
    setSelectedSize(size)
    setCurrentPage(1)
  }

  const handleColorChange = (color: Color | 'all') => {
    setSelectedColor(color)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setSelectedCategory('all')
    setSelectedSize('all')
    setSelectedColor('all')
    setCurrentPage(1)
    setSortBy('enName')
    setSortDirection('Ascending')
  }

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      selectedCategory !== 'all' ||
      selectedSize !== 'all' ||
      selectedColor !== 'all' ||
      sortBy !== 'enName' ||
      sortDirection !== 'Ascending'
    )
  }, [
    searchTerm,
    selectedCategory,
    selectedSize,
    selectedColor,
    sortBy,
    sortDirection,
  ])

  const getPaginationNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="w-12 h-12 border-2 border-t-black border-gray-300 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto flex flex-col justify-center p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        <div className="text-red-500 text-center">
          Error loading products: {error.message}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto flex flex-col justify-center p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Products ({totalCount})</h2>
          {user?.isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-black text-white text-md px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
            >
              Create product
            </button>
          )}
        </div>

        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-[70%] p-2 border-1 border-black outline-none rounded-md"
          />
          <div className="flex flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) =>
                handleCategoryChange(e.target.value as Category | 'all')
              }
              className="p-2 border-1 border-black rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedSize}
              onChange={(e) => handleSizeChange(e.target.value as Size | 'all')}
              className="p-2 border-1 border-black rounded-md"
            >
              <option value="all">All Sizes</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(e) =>
                handleColorChange(e.target.value as Color | 'all')
              }
              className="p-2 border-1 border-black rounded-md"
            >
              <option value="all">All Colors</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-')
                setSortBy(field)
                setSortDirection(direction as 'Ascending' | 'Descending')
              }}
              className="p-2 border-1 border-black rounded-md"
            >
              <option value="enName-Ascending">Name A-Z</option>
              <option value="enName-Descending">Name Z-A</option>
              <option value="price-Ascending">Price Low-High</option>
              <option value="price-Descending">Price High-Low</option>
              <option value="likes-Descending">Most Popular</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 border-1 border-black rounded-md hover:bg-gray-100 cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <MdClear size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-4 flex-wrap">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id}>
                <Item product={product} />
              </div>
            ))
          ) : (
            <div className="text-center w-full">No products found</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-row items-center justify-center mt-4">
            <ul className="flex flex-row gap-4">
              {currentPage > 1 && (
                <li
                  className="text-lg hover:underline cursor-pointer px-2 py-1"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ← Previous
                </li>
              )}

              {getPaginationNumbers().map((page, index) => (
                <li
                  key={index}
                  className={`text-lg cursor-pointer px-2 py-1 rounded-md ${
                    page === currentPage
                      ? 'font-bold bg-black text-white'
                      : page === '...'
                        ? 'cursor-default'
                        : 'hover:underline'
                  }`}
                  onClick={() => {
                    if (typeof page === 'number' && page !== currentPage) {
                      handlePageChange(page)
                    }
                  }}
                >
                  {page}
                </li>
              ))}

              {currentPage < totalPages && (
                <li
                  className="text-lg hover:underline cursor-pointer px-2 py-1"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next →
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <ProductForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={createProductMutation.isPending}
        title="Create New Product"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}
