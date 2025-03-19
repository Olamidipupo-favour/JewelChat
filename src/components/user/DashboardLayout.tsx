import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../ui/card'
import { 
  LayoutDashboard, 
  User, 
  CreditCard, 
  Settings,
  LogOut,
  Key
} from 'lucide-react'

export function UserDashboardLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="w-64 bg-white shadow-sm flex flex-col fixed h-full">
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
                <p className="text-xs text-gray-500">Available Tokens: {profile?.tokens || 0}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 mt-4 overflow-y-auto">
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
          {/* Fixed Sign Out Button */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>

        {/* Scrollable Main content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 ml-64">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
} 