'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Package, ShoppingCart, IndianRupee } from 'lucide-react';

const ProductCard = ({ product }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1">
            <div>
                <div className="flex items-start justify-between mb-3">
                     <h3 className="text-md font-bold text-gray-800">{product.title}</h3>
                     <span className="text-lg font-bold text-gray-800">{formatCurrency(product.price)}</span>
                </div>
                
                <div className="space-y-3 text-sm border-t pt-4 mt-4">
                    <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-700">Total Revenue:</span>
                        <span className="ml-auto font-bold text-green-600">{formatCurrency(product.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-700">Units Sold:</span>
                        <span className="ml-auto font-bold text-blue-600">{product.unitsSold}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        async function fetchProducts() {
            setLoading(true);
            try {
                const response = await fetch(`/api/dashboard/products-list?page=${pagination.page}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setProducts(data.products);
                    setPagination(data.pagination);
                } else {
                    setError(data.error || 'Failed to fetch products');
                }
            } catch (err) {
                setError('Something went wrong');
            }
            setLoading(false);
        }
        fetchProducts();
    }, [router, pagination.page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Products Performance</h1>
            
            {loading ? (
                <p className="text-center text-gray-500 py-10">Loading products...</p>
            ) : error ? (
                <p className="text-center text-red-600 py-10">{error}</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                           <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    
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
