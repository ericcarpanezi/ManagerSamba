import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  getUsers,
  moveUser,
  resetUserPassword,
  setUserEnabled,
  updateUser,
} from '../lib/api'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const [targetUser, setTargetUser] = useState('')
  const [targetDisplayName, setTargetDisplayName] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [targetOuDn, setTargetOuDn] = useState('')
  const [targetPassword, setTargetPassword] = useState('')

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setFeedback('Usuário criado com sucesso.')
      setError(null)
      setNewUsername('')
      setNewPassword('')
      setNewDisplayName('')
      setNewEmail('')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      setError('Falha ao criar usuário.')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { displayName?: string; email?: string } }) => updateUser(id, payload),
    onSuccess: () => {
      setFeedback('Usuário atualizado.')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => setError('Falha ao atualizar usuário.'),
  })

  const enableDisableMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => setUserEnabled(id, enabled),
    onSuccess: (_data, variables) => {
      setFeedback(`Usuário ${variables.enabled ? 'habilitado' : 'desabilitado'} com sucesso.`)
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => setError('Falha ao alterar status do usuário.'),
  })

  const moveUserMutation = useMutation({
    mutationFn: ({ id, targetOuDn }: { id: string; targetOuDn: string }) => moveUser(id, { targetOuDn }),
    onSuccess: () => {
      setFeedback('Usuário movido com sucesso.')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => setError('Falha ao mover usuário.'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword?: string }) => resetUserPassword(id, { newPassword, forceChangeAtNextLogon: true }),
    onSuccess: () => {
      setFeedback('Reset de senha solicitado.')
      setError(null)
      setTargetPassword('')
    },
    onError: () => setError('Falha ao resetar senha.'),
  })

  const handleCreateUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createUserMutation.mutate({
      username: newUsername,
      password: newPassword,
      displayName: newDisplayName || undefined,
      email: newEmail || undefined,
    })
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Usuários</h2>
      <form className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 md:grid-cols-2" onSubmit={handleCreateUser}>
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Novo usuário (sAMAccountName)"
          value={newUsername}
          onChange={(event) => setNewUsername(event.target.value)}
          required
        />
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Senha inicial"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Display name"
          value={newDisplayName}
          onChange={(event) => setNewDisplayName(event.target.value)}
        />
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 md:col-span-2"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>

      {(feedback || error) && (
        <div className={`rounded-md border px-3 py-2 text-sm ${error ? 'border-rose-500/40 text-rose-300' : 'border-emerald-500/40 text-emerald-300'}`}>
          {error ?? feedback}
        </div>
      )}

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {usersQuery.isLoading && <p>Carregando...</p>}
        {usersQuery.isError && <p className="text-rose-400">Erro ao carregar usuários.</p>}
        {usersQuery.data && (
          <ul className="space-y-2">
            {usersQuery.data.map((user) => (
              <li key={user.id} className="space-y-3 rounded-md border border-slate-700 px-3 py-3">
                <p className="font-medium">
                  {user.displayName} {!user.enabled && <span className="text-xs text-rose-300">(desabilitado)</span>}
                </p>
                <p className="text-sm text-slate-400">
                  {user.samAccountName} · {user.email}
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    placeholder="Novo display name"
                    value={targetUser === user.id ? targetDisplayName : ''}
                    onChange={(event) => {
                      setTargetUser(user.id)
                      setTargetDisplayName(event.target.value)
                    }}
                  />
                  <input
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    placeholder="Novo email"
                    value={targetUser === user.id ? targetEmail : ''}
                    onChange={(event) => {
                      setTargetUser(user.id)
                      setTargetEmail(event.target.value)
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-md bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                    onClick={() =>
                      updateUserMutation.mutate({
                        id: user.samAccountName,
                        payload: {
                          displayName: targetUser === user.id ? targetDisplayName || undefined : undefined,
                          email: targetUser === user.id ? targetEmail || undefined : undefined,
                        },
                      })
                    }
                  >
                    Atualizar
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-4">
                  <button
                    type="button"
                    className="rounded-md bg-emerald-600 px-2 py-1 text-xs hover:bg-emerald-500"
                    onClick={() => enableDisableMutation.mutate({ id: user.samAccountName, enabled: true })}
                  >
                    Habilitar
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-amber-600 px-2 py-1 text-xs hover:bg-amber-500"
                    onClick={() => enableDisableMutation.mutate({ id: user.samAccountName, enabled: false })}
                  >
                    Desabilitar
                  </button>
                  <input
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    placeholder="Nova OU DN"
                    value={targetUser === user.id ? targetOuDn : ''}
                    onChange={(event) => {
                      setTargetUser(user.id)
                      setTargetOuDn(event.target.value)
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-md bg-sky-700 px-2 py-1 text-xs hover:bg-sky-600"
                    onClick={() =>
                      moveUserMutation.mutate({
                        id: user.samAccountName,
                        targetOuDn: targetUser === user.id ? targetOuDn : '',
                      })
                    }
                  >
                    Mover
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    placeholder="Nova senha (opcional)"
                    type="password"
                    value={targetUser === user.id ? targetPassword : ''}
                    onChange={(event) => {
                      setTargetUser(user.id)
                      setTargetPassword(event.target.value)
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-2 py-1 text-xs hover:bg-indigo-500 md:col-span-2"
                    onClick={() =>
                      resetPasswordMutation.mutate({
                        id: user.samAccountName,
                        newPassword: targetUser === user.id ? targetPassword || undefined : undefined,
                      })
                    }
                  >
                    Resetar senha
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
