import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'];
const STATUS_STYLES = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

export default function ManagerOrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrders, setExpandedOrders] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const PAGE_SIZE = 20;

    useEffect(() => {
        fetchOrders(0, true);
    }, []);

    const fetchOrders = async (page, reset = false) => {
        try {
            if (reset) setLoading(true);
            else setLoadingMore(true);

            const res = await api.get(`/manager/orders/paged?page=${page}&size=${PAGE_SIZE}`);
            const data = res.data;

            if (reset) {
                setOrders(data.content);
            } else {
                setOrders(prev => [...prev, ...data.content]);
            }

            setCurrentPage(data.currentPage);
            setHasMore(data.hasMore);
            setTotalElements(data.totalElements);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        fetchOrders(currentPage + 1);
    };

    const toggleExpand = (orderId) => {
        setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const filtered = orders.filter(o => {
        const matchesStatus = filter === 'ALL' || o.status === filter;
        const matchesSearch = searchQuery === '' ||
            String(o.id).includes(searchQuery) ||
            (o.deliveryAddress || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {orders.length} of {totalElements} orders
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID or address..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                </div>
                <div className="flex gap-1.5">
                    {STATUS_OPTIONS.map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === status
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Address</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No orders found for the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(order => (
                                    <>
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => toggleExpand(order.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">#{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                                <span className="block text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                                                {order.deliveryAddress || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {order.items?.length || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                ₹{Number(order.totalPrice).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {expandedOrders[order.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>
                                        </tr>
                                        {expandedOrders[order.id] && (
                                            <tr key={`${order.id}-detail`}>
                                                <td colSpan="7" className="bg-gray-50/60 px-6 py-4">
                                                    <div className="ml-4 space-y-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Order Items</p>
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="w-6 h-6 bg-green-50 rounded text-green-600 text-xs flex items-center justify-center font-semibold">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <span className="text-gray-700">{item.product?.name || 'Unknown Product'}</span>
                                                                </div>
                                                                <span className="font-medium text-gray-900">
                                                                    ₹{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* +More Button */}
                {hasMore && (
                    <div className="p-4 border-t border-gray-100 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                `+ More (${totalElements - orders.length} remaining)`
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
