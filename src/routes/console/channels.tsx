// routes/console/channels.tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'
import { Header } from '@/components/layouts/header'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getChannels,
  originateChannel,
  hangupChannel,
  answerChannel,
  ringChannel,
  ringStopChannel,
  holdChannel,
  unholdChannel,
  muteChannel,
  unmuteChannel,
  playMedia,
  sendDTMF,
  getChannelVar,
  setChannelVar,
  type OriginateInput,
} from '@/service/asterisk/channels'

export const Route = createFileRoute('/console/channels')({
  server: { middleware: [authMiddleware] },
  loader: () => getChannels(),
  component: RouteComponent,
})

function RouteComponent() {
  const initialChannels = Route.useLoaderData()
  const queryClient = useQueryClient()

  const channelsQuery = useQuery({
    queryKey: ['channels'],
    queryFn: () => getChannels(),
    initialData: initialChannels,
    refetchInterval: 5000, // chamadas mudam de estado o tempo todo
  })

  const [selected, setSelected] = useState<string | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['channels'] })

  // ---- originar chamada ----
  const [originForm, setOriginForm] = useState<OriginateInput>({
    endpoint: '',
    extension: '',
    context: 'default',
    callerId: '',
    timeout: 30,
  })
  const originateMutation = useMutation({
    mutationFn: () => originateChannel({ data: originForm }),
    onSuccess: invalidate,
  })

  // ---- ações rápidas no canal selecionado ----
  const hangupMutation = useMutation({
    mutationFn: (channelId: string) =>
      hangupChannel({ data: { channelId, reason: 'normal' } }),
    onSuccess: invalidate,
  })
  const answerMutation = useMutation({
    mutationFn: (channelId: string) => answerChannel({ data: channelId }),
    onSuccess: invalidate,
  })
  const ringMutation = useMutation({
    mutationFn: (channelId: string) => ringChannel({ data: channelId }),
  })
  const ringStopMutation = useMutation({
    mutationFn: (channelId: string) => ringStopChannel({ data: channelId }),
  })
  const holdMutation = useMutation({
    mutationFn: (channelId: string) => holdChannel({ data: channelId }),
  })
  const unholdMutation = useMutation({
    mutationFn: (channelId: string) => unholdChannel({ data: channelId }),
  })
  const muteMutation = useMutation({
    mutationFn: (channelId: string) =>
      muteChannel({ data: { channelId, direction: 'both' } }),
  })
  const unmuteMutation = useMutation({
    mutationFn: (channelId: string) =>
      unmuteChannel({ data: { channelId, direction: 'both' } }),
  })

  // ---- tocar mídia ----
  const [mediaUri, setMediaUri] = useState('sound:hello-world')
  const playMutation = useMutation({
    mutationFn: (channelId: string) =>
      playMedia({ data: { channelId, media: mediaUri } }),
  })

  // ---- DTMF ----
  const [dtmf, setDtmf] = useState('')
  const dtmfMutation = useMutation({
    mutationFn: (channelId: string) => sendDTMF({ data: { channelId, dtmf } }),
  })

  // ---- variáveis ----
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const getVarMutation = useMutation({
    mutationFn: (channelId: string) =>
      getChannelVar({ data: { channelId, variable: varName } }),
  })
  const setVarMutation = useMutation({
    mutationFn: (channelId: string) =>
      setChannelVar({ data: { channelId, variable: varName, value: varValue } }),
  })

  const selectedChannel = channelsQuery.data.find((c) => c.id === selected)

  return (
    <div className="p-4 space-y-6">
      <Header />

      {/* ORIGINATE */}
      <section className="border rounded p-4 space-y-2">
        <h2 className="font-semibold">Originar chamada</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="endpoint (ex: PJSIP/1000)"
            value={originForm.endpoint}
            onChange={(e) => setOriginForm((f) => ({ ...f, endpoint: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="extension"
            value={originForm.extension}
            onChange={(e) => setOriginForm((f) => ({ ...f, extension: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="context"
            value={originForm.context}
            onChange={(e) => setOriginForm((f) => ({ ...f, context: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="callerId"
            value={originForm.callerId}
            onChange={(e) => setOriginForm((f) => ({ ...f, callerId: e.target.value }))}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          disabled={originateMutation.isPending || !originForm.endpoint}
          onClick={() => originateMutation.mutate()}
        >
          {originateMutation.isPending ? 'Originando...' : 'Originar'}
        </button>
        {originateMutation.isError && (
          <p className="text-red-600 text-sm">{(originateMutation.error as Error).message}</p>
        )}
      </section>

      <div className="grid grid-cols-3 gap-4">
        {/* LISTA DE CANAIS */}
        <section className="col-span-1 border rounded p-3">
          <h2 className="font-semibold mb-2">Canais ativos ({channelsQuery.data.length})</h2>
          <ul className="space-y-1 text-sm max-h-96 overflow-auto">
            {channelsQuery.data.map((c) => (
              <li key={c.id}>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${selected === c.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setSelected(c.id)}
                >
                  <div className="font-mono text-xs">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.state} · {c.caller?.number || 'sem CID'}
                  </div>
                </button>
              </li>
            ))}
            {channelsQuery.data.length === 0 && (
              <li className="text-gray-400 text-sm">Nenhum canal ativo.</li>
            )}
          </ul>
        </section>

        {/* PAINEL DE CONTROLE */}
        <section className="col-span-2 border rounded p-4 space-y-4">
          {!selectedChannel ? (
            <p className="text-sm text-gray-500">Selecione um canal para controlar.</p>
          ) : (
            <>
              <div>
                <h2 className="font-semibold">{selectedChannel.name}</h2>
                <p className="text-xs text-gray-500 font-mono">{selectedChannel.id}</p>
                <p className="text-sm">Estado: {selectedChannel.state}</p>
              </div>

              {/* Ações básicas */}
              <div className="flex flex-wrap gap-2">
                <button className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                  onClick={() => answerMutation.mutate(selectedChannel.id)}>Atender</button>
                <button className="bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                  onClick={() => ringMutation.mutate(selectedChannel.id)}>Ring</button>
                <button className="bg-yellow-800 text-white px-2 py-1 rounded text-sm"
                  onClick={() => ringStopMutation.mutate(selectedChannel.id)}>Stop Ring</button>
                <button className="bg-indigo-600 text-white px-2 py-1 rounded text-sm"
                  onClick={() => holdMutation.mutate(selectedChannel.id)}>Hold</button>
                <button className="bg-indigo-800 text-white px-2 py-1 rounded text-sm"
                  onClick={() => unholdMutation.mutate(selectedChannel.id)}>Unhold</button>
                <button className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  onClick={() => muteMutation.mutate(selectedChannel.id)}>Mute</button>
                <button className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                  onClick={() => unmuteMutation.mutate(selectedChannel.id)}>Unmute</button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm ml-auto"
                  onClick={() => {
                    hangupMutation.mutate(selectedChannel.id)
                    setSelected(null)
                  }}
                >
                  Desligar
                </button>
              </div>

              {/* Tocar mídia */}
              <div className="flex gap-2 items-center">
                <input
                  className="border rounded px-2 py-1 text-sm flex-1"
                  value={mediaUri}
                  onChange={(e) => setMediaUri(e.target.value)}
                  placeholder="sound:hello-world"
                />
                <button
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  disabled={playMutation.isPending}
                  onClick={() => playMutation.mutate(selectedChannel.id)}
                >
                  Tocar
                </button>
              </div>

              {/* DTMF */}
              <div className="flex gap-2 items-center">
                <input
                  className="border rounded px-2 py-1 text-sm flex-1"
                  value={dtmf}
                  onChange={(e) => setDtmf(e.target.value)}
                  placeholder="dígitos DTMF (ex: 123#)"
                />
                <button
                  className="bg-teal-600 text-white px-3 py-1 rounded text-sm"
                  disabled={dtmfMutation.isPending}
                  onClick={() => dtmfMutation.mutate(selectedChannel.id)}
                >
                  Enviar DTMF
                </button>
              </div>

              {/* Variáveis do canal */}
              <div className="space-y-2 border-t pt-3">
                <h3 className="text-sm font-semibold">Variável do canal</h3>
                <div className="flex gap-2 items-center">
                  <input
                    className="border rounded px-2 py-1 text-sm"
                    placeholder="nome"
                    value={varName}
                    onChange={(e) => setVarName(e.target.value)}
                  />
                  <input
                    className="border rounded px-2 py-1 text-sm"
                    placeholder="valor (para setar)"
                    value={varValue}
                    onChange={(e) => setVarValue(e.target.value)}
                  />
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    onClick={() => getVarMutation.mutate(selectedChannel.id)}
                  >
                    Ler
                  </button>
                  <button
                    className="bg-blue-800 text-white px-2 py-1 rounded text-sm"
                    onClick={() => setVarMutation.mutate(selectedChannel.id)}
                  >
                    Definir
                  </button>
                </div>
                {getVarMutation.data && (
                  <p className="text-sm">
                    valor: <code>{getVarMutation.data.value}</code>
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}