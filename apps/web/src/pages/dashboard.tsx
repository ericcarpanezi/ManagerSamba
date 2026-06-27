import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../lib/api'

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">Visao geral do ambiente Samba4 AD e saude da API.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Objetos</p>
          <p className="mt-3 text-2xl font-semibold text-indigo-300">AD</p>
          <p className="mt-1 text-sm text-slate-400">Usuarios, grupos, OUs e computadores</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Controle</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">RBAC</p>
          <p className="mt-1 text-sm text-slate-400">Permissoes por perfil e governanca</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Confianca</p>
          <p className="mt-3 text-2xl font-semibold text-amber-300">Audit</p>
          <p className="mt-1 text-sm text-slate-400">Trilha completa de alteracoes</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Status da API</p>
        {healthQuery.isLoading && <p className="mt-2">Carregando...</p>}
        {healthQuery.isError && <p className="mt-2 text-rose-400">Não foi possível conectar à API.</p>}
        {healthQuery.data && (
          <p className="mt-2">
            <span className="font-medium">Status:</span> {healthQuery.data.status} ({healthQuery.data.timestamp})
          </p>
        )}
      </div>
    </section>
  )
}
