'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [ordersByDate, setOrdersByDate] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    async function fetchData() {
      try {
        // Analytics
        const analyticsRes = await fetch('/api/dashboard/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const analytics = await analyticsRes.json()

        // Orders by date
        const ordersRes = await fetch('/api/dashboard/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const orders = await ordersRes.json()

        if (analyticsRes.ok && ordersRes.ok) {
          setData(analytics)
          setOrdersByDate(orders.map(o => ({
            date: new Date(o.orderDate).toLocaleDateString(),
            orders: o._count._all,
            revenue: o._sum.totalPrice
          })))
        } else {
          setError('Failed to load dashboard data')
        }
      } catch (err) {
        setError('Something went wrong')
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6 text-red-600">{error}</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Shopify Insights Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-sm text-gray-500">Total Customers</h2>
          <p className="text-2xl font-bold">{data.totalCustomers}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-sm text-gray-500">Total Orders</h2>
          <p className="text-2xl font-bold">{data.totalOrders}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-sm text-gray-500">Total Revenue</h2>
          <p className="text-2xl font-bold">${data.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Orders by Date */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Orders by Date</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ordersByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Top 5 Customers</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.topCustomers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="email" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSpent" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
