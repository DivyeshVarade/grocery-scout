import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ManagerHome from './manager/ManagerHome';
import ManagerOrders from './manager/ManagerOrders';
import ManagerOrderHistory from './manager/ManagerOrderHistory';
import ManagerInventory from './manager/ManagerInventory';
import { LayoutDashboard, Package, ClipboardList, Truck, BarChart3 } from 'lucide-react';

// Placeholder components
const Drivers = () => <div className="text-gray-500 p-10">Drivers Management (Coming Soon)</div>;
const Reports = () => <div className="text-gray-500 p-10">Reports & Analytics (Coming Soon)</div>;

const SIDEBAR_ITEMS = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
    { to: '/dashboard/orders', icon: <Package size={20} />, label: 'Active Orders' },
    { to: '/dashboard/inventory', icon: <ClipboardList size={20} />, label: 'Inventory' },
    { to: '/dashboard/drivers', icon: <Truck size={20} />, label: 'Drivers' },
    { to: '/dashboard/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
];

export default function ManagerDashboard() {
    // If we have a sticky Navbar, we might NOT need pt-16 if the Navbar is position sticky relative to this container?
    // Actually, Navbar is sticky top-0. 
    // If we remove pt-16, the content will start at top, under the navbar.
    // Wait, sticky elements take up space. Fixed elements do not.
    // Navbar component uses 'sticky'. So it takes space. 
    // So pt-16 is NOT needed on the container.
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <div className="fixed inset-y-0 left-0 top-16 z-40 h-[calc(100vh-64px)]">
                    <Sidebar items={SIDEBAR_ITEMS} />
                </div>

                <div className="flex-1 ml-20 p-8 overflow-y-auto min-h-[calc(100vh-64px)]">
                    <Routes>
                        <Route index element={<ManagerHome />} />
                        <Route path="orders" element={<ManagerOrders />} />
                        <Route path="order-history" element={<ManagerOrderHistory />} />
                        <Route path="inventory" element={<ManagerInventory />} />
                        <Route path="drivers" element={<Drivers />} />
                        <Route path="reports" element={<Reports />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
