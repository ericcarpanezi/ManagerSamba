import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../lib/api'

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Usuários</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {usersQuery.isLoading && <p>Carregando...</p>}
        {usersQuery.isError && <p className="text-rose-400">Erro ao carregar usuários.</p>}
        {usersQuery.data && (
          <ul className="space-y-2">
            {usersQuery.data.map((user) => (
              <li key={user.id} className="rounded-md border border-slate-700 px-3 py-2">
                <p className="font-medium">{user.displayName}</p>
                <p className="text-sm text-slate-400">
                  {user.samAccountName} · {user.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
