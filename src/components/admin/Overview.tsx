import { useEffect, useState } from 'react'
import { ApiService } from '../../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const stats = [
  { name: 'Total Revenue', value: '$0' },
  { name: 'Total API Cost', value: '$0' },
  { name: 'Net Profit', value: '$0' },
  { name: 'Active Users', value: '0' },
]

export default function Overview() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90))

        const stats = await ApiService.getAdminStats(startDate, endDate)
        setData(stats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  if (loading) {
    return <div>Loading...</div>
  }

  const revenueData = {
    labels: Object.keys(data?.revenueByDay || {}),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(data?.revenueByDay || {}),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'API Cost',
        data: Object.values(data?.costByDay || {}),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
    ],
  }

  const usageData = {
    labels: Object.keys(data?.usageByType || {}),
    datasets: [
      {
        data: Object.values(data?.usageByType || {}).map((type: any) => type.tokens),
        backgroundColor: [
          'rgba(99, 102, 241, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
        ],
      },
    ],
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="mt-2 text-sm text-gray-700">
            A comprehensive overview of your application's performance and revenue.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <div className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.name === 'Total Revenue' && `$${data?.totalRevenue.toFixed(2)}`}
                {stat.name === 'Total API Cost' && `$${data?.totalApiCost.toFixed(2)}`}
                {stat.name === 'Net Profit' && `$${(data?.totalRevenue - data?.totalApiCost).toFixed(2)}`}
                {stat.name === 'Active Users' && data?.activeUsers}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <h3 className="text-base font-medium leading-6 text-gray-900">Revenue vs API Cost</h3>
            <div className="mt-4 h-96">
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Daily Revenue and API Cost',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <h3 className="text-base font-medium leading-6 text-gray-900">API Usage by Type</h3>
            <div className="mt-4 h-96">
              <Doughnut
                data={usageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Token Usage Distribution',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 