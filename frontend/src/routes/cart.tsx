import Footer from '@/components/Footer'
import { convertTextToColor } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { IoMdClose } from 'react-icons/io'

export const Route = createFileRoute('/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8 h-[90vh]">
          <h2 className="text-2xl font-bold mb-[24px]">Cart</h2>
          {[1, 2, 3, 4].map((item) => (
            <>
              <div className="flex flex-col gap-4 mb-[12px]">
                <div className="w-[600px] flex items-center justify-between">
                  <div className="flex flex-row gap-4">
                    <img src="https://placehold.co/100x100" alt="Product" />
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-bold">Product Name {item}</p>
                      <p className="text-lg font-bold">$100</p>
                      <div className="flex flex-row gap-2">
                        <p className="border-r-1 border-r-black pr-2">
                          Size: M
                        </p>
                        <p className="flex items-center flex-row gap-2">
                          Color:{' '}
                          <div
                            className={`w-3 h-3 ${convertTextToColor('black')}`}
                          ></div>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center flex-row gap-4">
                    <button className="bg-black text-white size-6 cursor-pointer hover:scale-105 transition-all duration-300">
                      -
                    </button>
                    <p className="text-lg font-bold">1</p>
                    <button className="bg-black text-white size-6 cursor-pointer hover:scale-105 transition-all duration-300">
                      +
                    </button>
                  </div>
                  <div className="cursor-pointer">
                    <IoMdClose size={24} />
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
        <div className="border-x-1 border-x-black p-4 w-[400px]">
          <div className="flex flex-col gap-4 mb-[48px]">
            <div className="flex flex-col gap-1">
              <h2 className="text-md font-bold">Subtotal:</h2>
              <p className="text-xl font-bold">$100</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-md font-bold">Shipping:</p>
              <p className="text-xl font-bold">$10</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-md font-bold">Tax:</p>
              <p className="text-xl font-bold">$10</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-[24px]">
            <p className="text-2xl font-bold">Total:</p>
            <p className="text-3xl font-bold">$120</p>
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
  )
}
