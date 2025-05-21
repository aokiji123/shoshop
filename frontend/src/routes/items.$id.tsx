import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/items/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/items/$id"!</div>
}
