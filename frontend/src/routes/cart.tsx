import { createFileRoute } from '@tanstack/react-router'
import { IoMdClose } from 'react-icons/io'
import Footer from '@/components/Footer'
import { convertTextToColor } from '@/lib/utils'
import { requireAuth } from '@/lib/auth'
import { useCart } from '@/contexts/CartContext'
import { Toast, useToast } from '@/components/Toast'

export const Route = createFileRoute('/cart')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { cart, updateQuantity, removeFromCart, getRemainingStock } = useCart()
  const { toast, showToast, hideToast } = useToast()

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
    const success = updateQuantity(
      productId,
      selectedSize,
      newQuantity,
      (message) => {
        showToast(message, 'error')
      },
    )
  }

  if (cart.items.length === 0) {
    return (
      <>
        <div>
          <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-gray-600">Add some products to get started!</p>
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

  return (
    <>
      <div>
        <div className="flex justify-between">
          <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8 h-[90vh]">
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
                  <div className="w-[600px] flex items-center justify-between">
                    <div className="flex flex-row gap-4">
                      <img
                        src={`http://localhost:5077/${item.product.image}`}
                        alt={item.product.enName}
                        className="w-[100px] h-[100px] object-cover"
                      />
                      <div className="flex flex-col gap-2">
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
                              className={`w-3 h-3 ${convertTextToColor(item.product.color)}`}
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
                        className="bg-black text-white size-6 cursor-pointer hover:scale-105 transition-all duration-300 flex items-center justify-center"
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
                        className={`size-6 cursor-pointer hover:scale-105 transition-all duration-300 flex items-center justify-center ${
                          isMaxQuantity
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed hover:scale-100'
                            : 'bg-black text-white'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <div
                      className="cursor-pointer"
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
              <button className="bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
                Go to payment
              </button>
            </div>
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
