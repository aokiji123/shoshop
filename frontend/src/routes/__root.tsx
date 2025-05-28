import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

function RootComponent() {
  const location = useLocation()
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      {!isAuthPage && <Header />}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
