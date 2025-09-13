'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    storeName: '',
    domain: '',
    accessToken: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Save token to localStorage and redirect
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    // Main container with a light background
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] py-12 px-4">
      
      {/* The form card with white background, padding, rounded corners, and shadow */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500">Connect your Shopify store to get started</p>
        </div>

        {/* --- THIS IS THE NEW LOADING MESSAGE --- */}
        {/* It appears only when the form is submitting */}
        {loading && (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-center items-center mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
                <p className="font-semibold text-blue-800">Connecting to Shopify...</p>
                <p className="text-sm text-blue-600 mt-1">Please wait while we import your store data. This may take a minute.</p>
            </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Display error message if it exists */}
          {error && !loading && ( // Hide old errors while loading
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                  <span className="block sm:inline">{error}</span>
              </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
              {/* Store Name */}
              <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                      id="storeName"
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      required
                      placeholder="My Awesome Store"
                      className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
                  />
              </div>

              {/* Shopify Domain */}
              <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Shopify Domain</label>
                  <input
                      id="domain"
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      required
                      placeholder="your-store.myshopify.com"
                      className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
                  />
              </div>

              {/* Shopify Access Token */}
              <div>
                  <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">Shopify Access Token</label>
                  <input
                      id="accessToken"
                      type="password"
                      name="accessToken"
                      value={formData.accessToken}
                      onChange={handleChange}
                      required
                      placeholder="shpat_..."
                      className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
                  />
                   <p className="mt-2 text-xs text-gray-500">
                     Find this in Shopify Admin → Apps → Develop apps for your store.
                   </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 !mt-6 !mb-2"></div>

              {/* Email */}
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@yourstore.com"
                      className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
                  />
              </div>

              {/* Password */}
              <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
                  />
              </div>
          </div>
          
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#611BFB] hover:bg-[#5018d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5018d4] disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Create Account & Connect'}
            </button>
          </div>
        </form>

        {/* "Already have an account?" Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="font-medium text-[#611BFB] hover:text-[#5018d4]"
          >
            Sign in
          </button>
        </p>
        
      </div>
    </div>
  )
}
