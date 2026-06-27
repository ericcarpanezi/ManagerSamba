import { useQuery } from '@tanstack/react-query'
import { getComputers } from '../lib/api'

export function ComputersPage() {
  const computersQuery = useQuery({
    queryKey: ['computers'],
    queryFn: getComputers,
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Computadores</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {computersQuery.isLoading && <p>Carregando...</p>}
        {computersQuery.isError && <p className="text-rose-400">Erro ao carregar computadores.</p>}
        {computersQuery.data && (
          <ul className="space-y-2">
            {computersQuery.data.map((computer) => (
              <li key={computer.id} className="rounded-md border border-slate-700 px-3 py-2">
                <p className="font-medium">{computer.name}</p>
                <p className="text-sm text-slate-400">
                  {computer.operatingSystem} · {computer.ouDn}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
