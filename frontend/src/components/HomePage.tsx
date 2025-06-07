import { useNavigate } from '@tanstack/react-router'
import '../styles/HomePage.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-container text-center flex flex-col gap-[36px] items-center justify-center">
      <h2 className="text-7xl font-bold">ShoShop</h2>
      <p className="text-lg w-[550px]">Modern Shopping Experience</p>
      <div
        className="flex flex-row gap-4"
        onClick={() => navigate({ to: '/items' })}
      >
        <button className="bg-white text-black text-[24px] px-4 py-2 w-[300px] cursor-pointer hover:scale-105 transition-all duration-300 rounded-md">
          See Products
        </button>
      </div>
    </div>
  )
}
