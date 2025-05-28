import { createFileRoute } from '@tanstack/react-router'
import { RootLayout } from '../components/layout/RootLayout'
import { requireAuth } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    requireAuth()
  },
  component: App,
})

function App() {
  return <RootLayout />
}
