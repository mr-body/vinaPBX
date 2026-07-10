// routes/console/events.tsx
import { Header } from '@/components/layouts/header';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

interface AriEvent {
  event: { type: string; timestamp: string; application: string;[k: string]: any }
  objects?: unknown
}

export const Route = createFileRoute('/console/events')({
  component: RouteComponent,
})

function RouteComponent() {
  const [events, setEvents] = useState<AriEvent[]>([])
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource('/api/events')
    esRef.current = es

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.onmessage = (msg) => {
      const data: AriEvent = JSON.parse(msg.data)
      setEvents((prev) => [data, ...prev].slice(0, 200)) // mantém últimos 200
    }

    return () => es.close()
  }, [])

  return (
    <div className="p-4">
      <Header />
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-semibold">Eventos Asterisk</h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
        >
          {connected ? 'conectado' : 'desconectado'}
        </span>
      </div>

      <div className="space-y-1 font-mono text-xs">
        {events.map((e, i) => (
          <details key={i} className="border-b py-1">
            <summary className="cursor-pointer">
              <span className="text-gray-500">{e.event.timestamp}</span>{' '}
              <span className="font-semibold">{e.event.type}</span>
            </summary>
            <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded mt-1">
              {JSON.stringify(e.event, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </div>
  )
}