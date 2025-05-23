import { useNavigate } from '@tanstack/react-router'
import '../styles/HomePage.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-container text-center flex flex-col gap-[36px] items-center justify-center">
      <h2 className="text-7xl font-bold">Modern Shopping Experience</h2>
      <p className="text-lg w-[550px]">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>
      <div
        className="flex flex-row gap-4"
        onClick={() => navigate({ to: '/items' })}
      >
        <button className="bg-white text-black text-[24px] px-4 py-2 w-[300px] cursor-pointer hover:scale-105 transition-all duration-300">
          See Products
        </button>
      </div>
    </div>
  )
}
