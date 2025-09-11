'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download,
  Calendar,
  ShoppingBag,
  User,
  DollarSign,
  Eye
} from 'lucide-react'

const StatusBadge = ({ status, type = 'payment' }) => {
  const displayStatus = status === null ? 'unfulfilled' : status

  const paymentStyles = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const fulfillmentStyles = {
    fulfilled: 'bg-blue-100 text-blue-800 border-blue-200',
    unfulfilled: 'bg-orange-100 text-orange-800 border-orange-200',
    partial: 'bg-purple-100 text-purple-800 border-purple-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const styles = type === 'payment' ? paymentStyles : fulfillmentStyles
  const style = styles[displayStatus] || styles.default
  const displayText = displayStatus ? displayStatus.replace('_', ' ') : 'N/A'

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${style}`}>
      {displayText}
    </span>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [router, pagination.page])

  useEffect(() => {
    // Filter orders based on search and status
    let filtered = orders
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.financialStatus === statusFilter || order.fulfillmentStatus === statusFilter
      )
    }
    
    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/dashboard/orders-list?page=${pagination.page}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all your customer orders</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="text-sm text-gray-500">
              <Calendar className="inline h-4 w-4 mr-1" />
              {new Date().toLocaleDateString('en-IN', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(orders.reduce((sum, order) => sum + order.totalPrice, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Paid Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.financialStatus === 'paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Order</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.length > 0 ? formatCurrency(orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length) : '₹0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="unfulfilled">Unfulfilled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Order</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Customer</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Total</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Payment</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Fulfillment</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-2 h-8 rounded-full bg-blue-500 mr-3"></div>
                        <div>
                          <div className="font-medium text-blue-600">#{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">ID: {order.id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">{formatDate(order.orderDate)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-medium">
                            {order.customer ? 
                              (order.customer.firstName?.[0] || order.customer.email?.[0] || 'U').toUpperCase() 
                              : 'G'}
                          </span>
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">
                            {order.customer ? 
                              `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Customer'
                              : 'Guest'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customer?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{formatCurrency(order.totalPrice)}</div>
                      <div className="text-xs text-gray-500">Inc. taxes</div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={order.financialStatus} type="payment" />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!error && filteredOrders.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} • {orders.length} total orders
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}