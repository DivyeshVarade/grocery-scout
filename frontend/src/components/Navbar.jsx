import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // Import CartContext
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react'; // Import Icons

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart(); // Get cart count
    const navigate = useNavigate();
    const location = useLocation();

    // Allow navbar on dashboard now, as per user request "Keep the header navbar on every page"
    // const isDashboard = location.pathname === '/dashboard' || location.pathname === '/chef';
    // if (isDashboard) return null; 

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLink = (to, label) => (
        <Link
            to={to}
            className={`text-sm font-medium transition-colors ${location.pathname === to ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
                }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        {/* Mobile Menu Button - Placeholder for sidebar toggle if needed globally */}
                        {/* <button className="md:hidden text-gray-500"><Menu size={24} /></button> */}

                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">G</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">GroceryScout</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            {navLink('/catalog', 'Shop')}
                            {navLink('/recipes', 'Recipes')}
                            {navLink('/chef', 'AI Assistant')}
                            {user && navLink('/orders', 'My Orders')}
                            {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && navLink('/dashboard', 'Dashboard')}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Cart Icon */}
                        {user && (
                            <Link to="/cart" className="relative text-gray-500 hover:text-green-600 transition-colors">
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                        <User size={16} />
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-gray-700">
                                        {user.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                    Log in
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
