import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', description: 'Visao geral do ambiente' },
  { to: '/users', label: 'Usuarios', description: 'Contas e identidade' },
  { to: '/groups', label: 'Grupos', description: 'Permissoes por grupo' },
  { to: '/computers', label: 'Computadores', description: 'Objetos de maquina' },
  { to: '/ous', label: 'OUs', description: 'Estrutura organizacional' },
  { to: '/audit', label: 'Auditoria', description: 'Rastreabilidade de acoes' },
]

function App() {
  const location = useLocation()
  const activeItem = navItems.find((item) => (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-900/80 lg:flex">
          <div className="border-b border-slate-800 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AG Directory Manager</p>
            <h1 className="mt-2 text-lg font-semibold leading-tight">Samba4 AD Web Console</h1>
            <p className="mt-2 text-sm text-slate-400">Painel administrativo moderno para Active Directory.</p>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded-xl border px-4 py-3 text-sm transition ${
                    isActive
                      ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-100'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`
                }
              >
                <p className="font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-slate-400">{item.description}</p>
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">v0.1.0 Bootstrap</div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Modulo ativo</p>
              <h2 className="mt-1 text-xl font-semibold">{activeItem?.label ?? 'Painel'}</h2>
            </div>
          </header>

          <nav className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 lg:hidden">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-xs font-medium ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
