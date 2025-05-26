import { Item } from '@/components/Item'
import { convertTextToColor } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MdFavorite } from 'react-icons/md'

export const Route = createFileRoute('/items/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex flex-row gap-8 container mx-auto p-4 md:p-6 lg:p-8">
        <img
          src="https://img.ltwebstatic.com/v4/j/pi/2025/04/24/c9/1745465159c456f4331f34f556672b6ca207f368f9_thumbnail_405x.jpg"
          alt="product"
          className="w-[200px] md:w-[400px]"
        />
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Product 1</h1>
            <p className="text-xl font-bold">200$</p>
            <p className="text-lg">Pick the size:</p>
            <ul className="flex flex-row gap-4">
              <li className="p-2 border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                S
              </li>
              <li className="p-2 border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                M
              </li>
              <li className="p-2 border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                L
              </li>
              <li className="p-2 border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                XL
              </li>
              <li className="p-2 border-1 border-black cursor-pointer hover:bg-black hover:text-white">
                XXL
              </li>
            </ul>
            <p className="text-lg flex flex-row items-center gap-2">
              Color:{' '}
              <div className={`w-5 h-5 ${convertTextToColor('black')}`}></div>
            </p>
            <p className="text-lg">
              Category: <span className="font-bold">T-shirt</span>
            </p>
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div
              key={item}
              className="flex-shrink-0 pb-4"
              onClick={() => {
                navigate({ to: '/items/$id', params: { id: item.toString() } })
              }}
            >
              <Item shortened={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
