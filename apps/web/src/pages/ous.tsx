import { useQuery } from '@tanstack/react-query'
import { getOuTree } from '../lib/api'

export function OusPage() {
  const ousQuery = useQuery({
    queryKey: ['ous'],
    queryFn: getOuTree,
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Estrutura de OUs</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {ousQuery.isLoading && <p>Carregando...</p>}
        {ousQuery.isError && <p className="text-rose-400">Erro ao carregar OUs.</p>}
        {ousQuery.data && (
          <ul className="space-y-2">
            {ousQuery.data.map((ou) => (
              <li key={ou.id} className="rounded-md border border-slate-700 px-3 py-2">
                <p className="font-medium">{ou.name}</p>
                <p className="text-sm text-slate-400">{ou.dn}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
