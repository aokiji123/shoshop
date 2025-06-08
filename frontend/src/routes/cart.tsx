import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { IoMdClose } from 'react-icons/io'
import type { CreateOrderRequest } from '@/api/types/order'
import { useCreateOrder } from '@/api/queries/useOrder'
import { useCurrentUser } from '@/api/queries/useAuth'
import { Toast, useToast } from '@/components/Toast'
import { useCart } from '@/contexts/CartContext'
import { convertTextToColor } from '@/lib/utils'
import { requireAuth } from '@/lib/auth'

export const Route = createFileRoute('/cart')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, getRemainingStock, clearCart } =
    useCart()
  const { toast, showToast, hideToast } = useToast()
  const createOrderMutation = useCreateOrder()
  const { data: currentUser } = useCurrentUser()

  const subtotal = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )
  const shipping = subtotal > 0 ? 10 : 0
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleQuantityUpdate = (
    productId: string,
    selectedSize: string,
    newQuantity: number,
  ) => {
    updateQuantity(productId, selectedSize, newQuantity, (message) => {
      showToast(message, 'error')
    })
  }

  const handleGoToPayment = () => {
    if (!currentUser?.tgTag) {
      showToast(
        'Please set your Telegram tag in your profile to place an order',
        'error',
      )
      return
    }

    if (cart.items.length === 0) {
      showToast('Your cart is empty', 'error')
      return
    }

    const orderData: CreateOrderRequest = {
      tgTag: currentUser.tgTag,
      price: total,
      products: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    }

    createOrderMutation.mutate(orderData, {
      onSuccess: () => {
        showToast(
          'Thanks for the order! Admin will connect with you ASAP.',
          'success',
        )
        clearCart()
        navigate({ to: '/' })
      },
      onError: (error: any) => {
        showToast(
          error.message || 'Failed to create order. Please try again.',
          'error',
        )
      },
    })
  }

  if (cart.items.length === 0) {
    return (
      <>
        <div className="px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[90vh] gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-center">
              Your cart is empty
            </h2>
            <p className="text-gray-600 text-center">
              Add some products to get started!
            </p>
          </div>
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

  return (
    <>
      <div className="min-h-[90vh] p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-8">
          <div className="flex-1 lg:max-w-none">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Cart</h2>
            <div className="space-y-4 md:space-y-6">
              {cart.items.map((item, index) => {
                const remainingStock = getRemainingStock(
                  item.product,
                  item.selectedSize,
                )
                const isMaxQuantity = item.quantity >= item.product.count

                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${index}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex flex-row gap-4 relative">
                      <div className="flex-shrink-0 self-start">
                        <img
                          src={`http://localhost:5077/${item.product.image}`}
                          alt={item.product.enName}
                          className="w-28 h-28 object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold truncate">
                              {item.product.enName}
                            </h3>
                            <p className="text-base md:text-lg font-bold text-gray-900 mt-1">
                              ${item.product.price}
                            </p>

                            <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mt-2">
                              <p className="text-sm text-gray-600">
                                Size:{' '}
                                <span className="font-medium">
                                  {item.selectedSize}
                                </span>
                              </p>
                              <p className="flex items-center gap-2 text-sm text-gray-600">
                                Color:{' '}
                                <div
                                  className={`w-3 h-3 ${convertTextToColor(item.product.color.toLowerCase())} border border-gray-400`}
                                ></div>
                              </p>
                            </div>

                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-500">
                                Stock: {item.product.count} available
                              </p>
                              {remainingStock <= 3 && remainingStock > 0 && (
                                <p className="text-xs text-orange-600">
                                  Only {remainingStock} more can be added
                                </p>
                              )}
                              {isMaxQuantity && (
                                <p className="text-xs text-red-600">
                                  Maximum quantity reached
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            className="p-1 absolute top-0 right-0 transition-all duration-300 hover:scale-115 cursor-pointer"
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedSize)
                            }
                          >
                            <IoMdClose size={20} className="text-black" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                item.product.id,
                                item.selectedSize,
                                item.quantity - 1,
                              )
                            }
                            className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300 hover:scale-110 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-base md:text-lg font-bold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                item.product.id,
                                item.selectedSize,
                                item.quantity + 1,
                              )
                            }
                            disabled={isMaxQuantity}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300 hover:scale-110 cursor-pointer ${
                              isMaxQuantity
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 sticky top-4">
              <h3 className="text-lg md:text-xl font-bold mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm md:text-base">Subtotal:</span>
                  <span className="text-sm md:text-base font-bold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm md:text-base">Shipping:</span>
                  <span className="text-sm md:text-base font-bold">
                    ${shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm md:text-base">Tax:</span>
                  <span className="text-sm md:text-base font-bold">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between">
                  <span className="text-lg md:text-xl font-bold">Total:</span>
                  <span className="text-lg md:text-xl font-bold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="w-full bg-black text-white py-3 px-4 rounded-md font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black cursor-pointer"
                onClick={handleGoToPayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending
                  ? 'Processing...'
                  : 'Go to payment'}
              </button>
            </div>
          </div>
        </div>
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
