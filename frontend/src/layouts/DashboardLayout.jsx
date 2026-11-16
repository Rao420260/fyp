import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  FileText,
  PlusSquare,
  CheckSquare,
  CalendarDays,
  Users,
  Bot,
  Link2,
  Menu,
  X,
  Bell,
  LogOut,
  CalendarClock,
} from 'lucide-react'
import { useAuth, roleLabels } from '../context/AuthContext'

// Menu: har item me likha hai ke kaun se role ko nazar aaye
const menu = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['creator', 'manager', 'admin'] },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['manager'] },
  { to: '/posts/new', label: 'Create Post', icon: PlusSquare, roles: ['creator'] },
  { to: '/posts', label: 'Posts', icon: FileText, roles: ['creator', 'manager', 'admin'] },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, roles: ['creator', 'manager', 'admin'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/assistant', label: 'AI Assistant', icon: Bot, roles: ['creator', 'manager'] },
  { to: '/connect', label: 'Connect Accounts', icon: Link2, roles: ['creator', 'manager', 'admin'] },
]

export default function DashboardLayout() {
  const [open, setOpen] = useState(false) // mobile menu khula hai ya nahi
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  // Sirf wohi items jo is role ke liye hain
  const items = menu.filter((m) => m.roles.includes(role))
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    navigate('/login', { replace: true })
    logout()
    toast.success('Logged out')
  }

  // Sidebar ek baar likha hai, desktop aur mobile dono me use hota hai
  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <CalendarClock size={20} />
          </span>
          <span className="text-xl font-bold text-gray-900">PostFlow</span>
        </Link>
        <button className="text-gray-400 lg:hidden" onClick={() => setOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <m.icon size={20} />
            {m.label}
          </NavLink>
        ))}
      </nav>

      {/* Neeche user ka card */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar (bari screen par) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar (menu button dabane par) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Asli role (ab badla nahi ja sakta, server se aata hai) */}
            <span className="hidden rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 sm:inline">
              {roleLabels[role]}
            </span>

            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rejected" />
            </button>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {initials}
            </span>
          </div>
        </header>

        {/* Yahan har page ka content aata hai */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}