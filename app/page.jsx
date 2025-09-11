'use client';
import React from "react";
import { BarChart3, LineChart, Users, DollarSign, TrendingUp, Shield, Clock } from "lucide-react";
// CORRECTED IMPORT: Use 'next/navigation' for the App Router
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-slate-50 text-gray-800">
      {/* Navbar */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-16 flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="https://placehold.co/35x35/4299e1/ffffff?text=S" alt="Logo" width={35} height={35} className="rounded-md" />
            <span className="font-bold text-xl text-blue-700">ShopifyAnalytics</span>
          </div>
          {/* Nav Links */}
          <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#analytics" className="hover:text-blue-600 transition-colors">Analytics</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </nav>
          {/* Buttons */}
          <div className="flex items-center space-x-4">
            <button onClick={() => { router.push('/auth/login') }} className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Sign In</button>
            <button onClick={() => { router.push('/auth/register') }}  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors shadow-sm hover:shadow-md">
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-slate-50 to-violet-100 text-gray-900 py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center">
          {/* Left: Text */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
              <div className="inline-block bg-violet-200 text-violet-800 text-sm font-semibold px-4 py-1 rounded-full">
                Transform Your Shopify Data Into Insights
              </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-slate-800">
              Smarter <span className="text-blue-600">Insights</span> for Your <span className="text-violet-600">Shopify Store</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0">
              Track revenue, customers, and growth in one clean dashboard. 
              Turn data into decisions with real-time analytics.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <button onClick = {() => {router.push('/auth/register')}} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-lg transform hover:scale-105 transition-transform">
                Get Started
              </button>
              <button className="px-6 py-3 border border-slate-300 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold transition-colors">
                Live Demo
              </button>
            </div>
            {/* Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 pt-6">
              <div>
                <p className="text-3xl font-bold text-slate-800">10K+</p>
                <p className="text-slate-500">Active Stores</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">$50M+</p>
                <p className="text-slate-500">Revenue Tracked</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">40%</p>
                <p className="text-slate-500">Avg Growth</p>
              </div>
            </div>
          </div>

          {/* Right: Mockup */}
          <div className="lg:w-1/2 mt-12 ml-8 lg:mt-0 flex justify-center lg:justify-end">
             <img
                src="/images/phone.png"
                alt="Dashboard Preview"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl border border-violet-100"
              />
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
         <div className="container mx-auto px-6 lg:px-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Make Smarter Decisions with <span className="text-blue-600">Powerful Analytics</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Revenue Insights</h3>
                <p className="text-slate-600">Detailed breakdowns and trend analysis to maximize profits.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <Users className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Customer Analytics</h3>
                <p className="text-slate-600">Understand behavior, retention, and lifetime value.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <LineChart className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Growth Tracking</h3>
                <p className="text-slate-600">Track sales, marketing performance, and store growth.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <DollarSign className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Best-Selling Products</h3>
                <p className="text-slate-600">See which products sell most and optimize inventory.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <Shield className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Enterprise-Grade Security</h3>
                <p className="text-slate-600">Bank-level encryption and API security keep data safe.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <Clock className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Real-Time Analytics</h3>
                <p className="text-slate-600">Get instant insights as they happen, no delays.</p>
              </div>
            </div>
         </div>
      </section>

      {/* Light Section with Dashboard */}
      <section id="analytics" className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center">
          {/* Left Image */}
          <div className="lg:w-1/2 flex justify-center">
            <img
              src="/images/image1.png"
              alt="Analytics Dashboard"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl border border-gray-200"
            />
          </div>

          {/* Right Text */}
          <div className="lg:w-1/2 lg:pl-12 mt-10 lg:mt-0 space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">All Your Data in One Dashboard</h2>
            <p className="text-slate-600">
              Say goodbye to scattered reports. View performance, sales, and 
              customers in one unified dashboard designed for Shopify sellers.
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center"><span className="text-blue-500 font-bold mr-2">✔</span> Real-time syncing</li>
              <li className="flex items-center"><span className="text-blue-500 font-bold mr-2">✔</span> Easy to use, no setup required</li>
              <li className="flex items-center"><span className="text-blue-500 font-bold mr-2">✔</span> Built for fast-growing stores</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 text-center bg-gradient-to-r from-blue-50 to-violet-200">
         <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Ready to grow your Shopify store?</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Start your free trial today and unlock powerful insights. No credit card required.</p>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-lg transform hover:scale-105 transition-transform">
              Start Your 14-Day Free Trial
            </button>
       </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <p>© 2025 ShopifyAnalytics. All rights reserved.</p>
      </footer>
    </div>
  );
}
