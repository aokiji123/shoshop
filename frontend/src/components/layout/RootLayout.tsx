import { Outlet } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { HomePage } from '../HomePage'

const Background = lazy(() =>
  import('../Background').then((mod) => ({ default: mod.Background })),
)

export function RootLayout() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-2 border-t-black border-gray-300 rounded-full animate-spin"></div>
          </div>
        }
      >
        <Background />
      </Suspense>
      <main>
        <HomePage />

        <Outlet />
      </main>
    </>
  )
}
