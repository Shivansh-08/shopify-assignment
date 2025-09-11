'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
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
  BarElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)
import { ManualSyncButton } from '../../components/dashboard/ManualSyncButton'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [ordersByDate, setOrdersByDate] = useState([])
  const [status, setStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [analyticsRes, ordersRes, statusRes] = await Promise.all([
        fetch('/api/dashboard/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/status', { headers: { Authorization: `Bearer ${token}` } })
      ])

      const [analytics, orders, storeStatus] = await Promise.all([
        analyticsRes.json(),
        ordersRes.json(),
        statusRes.json()
      ])

      if (analyticsRes.ok && ordersRes.ok && statusRes.ok) {
        setData(analytics)
        
        // Group orders by date
        const ordersByDateMap = orders.reduce((acc, order) => {
          const dateKey = new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          if (!acc[dateKey]) {
            acc[dateKey] = { orders: 0, revenue: 0 }
          }
          acc[dateKey].orders += order._count?._all || 1
          acc[dateKey].revenue += order._sum?.totalPrice || order.totalPrice || 0
          return acc
        }, {})
        
        // Convert to array and sort by date
        const groupedOrders = Object.entries(ordersByDateMap).map(([date, data]) => ({
          date,
          orders: data.orders,
          revenue: data.revenue
        })).sort((a, b) => new Date(a.date) - new Date(b.date))
        
        setOrdersByDate(groupedOrders)
        setStatus(storeStatus)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/cron/sync-data', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        await fetchData() // Refresh data
      }
    } catch (err) {
      console.error('Sync failed:', err)
    }
    setSyncing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Chart configurations
  const revenueChartData = {
    labels: ordersByDate.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: ordersByDate.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        pointRadius: 6,
      }
    ]
  }

  const ordersChartData = {
    labels: ordersByDate.map(item => item.date),
    datasets: [
      {
        label: 'Orders',
        data: ordersByDate.map(item => item.orders),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }

  const customerSpendingData = {
    labels: data.topCustomers.map(c => c.email.split('@')[0]),
    datasets: [
      {
        data: data.topCustomers.map(c => c.totalSpent),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)'
        ],
        borderWidth: 0,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <Calendar className="inline h-4 w-4 mr-1" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.revenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalOrders.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalCustomers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+15.3%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(data.revenue / data.totalOrders || 0).toFixed(0)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">-2.1%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Sync Button Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Customers Doughnut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Customers</h3>
          <div className="h-80">
            <Doughnut data={customerSpendingData} options={doughnutOptions} />
          </div>
        </div>

        {/* Manual Sync Button */}
        <div>
          <ManualSyncButton />
        </div>
      </div>

      {/* Orders Chart and Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Orders</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Orders</span>
            </div>
          </div>
          <div className="h-64">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>

        {/* Store Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Status</h3>
          {status && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Store Name</span>
                <span className="text-sm text-gray-900">{status.storeName}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customers</span>
                  <span className="text-sm font-semibold text-gray-900">{status.totalCustomers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Products</span>
                  <span className="text-sm font-semibold text-gray-900">{status.totalProducts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Orders</span>
                  <span className="text-sm font-semibold text-gray-900">{status.totalOrders}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Last Sync:</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {status.lastSyncedAt
                    ? new Date(status.lastSyncedAt).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}