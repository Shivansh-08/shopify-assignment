'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag,
  LayoutGrid,
  ShoppingCart,
  LogOut,
  BarChart3,
  Menu,
  X,
  Users // Import the Users icon
} from 'lucide-react'
import { useState, useEffect } from 'react'


export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Start with the sidebar expanded and un-interactive until the client has mounted
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const [storeName, setStoreName] = useState('My Store');
  const [storeInitials, setStoreInitials] = useState('MS');


  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Revenue', href: '/dashboard/revenue', icon: LayoutGrid },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingCart },
    { name: 'Customers', href: '/dashboard/customers', icon: Users }, // New "Customers" link
  ]
  
  useEffect(() => {
    // This effect runs only on the client
    setHasMounted(true);
    setIsCollapsed(true); // Set the initial collapsed state after mounting
    fetchStoreInfo()
  }, [])

  const fetchStoreInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/dashboard/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const name = data.storeName || 'My Store'
        const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
        
        setStoreName(name)
        setStoreInitials(initials)
      } else if (response.status === 401) {
        // Token might be invalid or expired
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
    }
  }


  const handleSignOut = () => {
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 h-20 border-b border-gray-700">
        <div className={`flex items-center space-x-3 overflow-hidden`}>
          <BarChart3 className="h-8 w-8 text-white flex-shrink-0" />
          <h2 className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed && hasMounted ? 'lg:opacity-0 lg:w-0' : ''}`}>
            Shopify Analytics
          </h2>
        </div>
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-6 w-6" />
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
                group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                ${isCollapsed && hasMounted ? 'lg:justify-center' : ''}
              `}
              title={isCollapsed && hasMounted ? link.name : ''}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed && hasMounted ? 'lg:mr-0' : 'mr-4'}`} />
              <span className={`transition-all duration-300 ${isCollapsed && hasMounted ? 'lg:opacity-0 lg:w-0 lg:hidden' : ''}`}>{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white flex-shrink-0">
              {storeInitials}
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed && hasMounted ? 'lg:opacity-0 lg:w-0 lg:hidden' : ''}`}>
              <div className="text-sm font-semibold text-white truncate">
                {storeName}
              </div>
              <div className="text-xs text-gray-400 truncate">
                Store Owner
              </div>
            </div>
        </div>
        <div className="mt-4">
            <button
                onClick={handleSignOut}
                className={`w-full flex items-center p-2 text-gray-300 rounded-lg hover:bg-red-800/50 hover:text-white transition-colors ${isCollapsed && hasMounted ? 'lg:justify-center' : ''}`}
                title="Sign Out"
            >
                <LogOut className={`h-5 w-5 flex-shrink-0 ${isCollapsed && hasMounted ? 'lg:mr-0' : 'mr-3'}`} />
                <span className={`text-sm font-medium transition-all duration-300 ${isCollapsed && hasMounted ? 'lg:opacity-0 lg:w-0 lg:hidden' : ''}`}>Sign Out</span>
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          relative
          fixed inset-y-0 left-0 z-50 bg-[#10192A] transform transition-all duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'}
          ${isCollapsed && hasMounted ? 'lg:w-20' : 'lg:w-72'}
        `}
        onMouseEnter={hasMounted ? () => setIsCollapsed(false) : undefined}
        onMouseLeave={hasMounted ? () => setIsCollapsed(true) : undefined}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            <span className="text-lg font-bold text-gray-800">
              Shopify Analytics
            </span>
          </div>

          <div className="w-8"> {/* Spacer for symmetry */}</div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

