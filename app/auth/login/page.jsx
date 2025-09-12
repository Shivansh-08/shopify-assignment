'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    // Main container with a light background
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      
      {/* The form card with white background, padding, rounded corners, and shadow */}
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">Access your dashboard and personal content</p>
        </div>

        {/* Display error message if it exists */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
            />
          </div>

          {/* Password Input Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="mt-1 block w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#611BFB] focus:border-[#611BFB]"
            />
          </div>

          {/* Remember me and Forgot Password section */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#611BFB] focus:ring-[#5018d4] border-gray-300 rounded"/>
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                Remember me
              </label>
            </div>

            <a href="#" className="font-medium text-[#611BFB] hover:text-[#5018d4]">
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#611BFB] hover:bg-[#5018d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5018d4] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* "New user?" Link */}
        <p className="text-center text-sm text-gray-600">
          New user?{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/register')}
            className="font-medium text-[#611BFB] hover:text-[#5018d4]"
          >
            Create an account
          </button>
        </p>
        
      </div>
    </div>
  )
}