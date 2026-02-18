import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import { Navigate } from 'react-router-dom';

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'ADMIN') return <AdminDashboard />;
    if (user.role === 'MANAGER') return <ManagerDashboard />;
    return <Navigate to="/catalog" />;
}
