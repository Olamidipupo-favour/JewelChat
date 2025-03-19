import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../ui/card'
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  DollarSign, 
  Settings,
  LogOut,
  User
} from 'lucide-react'

export function AdminDashboardLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'API Usage', href: '/admin/api-usage', icon: Activity },
    { name: 'Pricing', href: '/admin/pricing', icon: DollarSign },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-0 w-64 p-4">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
} 