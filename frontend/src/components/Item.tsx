import { MdFavoriteBorder } from 'react-icons/md'
import type { Product } from '@/api/types/product'
import { convertTextToColor } from '@/lib/utils'

type ItemProps = {
  shortened?: boolean
  product?: Product
}

export const Item = ({ shortened, product }: ItemProps) => {
  return (
    <div className="bg-white w-full sm:w-[280px] md:w-[300px] lg:w-[280px] xl:w-[250px] 2xl:w-[280px] border-1 border-black cursor-pointer relative">
      <div className="absolute top-2 right-2">
        <div className="bg-white rounded-full p-1 cursor-pointer">
          <MdFavoriteBorder size={24} />
        </div>
      </div>
      <img
        src={`http://localhost:5077/${product?.image}`}
        alt={product?.enName}
        className="w-full h-[280px] object-cover"
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
              className={`w-3 h-3 ${convertTextToColor(product?.color || 'black')}`}
            ></div>
          </div>
        </div>
        <p className="text-sm">Likes: {product?.likes}</p>
        {!shortened && (
          <>
            <ul className="flex flex-row justify-between gap-2">
              <li className="text-sm hover:underline cursor-pointer">S</li>
              <li className="text-sm hover:underline cursor-pointer">M</li>
              <li className="text-sm hover:underline cursor-pointer">L</li>
              <li className="text-sm hover:underline cursor-pointer">XL</li>
              <li className="text-sm hover:underline cursor-pointer">XXL</li>
            </ul>
            <button className="bg-black text-white px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
              Add to Cart
            </button>
          </>
        )}
      </div>
    </div>
  )
}
