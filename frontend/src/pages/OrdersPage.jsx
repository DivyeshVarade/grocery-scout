import { useState, useEffect } from 'react';
import api from '../api/axios';
import Footer from '../components/Footer';
import { RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 10000; // 10 seconds

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchOrders = async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const r = await api.get('/user/orders');
            setOrders(r.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            PROCESSING: 'bg-blue-100 text-blue-700',
            DELIVERED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1000px] mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <button
                        onClick={() => fetchOrders(false)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors"
                        title="Refresh now"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500">Track and manage all your orders</p>
                    {lastUpdated && (
                        <p className="text-[10px] text-gray-400">
                            Auto-updates every 10s • Last: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <span className="text-5xl block mb-4">📋</span>
                        <p className="text-lg font-medium text-gray-700">No orders yet</p>
                        <p className="text-sm text-gray-400 mt-1">Your orders will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => document.getElementById(`order-details-${order.id}`).classList.toggle('hidden')}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-900">Order #{order.id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-gray-900">₹{order.totalPrice}</span>
                                        <span className="text-gray-400">▼</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-gray-500 mb-2">
                                    <span>📍 {order.deliveryAddress || 'No address'}</span>
                                    <span>📅 {new Date(order.createdAt).toLocaleString()}</span>
                                </div>

                                {/* Expanded Details */}
                                <div id={`order-details-${order.id}`} className="hidden mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Items</h4>
                                    <div className="space-y-2">
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.product?.name || 'Unknown Product'} x {item.quantity}</span>
                                                <span className="text-gray-900 font-medium">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
