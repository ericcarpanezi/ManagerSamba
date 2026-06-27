import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../lib/api'

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
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
