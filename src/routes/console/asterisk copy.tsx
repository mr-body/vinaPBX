import { Header } from '@/components/layouts/header'
import { authMiddleware } from '@/middleware/auth'
import { getAsteriskInfo, getModules } from '@/service/asterisk/asterisk'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/console/asterisk copy')({
  server: { middleware: [authMiddleware] },
  loader: async () => {
    const [info, modules] = await Promise.all([
      getAsteriskInfo(),
      getModules(),
    ])
    return { info, modules }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { info, modules } = Route.useLoaderData()

  return (
    <div>
      <Header />

      <h2 className="text-lg font-semibold mt-4">Informações do Sistema</h2>
      <ul className="text-sm space-y-1">
        <li>Versão: {info.system?.version}</li>
        <li>Entity ID: {info.system?.entity_id}</li>
        <li>Nome (config): {info.config?.name}</li>
        <li>Idioma padrão: {info.config?.default_language}</li>
        <li>Iniciado em: {info.status?.startup_time}</li>
        <li>Último reload: {info.status?.last_reload_time}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-4">Módulos ({modules.length})</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-1">Nome</th>
            <th>Status</th>
            <th>Uso</th>
            <th>Suporte</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.name} className="border-b">
              <td className="py-1">{m.name}</td>
              <td>{m.status}</td>
              <td>{m.use_count}</td>
              <td>{m.support_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}