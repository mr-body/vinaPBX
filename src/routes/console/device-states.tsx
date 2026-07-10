// routes/console/device-states.tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'
import { Header } from '@/components/layouts/header'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDeviceStates,
  updateDeviceState,
  deleteDeviceState,
} from '@/service/asterisk/deviceStates'

const STATES = [
  'NOT_INUSE', 'INUSE', 'BUSY', 'INVALID',
  'UNAVAILABLE', 'RINGING', 'RINGINUSE', 'ONHOLD',
] as const

export const Route = createFileRoute('/console/device-states')({
  server: { middleware: [authMiddleware] },
  loader: () => getDeviceStates(),
  component: RouteComponent,
})

function RouteComponent() {
  const initial = Route.useLoaderData()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['device-states'],
    queryFn: () => getDeviceStates(),
    initialData: initial,
  })

  const [form, setForm] = useState<{ deviceName: string; deviceState: typeof STATES[number] }>({
    deviceName: '',
    deviceState: 'NOT_INUSE',
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['device-states'] })

  const updateMutation = useMutation({
    mutationFn: () => updateDeviceState({ data: form }),
    onSuccess: () => {
      invalidate()
      setForm({ deviceName: '', deviceState: 'NOT_INUSE' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (deviceName: string) => deleteDeviceState({ data: deviceName }),
    onSuccess: invalidate,
  })

  return (
    <div className="p-4 space-y-6">
      <Header />

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-semibold">Criar / Atualizar device state</h2>
        <div className="flex gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="nome (ex: Custom:1000)"
            value={form.deviceName}
            onChange={(e) => setForm((f) => ({ ...f, deviceName: e.target.value }))}
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={form.deviceState}
            onChange={(e) =>
              setForm((f) => ({ ...f, deviceState: e.target.value as typeof STATES[number] }))
            }
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            disabled={updateMutation.isPending || !form.deviceName}
            onClick={() => updateMutation.mutate()}
          >
            Salvar
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Device states ({query.data.length})</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th>Nome</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {query.data.map((d) => (
              <tr key={d.name} className="border-b">
                <td className="font-mono">{d.name}</td>
                <td>{d.state}</td>
                <td>
                  <button
                    className="text-red-600 text-sm"
                    onClick={() => deleteMutation.mutate(d.name)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}