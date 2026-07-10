// routes/console/index.tsx
import { useState } from 'react'
import {
  getEndpoints,
  sendMessage,
  sendMessageToEndpoint,
  referEndpoint,
  referToEndpoint,
} from '@/service/asterisk/endpoints'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'
import { Header } from '@/components/layouts/header'

export const Route = createFileRoute('/console/')({
  server: { middleware: [authMiddleware] },
  component: App,
})

function App() {
  const queryClient = useQueryClient()
  const { data, error, isLoading } = useQuery({
    queryKey: ['endpoints'],
    queryFn: () => getEndpoints(),
    refetchInterval: 10_000, // estado dos endpoints muda; atualiza sozinho
  })

  const [form, setForm] = useState({
    to: '',
    from: '',
    body: '',
    referTo: '',
  })

  const sendMessageMutation = useMutation({
    mutationFn: () =>
      sendMessage({ data: { to: form.to, from: form.from, body: form.body } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['endpoints'] }),
  })

  const referMutation = useMutation({
    mutationFn: () =>
      referEndpoint({
        data: { to: form.to, from: form.from, refer_to: form.referTo },
      }),
  })

  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="p-4 space-y-6">
      <Header />

      <section>
        <h2 className="font-semibold mb-2">Endpoints</h2>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th>Tecnologia</th>
                <th>Recurso</th>
                <th>Estado</th>
                <th>Canais ativos</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((e) => (
                <tr key={`${e.technology}/${e.resource}`} className="border-b">
                  <td>{e.technology}</td>
                  <td>{e.resource}</td>
                  <td>
                    <span
                      className={
                        e.state === 'online'
                          ? 'text-green-600'
                          : e.state === 'offline'
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }
                    >
                      {e.state}
                    </span>
                  </td>
                  <td>{e.channel_ids?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-2 border rounded p-4">
        <h2 className="font-semibold">Enviar mensagem / Transferir (refer)</h2>

        <div className="grid grid-cols-2 gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="from (ex: pjsip/1000)"
            value={form.from}
            onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="to (ex: pjsip/1001)"
            value={form.to}
            onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1 col-span-2"
            placeholder="mensagem"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1 col-span-2"
            placeholder="refer_to (destino da transferência)"
            value={form.referTo}
            onChange={(e) => setForm((f) => ({ ...f, referTo: e.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={sendMessageMutation.isPending}
            onClick={() => sendMessageMutation.mutate()}
          >
            {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
          </button>

          <button
            className="bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={referMutation.isPending}
            onClick={() => referMutation.mutate()}
          >
            {referMutation.isPending ? 'Transferindo...' : 'Transferir (refer)'}
          </button>
        </div>

        {sendMessageMutation.isError && (
          <p className="text-red-600 text-sm">
            {(sendMessageMutation.error as Error).message}
          </p>
        )}
        {referMutation.isError && (
          <p className="text-red-600 text-sm">
            {(referMutation.error as Error).message}
          </p>
        )}
        {sendMessageMutation.isSuccess && (
          <p className="text-green-600 text-sm">Mensagem enviada.</p>
        )}
        {referMutation.isSuccess && (
          <p className="text-green-600 text-sm">Transferência solicitada.</p>
        )}
      </section>
    </div>
  )
}