export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional sidebar or nav */}
      <main className="p-6">{children}</main>
    </div>
  )
}
