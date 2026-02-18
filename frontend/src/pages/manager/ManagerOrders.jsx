import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronDown, ChevronUp } from 'lucide-react';

const COLUMNS = ['PENDING', 'PROCESSING', 'DELIVERED'];
const COL_CONFIG = {
    PENDING: { color: 'yellow', dot: 'bg-yellow-400', label: 'PENDING' },
    PROCESSING: { color: 'blue', dot: 'bg-blue-400', label: 'PROCESSING' },
    DELIVERED: { color: 'green', dot: 'bg-green-400', label: 'OUT FOR DELIVERY' },
};

export default function ManagerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    const fetchOrders = async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const res = await api.get('/manager/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), 10000);
        return () => clearInterval(interval);
    }, []);


    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/manager/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const grouped = COLUMNS.reduce((acc, col) => {
        acc[col] = orders.filter(o => o.status === col);
        return acc;
    }, {});

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">Fulfillment Queue</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
                {COLUMNS.map(col => {
                    const cfg = COL_CONFIG[col];
                    return (
                        <div key={col} className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                    <h3 className="text-sm font-semibold text-gray-900">{cfg.label}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{grouped[col].length}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {grouped[col].map(order => (
                                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                        <div
                                            className="flex items-center justify-between mb-2 cursor-pointer"
                                            onClick={() => toggleExpand(order.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">#{order.id}</p>
                                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${col === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    col === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {col}
                                                </span>
                                                {expandedOrders[order.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">📍 {order.deliveryAddress || 'No address'}</p>
                                        <p className="text-xs text-gray-400 mb-3">Total: ₹{order.totalPrice}</p>

                                        {expandedOrders[order.id] && (
                                            <div className="mb-3 pt-3 border-t border-gray-50 space-y-2">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span>{item.product?.name} x{item.quantity}</span>
                                                        <span className="font-medium">₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-2 text-xs text-gray-500">
                                                    User: {order.user?.email || 'Unknown'}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                            <span className="text-xs text-gray-400">
                                                {order.items?.length || 0} Items
                                            </span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="text-xs px-2 py-1 rounded-lg border border-green-200 text-green-700 bg-green-50 font-medium cursor-pointer focus:outline-none"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {COLUMNS.map(s => <option key={s} value={s}>{s === 'DELIVERED' ? 'Mark Delivered' : s}</option>)}
                                                <option value="CANCELLED">Cancel</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {grouped[col].length === 0 && (
                                    <p className="text-center text-xs text-gray-400 py-8">No orders</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
