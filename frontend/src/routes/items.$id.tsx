import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MdFavorite } from 'react-icons/md'
import Footer from '@/components/Footer'
import { Item } from '@/components/Item'
import { convertTextToColor } from '@/lib/utils'
import { requireAuth } from '@/lib/auth'
import { usePopularProducts, useProduct } from '@/api/queries/useProduct'

export const Route = createFileRoute('/items/$id')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { id } = Route.useParams()

  const { data: product, isLoading, error } = useProduct(id)
  const { data: popularProducts } = usePopularProducts(10)

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

  return (
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
            <p className="text-lg">Pick the size:</p>
            <ul className="flex flex-row gap-4">
              <li className="p-2 min-w-[40px] h-[40px] flex items-center justify-center border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                S
              </li>
              <li className="p-2 min-w-[40px] h-[40px] flex items-center justify-center border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                M
              </li>
              <li className="p-2 min-w-[40px] h-[40px] flex items-center justify-center border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                L
              </li>
              <li className="p-2 min-w-[40px] h-[40px] flex items-center justify-center border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                XL
              </li>
              <li className="p-2 min-w-[40px] h-[40px] flex items-center justify-center border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                XXL
              </li>
            </ul>
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
            <button className="bg-black text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
              Add to Cart
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
            <div className="text-center w-full">No popular products found</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
