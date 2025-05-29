import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Footer from '@/components/Footer'
import { Item } from '@/components/Item'
import { requireAuth } from '@/lib/auth'
import { useProducts } from '@/api/queries/useProduct'

export const Route = createFileRoute('/items/')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: products, isLoading, error } = useProducts()

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
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-[70%] p-2 border-1 border-black outline-none"
          />
          <div className="flex flex-row gap-4">
            <select name="" id="" className="p-2 border-1 border-black">
              <option value="all">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
            <select name="" id="" className="p-2 border-1 border-black">
              <option value="all">Size</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
            <select name="" id="" className="p-2 border-1 border-black">
              <option value="all">Category</option>
              <option value="t-shirt">T-shirt</option>
              <option value="shirt">Shirt</option>
              <option value="pants">Pants</option>
              <option value="shorts">Shorts</option>
              <option value="dress">Dress</option>
              <option value="jacket">Jacket</option>
              <option value="coat">Coat</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row gap-4 flex-wrap">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                onClick={() =>
                  navigate({ to: '/items/$id', params: { id: product.id } })
                }
              >
                <Item product={product} />
              </div>
            ))
          ) : (
            <div className="text-center w-full">No products found</div>
          )}
        </div>
        {products && products.length > 0 && (
          <div className="flex flex-row items-center justify-center mt-4">
            <ul className="flex flex-row gap-4">
              <li className="text-lg hover:underline cursor-pointer">1</li>
              <li className="text-lg hover:underline cursor-pointer">2</li>
              <li className="text-lg hover:underline cursor-pointer">3</li>
              <li className="text-lg hover:underline cursor-pointer">4</li>
              <li className="text-lg hover:underline cursor-pointer">5</li>
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
