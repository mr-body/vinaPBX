import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ok')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ok"!</div>
}
