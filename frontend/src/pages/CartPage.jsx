import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, clearCart, checkout, cartTotal, loading } = useCart();
    const [address, setAddress] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Auto-dismiss toast after 3 seconds
    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    if (loading) return <div className="p-10 text-center">Loading cart...</div>;

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-500 mb-6">Your order has been sent to our fulfillment team.</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/orders" className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium">View Order</Link>
                        <Link to="/catalog" className="px-5 py-2 border border-gray-200 rounded-lg font-medium">Continue Shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">🛒</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/catalog" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await checkout(address);
            setOrderSuccess(true);
        } catch (err) {
            const msg = err?.response?.data?.error || 'Checkout failed. Please try again.';
            setToastMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10">
            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2 bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm font-medium">{toastMsg}</span>
                    <button onClick={() => setToastMsg('')} className="ml-auto text-white/70 hover:text-white text-lg">×</button>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                {item.product.imageUrl ? (
                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">🍎</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                                    <p className="font-semibold text-gray-900">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">{item.product.unit}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, -1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-600 disabled:opacity-50"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-600"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={clearCart} className="text-sm text-red-500 hover:underline px-2">
                        Clear Cart
                    </button>
                </div>

                {/* Checkout Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {!isCheckingOut ? (
                            <button
                                onClick={() => setIsCheckingOut(true)}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout <ArrowRight size={18} />
                            </button>
                        ) : (
                            <form onSubmit={handleCheckout} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                    <textarea
                                        required
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="Enter your full address..."
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 h-24 resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCheckingOut(false)}
                                        className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
