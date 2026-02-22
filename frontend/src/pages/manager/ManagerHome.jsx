import { useState, useEffect } from 'react';
import api from '../../api/axios';
import OrderDetailsModal from '../../components/OrderDetailsModal';

export default function ManagerHome() {
    const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, revenue: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // Fetch stats
        api.get('/manager/stats').then(r => setStats(r.data)).catch(console.error);

        // Fetch recent orders (using the same /manager/orders endpoint, filtered or slice)
        api.get('/manager/orders').then(r => {
            // Sort by date desc and take top 5
            const sorted = r.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
            setRecentOrders(sorted);
        }).catch(console.error);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            🛒
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                            ⚡
                        </div>
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Action Needed</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            💰
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">₹{stats.revenue}</p>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <a href="/dashboard/order-history" className="text-sm text-green-600 font-medium hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">No recent orders found</td>
                                </tr>
                            ) : (
                                recentOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-green-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.user?.email || 'Guest'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">₹{order.totalPrice}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
