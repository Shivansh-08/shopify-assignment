'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User, ShoppingCart, Award } from 'lucide-react';

// A single customer card component for a clean look
const CustomerCard = ({ customer, index }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
    }

    // Add a special highlight for the top 3 customers on the first page
    const isTopCustomer = index < 3;

    return (
        <div className={`bg-white shadow-md rounded-lg p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 ${isTopCustomer ? 'border-2 border-yellow-400' : ''}`}>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                        {customer.firstName || customer.lastName ? `${customer.firstName} ${customer.lastName}`.trim() : 'Guest Customer'}
                    </h3>
                    {isTopCustomer && <Award className="h-5 w-5 text-yellow-500" title="Top Customer" />}
                </div>
                <p className="text-sm text-gray-500 mb-4 truncate">{customer.email}</p>
                
                <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-700">Total Spent:</span>
                        <span className="ml-auto font-bold text-green-600">{formatCurrency(customer.totalSpent)}</span>
                    </div>
                    <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-700">Total Orders:</span>
                        <span className="ml-auto font-bold text-blue-600">{customer._count.orders}</span>
                    </div>
                </div>
            </div>
             <p className="text-xs text-gray-400 mt-4">
                Customer since: {new Date(customer.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
};


export default function CustomersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        async function fetchCustomers() {
            setLoading(true);
            try {
                const response = await fetch(`/api/dashboard/customers-list?page=${pagination.page}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setCustomers(data.customers);
                    setPagination(data.pagination);
                } else {
                    setError(data.error || 'Failed to fetch customers');
                }
            } catch (err) {
                setError('Something went wrong');
            }
            setLoading(false);
        }
        fetchCustomers();
    }, [router, pagination.page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
            
            {loading ? (
                <p className="text-center text-gray-500">Loading customers...</p>
            ) : error ? (
                <p className="text-center text-red-600">{error}</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {customers.map((customer, index) => (
                           <CustomerCard key={customer.id} customer={customer} index={index + (pagination.page - 1) * pagination.limit} />
                        ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="py-4 flex items-center justify-center">
                         <div className="flex items-center space-x-1 p-2 bg-white shadow-md rounded-lg">
                             <button onClick={() => handlePageChange(1)} disabled={pagination.page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button>
                             <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                             <span className="px-4 text-sm font-semibold text-gray-700">Page {pagination.page} of {pagination.totalPages}</span>
                             <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
                             <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button>
                         </div>
                    </div>
                </>
            )}
        </div>
    );
}
