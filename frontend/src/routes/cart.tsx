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
        clearCart() // Clear the cart after successful order
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
        <div>
          <div className="flex flex-col items-center justify-center min-h-[90vh] gap-4">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-gray-600">Add some products to get started!</p>
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
      <div>
        <div className="flex justify-between min-h-[90vh]">
          <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
            <h2 className="text-2xl font-bold mb-[24px]">Cart</h2>
            {cart.items.map((item, index) => {
              const remainingStock = getRemainingStock(
                item.product,
                item.selectedSize,
              )
              const isMaxQuantity = item.quantity >= item.product.count

              return (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${index}`}
                  className="flex flex-col gap-4 mb-[12px]"
                >
                  <div className="w-[800px] flex items-center justify-between">
                    <div className="flex flex-row gap-4">
                      <img
                        src={`http://localhost:5077/${item.product.image}`}
                        alt={item.product.enName}
                        className="w-[100px] h-[100px] object-cover"
                      />
                      <div className="flex flex-col gap-2 w-[400px]">
                        <p className="text-lg font-bold">
                          {item.product.enName}
                        </p>
                        <p className="text-lg font-bold">
                          ${item.product.price}
                        </p>
                        <div className="flex flex-row gap-2">
                          <p className="border-r-1 border-r-black pr-2">
                            Size: {item.selectedSize}
                          </p>
                          <p className="flex items-center flex-row gap-2">
                            Color:{' '}
                            <div
                              className={`w-3 h-3 ${convertTextToColor(item.product.color.toLowerCase())} border-1 border-black`}
                            ></div>
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-600">
                            Stock: {item.product.count} available
                          </p>
                          {remainingStock <= 3 && remainingStock > 0 && (
                            <p className="text-sm text-orange-600">
                              Only {remainingStock} more can be added
                            </p>
                          )}
                          {isMaxQuantity && (
                            <p className="text-sm text-red-600">
                              Maximum quantity reached
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center flex-row gap-4">
                      <button
                        onClick={() =>
                          handleQuantityUpdate(
                            item.product.id,
                            item.selectedSize,
                            item.quantity - 1,
                          )
                        }
                        className="bg-black text-white size-6 cursor-pointer hover:scale-105 transition-all duration-300 flex items-center justify-center rounded-md"
                      >
                        -
                      </button>
                      <p className="text-lg font-bold">{item.quantity}</p>
                      <button
                        onClick={() =>
                          handleQuantityUpdate(
                            item.product.id,
                            item.selectedSize,
                            item.quantity + 1,
                          )
                        }
                        disabled={isMaxQuantity}
                        className={`size-6 cursor-pointer hover:scale-105 transition-all duration-300 flex items-center justify-center rounded-md ${
                          isMaxQuantity
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed hover:scale-100'
                            : 'bg-black text-white'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <div
                      className="cursor-pointer transition-all duration-300 hover:scale-110"
                      onClick={() =>
                        removeFromCart(item.product.id, item.selectedSize)
                      }
                    >
                      <IoMdClose size={24} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-x-1 border-x-black p-4 w-[400px]">
            <div className="flex flex-col gap-4 mb-[48px]">
              <div className="flex flex-col gap-1">
                <h2 className="text-md font-bold">Subtotal:</h2>
                <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-md font-bold">Shipping:</p>
                <p className="text-xl font-bold">${shipping.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-md font-bold">Tax:</p>
                <p className="text-xl font-bold">${tax.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-[24px]">
              <p className="text-2xl font-bold">Total:</p>
              <p className="text-3xl font-bold">${total.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-md"
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
