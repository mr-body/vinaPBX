// routes/console/asterisk.tsx
import { useState } from 'react'
import { Header } from '@/components/layouts/header'
import { authMiddleware } from '@/middleware/auth'
import {
  getAsteriskInfo,
  getModules,
  getLogChannels,
  loadModule,
  unloadModule,
  reloadModule,
  addLogChannel,
  deleteLogChannel,
  rotateLogChannel,
  getGlobalVar,
  setGlobalVar,
} from '@/service/asterisk/asterisk'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/console/asterisk')({
  server: { middleware: [authMiddleware] },
  loader: async () => {
    const [info, modules, logChannels] = await Promise.all([
      getAsteriskInfo(),
      getModules(),
      getLogChannels(),
    ])
    return { info, modules, logChannels }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { info, modules, logChannels } = Route.useLoaderData()
  const queryClient = useQueryClient()

  // usamos os dados do loader como fallback inicial, mas re-fetch via query
  // pra manter a tabela viva após mutations, sem recarregar a rota inteira
  const modulesQuery = useQuery({
    queryKey: ['asterisk-modules'],
    queryFn: () => getModules(),
    initialData: modules,
  })

  const logsQuery = useQuery({
    queryKey: ['asterisk-logs'],
    queryFn: () => getLogChannels(),
    initialData: logChannels,
  })

  // ---- Módulos ----
  const loadModuleMutation = useMutation({
    mutationFn: (name: string) => loadModule({ data: name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asterisk-modules'] }),
  })
  const unloadModuleMutation = useMutation({
    mutationFn: (name: string) => unloadModule({ data: name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asterisk-modules'] }),
  })
  const reloadModuleMutation = useMutation({
    mutationFn: (name: string) => reloadModule({ data: name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asterisk-modules'] }),
  })

  // ---- Logging ----
  const [newLog, setNewLog] = useState({ name: '', configuration: 'notice,warning,error' })
  const addLogMutation = useMutation({
    mutationFn: () =>
      addLogChannel({ data: { logChannelName: newLog.name, configuration: newLog.configuration } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asterisk-logs'] })
      setNewLog({ name: '', configuration: 'notice,warning,error' })
    },
  })
  const deleteLogMutation = useMutation({
    mutationFn: (name: string) => deleteLogChannel({ data: name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asterisk-logs'] }),
  })
  const rotateLogMutation = useMutation({
    mutationFn: (name: string) => rotateLogChannel({ data: name }),
  })

  // ---- Global variables ----
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [readVarName, setReadVarName] = useState('')

  const setVarMutation = useMutation({
    mutationFn: () => setGlobalVar({ data: { variable: varName, value: varValue } }),
  })

  const readVarMutation = useMutation({
    mutationFn: (name: string) => getGlobalVar({ data: name }),
  })

  return (
    <div className="p-4 space-y-8">
      <Header />

      {/* INFO */}
      <section>
        <h2 className="text-lg font-semibold">Informações do Sistema</h2>
        <ul className="text-sm space-y-1">
          <li>Versão: {info.system?.version}</li>
          <li>Entity ID: {info.system?.entity_id}</li>
          <li>Nome (config): {info.config?.name}</li>
          <li>Idioma padrão: {info.config?.default_language}</li>
          <li>Iniciado em: {info.status?.startup_time}</li>
          <li>Último reload: {info.status?.last_reload_time}</li>
        </ul>
      </section>

      {/* MODULES */}
      <section>
        <h2 className="text-lg font-semibold">Módulos ({modulesQuery.data.length})</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Nome</th>
              <th>Status</th>
              <th>Uso</th>
              <th>Suporte</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {modulesQuery.data.map((m) => (
              <tr key={m.name} className="border-b">
                <td className="py-1">{m.name}</td>
                <td>{m.status}</td>
                <td>{m.use_count}</td>
                <td>{m.support_level}</td>
                <td className="space-x-2">
                  <button
                    className="text-blue-600 disabled:opacity-40"
                    disabled={loadModuleMutation.isPending}
                    onClick={() => loadModuleMutation.mutate(m.name)}
                  >
                    Load
                  </button>
                  <button
                    className="text-orange-600 disabled:opacity-40"
                    disabled={reloadModuleMutation.isPending}
                    onClick={() => reloadModuleMutation.mutate(m.name)}
                  >
                    Reload
                  </button>
                  <button
                    className="text-red-600 disabled:opacity-40"
                    disabled={unloadModuleMutation.isPending}
                    onClick={() => unloadModuleMutation.mutate(m.name)}
                  >
                    Unload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* LOGGING */}
      <section>
        <h2 className="text-lg font-semibold">Log Channels</h2>

        <div className="flex gap-2 mb-3">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="nome do canal (ex: mylog)"
            value={newLog.name}
            onChange={(e) => setNewLog((v) => ({ ...v, name: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="níveis (ex: notice,warning,error)"
            value={newLog.configuration}
            onChange={(e) => setNewLog((v) => ({ ...v, configuration: e.target.value }))}
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            disabled={addLogMutation.isPending || !newLog.name}
            onClick={() => addLogMutation.mutate()}
          >
            Adicionar
          </button>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th>Canal</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Configuração</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {logsQuery.data.map((l) => (
              <tr key={l.channel} className="border-b">
                <td>{l.channel}</td>
                <td>{l.type}</td>
                <td>{l.status}</td>
                <td>{l.configuration}</td>
                <td className="space-x-2">
                  <button
                    className="text-orange-600"
                    onClick={() => rotateLogMutation.mutate(l.channel)}
                  >
                    Rotate
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => deleteLogMutation.mutate(l.channel)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* GLOBAL VARIABLES */}
      <section className="border rounded p-4 space-y-4">
        <h2 className="text-lg font-semibold">Variáveis Globais</h2>

        <div className="flex gap-2 items-center">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="nome da variável"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="valor"
            value={varValue}
            onChange={(e) => setVarValue(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            disabled={setVarMutation.isPending || !varName}
            onClick={() => setVarMutation.mutate()}
          >
            Definir
          </button>
          {setVarMutation.isSuccess && (
            <span className="text-green-600 text-sm">✓ salva</span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="nome da variável para ler"
            value={readVarName}
            onChange={(e) => setReadVarName(e.target.value)}
          />
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            disabled={readVarMutation.isPending || !readVarName}
            onClick={() => readVarMutation.mutate(readVarName)}
          >
            Consultar
          </button>
          {readVarMutation.data && (
            <span className="text-sm">
              valor: <code>{readVarMutation.data.value}</code>
            </span>
          )}
          {readVarMutation.isError && (
            <span className="text-red-600 text-sm">variável não encontrada</span>
          )}
        </div>
      </section>
    </div>
  )
}