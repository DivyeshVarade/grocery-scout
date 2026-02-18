import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, LayoutDashboard, Package, ClipboardList, Truck, BarChart3 } from 'lucide-react';

export default function Sidebar({ items, collapsed, setCollapsed }) {
    const { user } = useAuth();
    // const [collapsed, setCollapsed] = useState(false); // Controlled by parent now

    // If setCollapsed is not provided (e.g. legacy usage), default to internal state? 
    // For now, let's assume it's controlled or we add a fallback.
    // Actually, to avoid breaking other pages (MainLayout?), we should handle both.

    // Internal state fallback if props not provided
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
    const toggle = () => {
        if (setCollapsed) {
            setCollapsed(!isCollapsed);
        } else {
            setInternalCollapsed(!internalCollapsed);
        }
    };

    return (
        <aside
            className={`${isCollapsed ? 'w-20' : 'w-64'} min-h-screen bg-[#0F172A] flex flex-col py-6 px-4 shrink-0 transition-all duration-300 relative`}
        >
            <button
                onClick={toggle}
                className="absolute -right-3 top-10 bg-white text-gray-900 rounded-full p-1 border border-gray-200 shadow-sm hover:bg-gray-50 z-10"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={`flex items-center gap-3 mb-8 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">G</span>
                </div>
                {!isCollapsed && <span className="text-lg font-bold text-white transition-opacity duration-300">GroceryScout</span>}
            </div>

            <nav className="flex flex-col gap-1 flex-1">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-green-600/15 text-green-400'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            } ${isCollapsed ? 'justify-center' : ''}`
                        }
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="text-xl shrink-0">{item.icon}</span>
                        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {user && (
                <div className={`mt-auto pt-4 border-t border-gray-800 ${isCollapsed ? 'px-0 flex justify-center' : 'px-2'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-sm text-gray-300">{user.email?.[0]?.toUpperCase()}</span>
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 transition-opacity duration-300">
                                <p className="text-sm font-medium text-gray-200 truncate">
                                    {user.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
}
