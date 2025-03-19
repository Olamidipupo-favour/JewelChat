import { useState } from 'react'
import { ApiService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import ApiKeys from './ApiKeys'
import { LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900">JewelChat</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            } w-full text-left px-3 py-2 rounded-md text-sm font-medium`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`${
              activeTab === 'api-keys'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            } w-full text-left px-3 py-2 rounded-md text-sm font-medium`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`${
              activeTab === 'payments'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            } w-full text-left px-3 py-2 rounded-md text-sm font-medium`}
          >
            Payments
          </button>
        </nav>

        {/* Sign Out Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Scrollable Right Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.email}</h2>
              {/* Add your overview content here */}
            </div>
          )}

          {activeTab === 'api-keys' && <ApiKeys />}

          {activeTab === 'payments' && (
            <div>
              {/* Add your payments content here */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 