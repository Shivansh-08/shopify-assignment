'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { 
  TrendingUp, 
  ShoppingBag, 
  BarChart3, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from 'lucide-react'
import { addDays, format } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function RevenuePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [groupBy, setGroupBy] = useState('day')
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  const defaultDateRange = { 
    from: addDays(new Date(), -30), 
    to: new Date() 
  }
  const [dateRange, setDateRange] = useState(defaultDateRange)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchData()
  }, [router, dateRange, groupBy])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const from = dateRange.from.toISOString()
      const to = dateRange.to.toISOString()

      const response = await fetch(`/api/dashboard/revenue-insights?from=${from}&to=${to}&groupBy=${groupBy}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Something went wrong')
    }
    
    setLoading(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Prepare chart data
  const formattedChartData = data.chartData?.map(item => ({
    ...item,
    date: format(new Date(item.date), groupBy === 'month' ? 'MMM yyyy' : 'dd MMM'),
    revenue: parseFloat(item.revenue)
  })) || []

  const revenueChartData = {
    labels: formattedChartData.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: formattedChartData.map(item => item.revenue),
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

  const productRevenueData = {
    labels: data.topProducts?.map(p => p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title) || [],
    datasets: [
      {
        label: 'Revenue',
        data: data.topProducts?.map(p => p.revenue) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)'
        ],
        borderRadius: 8,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ${formatCurrency(context.parsed.y)}`
          }
        }
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
        },
        ticks: {
          callback: function(value) {
            return `₹${value / 1000}k`
          }
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
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed financial insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <Calendar className="inline h-4 w-4 mr-1" />
              {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.kpis?.totalRevenue || 0)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+18.2%</span>
                <span className="text-sm text-gray-500 ml-2">vs prev period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {(data.kpis?.totalOrders || 0).toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-2">vs prev period</span>
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
              <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.kpis?.averageOrderValue || 0)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">-3.1%</span>
                <span className="text-sm text-gray-500 ml-2">vs prev period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              {['day', 'week', 'month'].map(group => (
                <button
                  key={group}
                  onClick={() => setGroupBy(group)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    groupBy === group 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="h-80">
            <Bar 
              data={productRevenueData} 
              options={{
                ...chartOptions,
                indexAxis: 'y',
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      callback: function(value) {
                        return `₹${value / 1000}k`
                      }
                    }
                  },
                  y: {
                    grid: { display: false }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>{data.topProducts?.length || 0} products</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Units Sold</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts?.map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-8 rounded-full mr-3`} style={{
                        backgroundColor: [
                          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#9333ea'
                        ][index] || '#6b7280'
                      }}></div>
                      <div>
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{product.unitsSold.toLocaleString()}</td>
                  <td className="py-4 px-4 font-semibold text-green-600">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {formatCurrency(product.revenue / product.unitsSold)}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}