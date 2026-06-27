import { useQuery } from '@tanstack/react-query'
import { getAuditEvents } from '../lib/api'

export function AuditPage() {
  const auditQuery = useQuery({
    queryKey: ['audit-events'],
    queryFn: getAuditEvents,
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Auditoria</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {auditQuery.isLoading && <p>Carregando...</p>}
        {auditQuery.isError && <p className="text-rose-400">Erro ao carregar eventos.</p>}
        {auditQuery.data && (
          <ul className="space-y-2">
            {auditQuery.data.map((event) => (
              <li key={event.id} className="rounded-md border border-slate-700 px-3 py-2">
                <p className="font-medium">{event.action}</p>
                <p className="text-sm text-slate-400">
                  {event.actor} → {event.target}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
