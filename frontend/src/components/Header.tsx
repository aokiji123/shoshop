import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  MdFavorite,
  MdFavoriteBorder,
  MdOutlineShoppingCart,
  MdShoppingCart,
} from 'react-icons/md'

export default function Header() {
  const [isCartHovered, setIsCartHovered] = useState(false)
  const [isFavoritesHovered, setIsFavoritesHovered] = useState(false)

  return (
    <header className="h-[55px] flex px-4 gap-2 bg-white/80 text-black items-center justify-between border-b-1 border-b-black">
      <nav className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row gap-8 items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold transition-all duration-200 hover:scale-110">
              ShoShop
            </h1>
          </Link>
          <Link to="/items">
            <h1 className="text-lg font-bold transition-all duration-200 hover:scale-110">
              Products
            </h1>
          </Link>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="px-2 font-bold">
            <Link to="/cart">
              <div
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
                className="transition-all duration-200 hover:scale-110"
              >
                {isCartHovered ? (
                  <MdShoppingCart size={28} />
                ) : (
                  <MdOutlineShoppingCart size={28} />
                )}
              </div>
            </Link>
          </div>
          <div className="px-2 font-bold">
            <Link to="/favorites">
              <div
                onMouseEnter={() => setIsFavoritesHovered(true)}
                onMouseLeave={() => setIsFavoritesHovered(false)}
                className="transition-all duration-200 hover:scale-110"
              >
                {isFavoritesHovered ? (
                  <MdFavorite size={28} />
                ) : (
                  <MdFavoriteBorder size={28} />
                )}
              </div>
            </Link>
          </div>
          <div className="px-2 font-bold transition-all duration-200 hover:scale-110">
            <Link to="/profile">
              <div>
                <img
                  src="https://github.com/shadcn.png"
                  alt="profile"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
