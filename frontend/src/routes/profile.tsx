import Footer from '@/components/Footer'
import { createFileRoute } from '@tanstack/react-router'
import { MdEdit } from 'react-icons/md'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8 items-center h-[90vh] justify-center">
        <div className="relative flex items-center justify-center">
          <img
            src="https://github.com/shadcn.png"
            className="rounded-full w-[200px] h-[200px]"
            alt="Profile"
          />
          <div className="absolute top-3 right-3 bg-white border-1 border-black rounded-full p-2 cursor-pointer hover:scale-105 transition-all duration-300">
            <MdEdit />
          </div>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <p className="text-2xl font-bold">John Doe</p>
          <p className="text-lg">john.doe@example.com</p>
        </div>
        <div className="w-[300px] flex flex-col gap-2">
          <button className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
            Edit user
          </button>
          <button className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
            Logout
          </button>
          <button className="bg-red-500 w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300">
            Delete account
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
