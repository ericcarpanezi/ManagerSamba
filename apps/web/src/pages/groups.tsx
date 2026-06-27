import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addGroupMember,
  createGroup,
  getGroups,
  removeGroupMember,
} from '../lib/api'

export function GroupsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberName, setMemberName] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      setFeedback('Grupo criado com sucesso.')
      setError(null)
      setName('')
      setDescription('')
      void queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
    onError: () => setError('Falha ao criar grupo.'),
  })

  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, memberName }: { groupId: string; memberName: string }) =>
      addGroupMember(groupId, memberName),
    onSuccess: () => {
      setFeedback('Membro adicionado ao grupo.')
      setError(null)
      setMemberName('')
      void queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
    onError: () => setError('Falha ao adicionar membro.'),
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, memberName }: { groupId: string; memberName: string }) =>
      removeGroupMember(groupId, memberName),
    onSuccess: () => {
      setFeedback('Membro removido do grupo.')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
    onError: () => setError('Falha ao remover membro.'),
  })

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createGroupMutation.mutate({
      name,
      description: description || undefined,
    })
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Grupos</h2>
      <form className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 md:grid-cols-2" onSubmit={handleCreate}>
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Nome do grupo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Descrição"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 md:col-span-2"
          disabled={createGroupMutation.isPending}
        >
          {createGroupMutation.isPending ? 'Criando...' : 'Criar grupo'}
        </button>
      </form>

      {(feedback || error) && (
        <div className={`rounded-md border px-3 py-2 text-sm ${error ? 'border-rose-500/40 text-rose-300' : 'border-emerald-500/40 text-emerald-300'}`}>
          {error ?? feedback}
        </div>
      )}

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {groupsQuery.isLoading && <p>Carregando...</p>}
        {groupsQuery.isError && <p className="text-rose-400">Erro ao carregar grupos.</p>}
        {groupsQuery.data && (
          <ul className="space-y-2">
            {groupsQuery.data.map((group) => (
              <li key={group.id} className="space-y-3 rounded-md border border-slate-700 px-3 py-3">
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-slate-400">{group.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="min-w-56 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    placeholder="Membro (sAMAccountName)"
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-md bg-emerald-600 px-2 py-1 text-xs hover:bg-emerald-500"
                    onClick={() => addMemberMutation.mutate({ groupId: group.name, memberName })}
                  >
                    Adicionar membro
                  </button>
                </div>

                {group.members.length > 0 && (
                  <ul className="space-y-1">
                    {group.members.map((member) => (
                      <li key={member} className="flex items-center justify-between rounded-md border border-slate-700 px-2 py-1 text-xs">
                        <span>{member}</span>
                        <button
                          type="button"
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs hover:bg-rose-600"
                          onClick={() => removeMemberMutation.mutate({ groupId: group.name, memberName: member })}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
