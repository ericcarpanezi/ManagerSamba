const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3000/api` : 'http://localhost:3000/api')

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Erro ao consultar ${path}: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getHealth() {
  return request<{ status: string; timestamp: string }>('/health')
}

export function getDirectoryStatus() {
  return request<{
    mode: 'automatic' | 'manual'
    source: 'samba-tool' | 'fallback'
    sambaToolAvailable: boolean
    ldapConfigured: boolean
    discoveryHost: string
    domainInfo: {
      realm: string | null
      domain: string | null
      netbios_name: string | null
      server_role: string | null
    } | null
  }>('/directory/status')
}

export function getUsers() {
  return request<Array<{ id: string; displayName: string; samAccountName: string; email: string; enabled: boolean }>>('/users')
}

export function getGroups() {
  return request<Array<{ id: string; name: string; description: string; members: string[] }>>('/groups')
}

export function getComputers() {
  return request<Array<{ id: string; name: string; operatingSystem: string; ouDn: string }>>('/computers')
}

export function getOuTree() {
  return request<Array<{ id: string; dn: string; name: string; children: unknown[] }>>('/ous/tree')
}

export function getAuditEvents() {
  return request<Array<{ id: string; action: string; actor: string; target: string; timestamp: string }>>('/audit/events')
}
