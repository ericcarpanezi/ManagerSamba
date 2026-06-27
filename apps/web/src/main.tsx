import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DashboardPage } from './pages/dashboard.tsx'
import { UsersPage } from './pages/users.tsx'
import { GroupsPage } from './pages/groups.tsx'
import { ComputersPage } from './pages/computers.tsx'
import { OusPage } from './pages/ous.tsx'
import { AuditPage } from './pages/audit.tsx'
import { LoginPage } from './pages/login.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'computers', element: <ComputersPage /> },
      { path: 'ous', element: <OusPage /> },
      { path: 'audit', element: <AuditPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
    </QueryClientProvider>
  </StrictMode>,
)
