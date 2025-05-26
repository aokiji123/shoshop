import { convertTextToColor } from '@/lib/utils'
import { MdFavoriteBorder } from 'react-icons/md'

export const Item = ({ shortened }: { shortened?: boolean }) => {
  return (
    <div className="bg-white w-full sm:w-[280px] md:w-[300px] lg:w-[280px] xl:w-[250px] 2xl:w-[280px] border-1 border-black cursor-pointer relative">
      <div className="absolute top-2 right-2">
        <div className="bg-white rounded-full p-1 cursor-pointer">
          <MdFavoriteBorder size={24} />
        </div>
      </div>
      <img
        src="https://img.ltwebstatic.com/v4/j/pi/2025/04/24/c9/1745465159c456f4331f34f556672b6ca207f368f9_thumbnail_405x.jpg"
        alt="product"
        className="w-full h-[280px] object-cover"
      />
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-lg font-bold">Product 1</h3>
        <div className="flex flex-row items-center justify-between gap-2">
          <p className="text-sm">
            Price: <span className="font-bold">$100</span>
          </p>
          <div className="flex flex-row items-center justify-between gap-2">
            <p className="text-sm">Color: </p>
            <div className={`w-3 h-3 ${convertTextToColor('black')}`}></div>
          </div>
        </div>
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
