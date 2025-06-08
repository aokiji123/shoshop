import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MdOutlineShoppingCart, MdShoppingCart } from 'react-icons/md'
import { useCurrentUser } from '@/api/queries/useAuth'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [isCartHovered, setIsCartHovered] = useState(false)

  const { data: user } = useCurrentUser()
  const { cart } = useCart()

  return (
    <header className="h-[55px] flex px-4 gap-2 items-center justify-between border-b-1 border-b-black bg-black text-white">
      <nav className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row gap-4 sm:gap-8 items-center">
          <Link to="/">
            <h1 className="text-xl sm:text-2xl font-bold transition-all duration-200 hover:scale-110">
              ShoShop
            </h1>
          </Link>
          <Link to="/items">
            <h1 className="text-md sm:text-lg font-bold transition-all duration-200 hover:scale-110">
              Products
            </h1>
          </Link>
          {user?.isAdmin && (
            <Link to="/orders">
              <h1 className="text-md sm:text-lg font-bold transition-all duration-200 hover:scale-110">
                Orders
              </h1>
            </Link>
          )}
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="px-2 font-bold relative">
            <Link to="/cart">
              <div
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
                className="transition-all duration-200 hover:scale-110 relative"
              >
                {isCartHovered ? (
                  <MdShoppingCart size={28} />
                ) : (
                  <MdOutlineShoppingCart size={28} />
                )}
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.itemCount > 99 ? '99+' : cart.itemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
          <div className="px-2 font-bold transition-all duration-200 hover:scale-110">
            <Link to="/profile">
              <img
                src={
                  user?.image
                    ? `http://localhost:5077/${user.image}`
                    : 'https://placehold.co/40x40'
                }
                alt=""
                className="w-8 h-8 rounded-full"
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
