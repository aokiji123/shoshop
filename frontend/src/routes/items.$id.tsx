import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { MdFavorite } from 'react-icons/md'
import Footer from '@/components/Footer'
import { Item } from '@/components/Item'
import { Toast, useToast } from '@/components/Toast'
import { convertTextToColor } from '@/lib/utils'
import { requireAuth } from '@/lib/auth'
import { usePopularProducts, useProduct } from '@/api/queries/useProduct'
import { useCart } from '@/contexts/CartContext'

export const Route = createFileRoute('/items/$id')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { addToCart, canAddToCart, getRemainingStock } = useCart()
  const { toast, showToast, hideToast } = useToast()

  const [selectedSize, setSelectedSize] = useState('M')

  const { data: product, isLoading, error } = useProduct(id)
  const { data: popularProducts } = usePopularProducts(10)

  const handleAddToCart = () => {
    if (!product) return

    const success = addToCart(product, selectedSize, (message) => {
      showToast(message, 'error')
    })

    if (success) {
      showToast(
        `${product.enName} (Size ${selectedSize}) added to cart!`,
        'success',
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="w-12 h-12 border-2 border-t-black border-gray-300 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto flex flex-col justify-center p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl font-bold mb-6">Product Not Found</h2>
        <div className="text-red-500 text-center">
          {error?.message || 'Product not found'}
        </div>
      </div>
    )
  }

  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
  const canAdd = canAddToCart(product, selectedSize)
  const remainingStock = getRemainingStock(product, selectedSize)

  return (
    <>
      <div>
        <div className="flex flex-row items-center gap-8 container mx-auto p-4 md:p-6 lg:p-8">
          <img
            src={`http://localhost:5077/${product.image}`}
            alt={product.enName}
            className="w-[200px] h-[200px] md:w-[400px] md:h-[400px] object-cover"
          />
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">{product.enName}</h1>
              <p className="text-xl font-bold">${product.price}</p>

              {/* Stock Information */}
              <div className="flex flex-col gap-2">
                <p className="text-lg">
                  <span className="font-bold">Stock:</span> {product.count}{' '}
                  available
                </p>
                {product.count <= 5 && product.count > 0 && (
                  <p className="text-orange-600 text-sm">
                    Only {product.count} left in stock - order soon!
                  </p>
                )}
                {product.count === 0 && (
                  <p className="text-red-600 text-sm font-bold">Out of stock</p>
                )}
              </div>

              <p className="text-lg">Pick the size:</p>
              <ul className="flex flex-row gap-4">
                {sizes.map((size) => (
                  <li
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-2 min-w-[40px] h-[40px] flex items-center justify-center border-1 border-black cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ${
                      selectedSize === size ? 'bg-black text-white' : ''
                    }`}
                  >
                    {size}
                  </li>
                ))}
              </ul>

              {/* Show remaining stock for selected size */}
              {remainingStock < product.count && remainingStock > 0 && (
                <p className="text-sm text-orange-600">
                  {remainingStock} more can be added to cart for size{' '}
                  {selectedSize}
                </p>
              )}

              <p className="text-lg flex flex-row items-center gap-2">
                Color:{' '}
                <div
                  className={`w-5 h-5 ${convertTextToColor(product.color)}`}
                ></div>
              </p>
              <p className="text-lg">
                Category: <span className="font-bold">{product.category}</span>
              </p>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
            <div className="flex flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd || product.count === 0}
                className={`text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 ${
                  !canAdd || product.count === 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed hover:scale-100'
                    : 'bg-black text-white'
                }`}
              >
                {product.count === 0
                  ? 'Out of Stock'
                  : !canAdd
                    ? 'Max Quantity in Cart'
                    : 'Add to Cart'}
              </button>
              <button className="bg-black text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
                <MdFavorite />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
          <h2 className="text-2xl font-bold">Popular Items</h2>
          <div className="flex flex-row w-full gap-4 overflow-x-auto">
            {popularProducts && popularProducts.length > 0 ? (
              popularProducts.map((popularProduct) => (
                <div
                  key={popularProduct.id}
                  className="flex-shrink-0 pb-4"
                  onClick={() => {
                    navigate({
                      to: '/items/$id',
                      params: { id: popularProduct.id },
                    })
                  }}
                >
                  <Item product={popularProduct} shortened={true} />
                </div>
              ))
            ) : (
              <div className="text-center w-full">
                No popular products found
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}
