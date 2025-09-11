'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package,
  LogOut,
  BarChart3,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [storeName, setStoreName] = useState('My Store')
  const [storeInitials, setStoreInitials] = useState('MS')

  const navLinks = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Revenue', 
      href: '/dashboard/revenue', 
      icon: TrendingUp,
      description: 'Financial Insights'
    },
    { 
      name: 'Orders', 
      href: '/dashboard/orders', 
      icon: ShoppingBag,
      description: 'Order Management'
    },
    { 
      name: 'Customers', 
      href: '/dashboard/customers', 
      icon: Users,
      description: 'Customer Analytics'
    },
    { 
      name: 'Products', 
      href: '/dashboard/products', 
      icon: Package,
      description: 'Product Performance'
    },
  ]

  useEffect(() => {
    fetchStoreInfo()
  }, [])

  const fetchStoreInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/dashboard/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const name = data.storeName || 'My Store'
        const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
        
        setStoreName(name)
        setStoreInitials(initials)
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Xeno Analytics
                </h2>
                <p className="text-xs text-gray-500">Shopify Insights</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                      {link.name}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {link.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{storeInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {storeName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  Store Owner
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Xeno Analytics
            </span>
          </div>

          <div className="w-8"> {/* Spacer for symmetry */}</div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}