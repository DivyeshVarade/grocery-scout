import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ShoppingBag, ChefHat, FileText, ShoppingCart, ListOrdered } from 'lucide-react';

export default function MainLayout() {
    const sidebarItems = [
        { to: '/catalog', label: 'Shop', icon: <ShoppingBag size={20} /> },
        { to: '/recipes', label: 'Recipes', icon: <FileText size={20} /> },
        { to: '/chef', label: 'Chef AI', icon: <ChefHat size={20} /> },
        { to: '/cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
        { to: '/orders', label: 'My Orders', icon: <ListOrdered size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="sticky top-0 h-screen overflow-y-auto">
                <Sidebar items={sidebarItems} />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
