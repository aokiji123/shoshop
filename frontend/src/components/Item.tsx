import { useState } from 'react'
import {
  MdFavoriteBorder,
  MdOutlineDelete,
  MdOutlineEdit,
} from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { ProductForm } from './modals/ProductForm'
import { ConfirmDialog } from './modals/ConfirmDialog'
import { Toast, useToast } from './Toast'
import type { Product } from '@/api/types/product'
import { convertTextToColor } from '@/lib/utils'
import { useCurrentUser } from '@/api/queries/useAuth'
import { useDeleteProduct, useUpdateProduct } from '@/api/queries/useProduct'
import { useCart } from '@/contexts/CartContext'

type ItemProps = {
  shortened?: boolean
  product?: Product
}

export const Item = ({ shortened, product }: ItemProps) => {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const deleteProductMutation = useDeleteProduct()
  const updateProductMutation = useUpdateProduct()
  const { toast, showToast, hideToast } = useToast()
  const { addToCart } = useCart()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditModalOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDeleteDialogOpen(true)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    // TODO: Implement like functionality
    console.log('Like clicked for product:', product?.id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!product) return

    const success = addToCart(product, product.size, (message) => {
      showToast(message, 'error')
    })

    if (success) {
      showToast(`${product.enName} added to cart!`, 'success')
    }
  }

  const handleUpdateProduct = (data: FormData) => {
    if (!product?.id) return

    updateProductMutation.mutate(
      { id: product.id, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
          showToast('Product updated successfully!', 'success')
        },
        onError: (error) => {
          showToast(`Failed to update product: ${error.message}`, 'error')
        },
      },
    )
  }

  const handleDeleteProduct = () => {
    if (!product?.id) return

    deleteProductMutation.mutate(product.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        showToast('Product deleted successfully!', 'success')
      },
      onError: (error) => {
        showToast(`Failed to delete product: ${error.message}`, 'error')
      },
    })
  }

  return (
    <>
      <div className="bg-white w-full sm:w-[280px] md:w-[300px] lg:w-[280px] xl:w-[250px] 2xl:w-[280px] border-1 border-black cursor-pointer relative rounded-md">
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {!shortened && (
            <div
              onClick={handleLike}
              className="bg-white rounded-full p-1 cursor-pointer hover:scale-105 transition-all duration-300 z-10"
            >
              <MdFavoriteBorder size={24} />
            </div>
          )}
          {user?.isAdmin && !shortened && (
            <>
              <div
                onClick={handleEdit}
                className="bg-white rounded-full p-1 cursor-pointer hover:scale-105 transition-all duration-300 z-10"
              >
                <MdOutlineEdit size={24} />
              </div>
              <div
                onClick={handleDelete}
                className="bg-white rounded-full p-1 cursor-pointer hover:scale-105 transition-all duration-300 z-10"
              >
                <MdOutlineDelete size={24} />
              </div>
            </>
          )}
        </div>
        <div
          onClick={() =>
            navigate({
              to: '/items/$id',
              params: { id: product?.id as string },
            })
          }
        >
          <img
            src={`http://localhost:5077/${product?.image}`}
            alt={product?.enName}
            className="w-full h-[280px] object-cover bg-gray-200 rounded-t-md"
          />
          <div className="p-3 flex flex-col gap-2">
            <h3 className="text-lg font-bold">{product?.enName}</h3>
            <div className="flex flex-row items-center justify-between gap-2">
              <p className="text-sm">
                Price: <span className="font-bold">${product?.price}</span>
              </p>
              <div className="flex flex-row items-center justify-between gap-2">
                <p className="text-sm">Color: </p>
                <div
                  className={`w-3 h-3 ${convertTextToColor(product?.color.toLowerCase() || '')} border-1 border-black`}
                ></div>
              </div>
            </div>
            {!shortened && (
              <>
                <div className="flex flex-row items-center justify-between gap-2">
                  <p className="text-sm">Size: {product?.size}</p>
                  <p className="text-sm">Likes: {product?.likes}</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {product && (
        <>
          <ProductForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdateProduct}
            product={product}
            isLoading={updateProductMutation.isPending}
            title="Edit Product"
          />

          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteProduct}
            title="Delete Product"
            message={`Are you sure you want to delete "${product.enName}"? This action cannot be undone.`}
            confirmText="Delete"
            isLoading={deleteProductMutation.isPending}
          />
        </>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}
