import { X, Package, MapPin, User, Calendar, Hash } from 'lucide-react';
import { useEffect } from 'react';

const STATUS_STYLES = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
    DELIVERED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export default function OrderDetailsModal({ order, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!order) return null;

    const items = order.items || [];
    const statusStyle = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            style={{ animation: 'modalFadeIn 0.2s ease-out' }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'modalSlideUp 0.25s ease-out' }}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Hash size={18} className="text-gray-400" />
                                Order #{order.id}
                            </h2>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            {order.user?.email && (
                                <span className="flex items-center gap-1">
                                    <User size={12} className="text-gray-400" />
                                    {order.user.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400" />
                                {new Date(order.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin size={14} className="text-green-600 mt-0.5 shrink-0" />
                            <span>{order.deliveryAddress}</span>
                        </div>
                    </div>
                )}

                {/* Products List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={16} className="text-green-600" />
                        Delivery Products
                        <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                    </h3>

                    {items.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No items in this order</p>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                                            x{item.quantity}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.product?.name || 'Unknown Product'}
                                            </p>
                                            {item.product?.category && (
                                                <p className="text-[11px] text-gray-400">{item.product.category}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-sm font-semibold text-gray-900">
                                            ₹{((item.price || item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            ₹{(item.price || item.priceAtPurchase || 0)} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Total */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Order Total</span>
                        <span className="text-xl font-bold text-gray-900">₹{order.totalPrice}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
