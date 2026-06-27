import { useQuery } from '@tanstack/react-query'
import { getGroups } from '../lib/api'

export function GroupsPage() {
  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Grupos</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {groupsQuery.isLoading && <p>Carregando...</p>}
        {groupsQuery.isError && <p className="text-rose-400">Erro ao carregar grupos.</p>}
        {groupsQuery.data && (
          <ul className="space-y-2">
            {groupsQuery.data.map((group) => (
              <li key={group.id} className="rounded-md border border-slate-700 px-3 py-2">
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-slate-400">{group.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
