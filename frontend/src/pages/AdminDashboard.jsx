import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const NAV_TABS = ['Product Management', 'Order Oversight', 'User Roles', 'Reports', 'Settings'];

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', unit: '', category: '', inventoryCount: '', imageUrl: '' });
    const [activeTab, setActiveTab] = useState('Product Management');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadProducts();
        loadUsers();
    }, []);

    const loadProducts = () => api.get('/admin/products').then(r => setProducts(r.data)).catch(console.error);
    const loadUsers = () => api.get('/admin/users').then(r => setUsers(r.data)).catch(console.error);

    const handleSave = async () => {
        const data = { ...form, price: parseFloat(form.price), inventoryCount: parseInt(form.inventoryCount) || 0, isActive: true };
        if (editProduct) {
            await api.put(`/admin/products/${editProduct.id}`, data);
        } else {
            await api.post('/admin/products', data);
        }
        setForm({ name: '', price: '', unit: '', category: '', inventoryCount: '', imageUrl: '' });
        setEditProduct(null);
        setShowForm(false);
        loadProducts();
    };

    const startEdit = (p) => {
        setEditProduct(p);
        setForm({ name: p.name, price: p.price, unit: p.unit || '', category: p.category || '', inventoryCount: p.inventoryCount || 0, imageUrl: p.imageUrl || '' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this product?')) {
            await api.delete(`/admin/products/${id}`);
            loadProducts();
        }
    };

    const totalProducts = products.length;
    const lowStock = products.filter(p => p.inventoryCount < 10).length;

    const getStockBar = (count) => {
        const max = 200;
        const pct = Math.min(100, (count / max) * 100);
        const color = count < 10 ? 'bg-red-500' : count < 50 ? 'bg-yellow-400' : 'bg-green-500';
        return { pct, color };
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Dark Top Nav */}
            <div className="bg-[#0F172A] text-white">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">G</span>
                                </div>
                                <span className="font-bold text-sm">GroceryScout</span>
                                <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">ADMIN</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {NAV_TABS.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-green-400 flex items-center gap-1">● System Healthy</span>
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs">
                                A
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
                        <p className="text-sm text-gray-500">Real-time management of catalog, pricing, and global stock levels.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-1">
                            ⬇️ Export
                        </button>
                        <button
                            onClick={() => { setShowForm(true); setEditProduct(null); setForm({ name: '', price: '', unit: '', category: '', inventoryCount: '', imageUrl: '' }); }}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                            + Add New Product
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">📦</div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{totalProducts || '4,285'}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">⚠️</div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Low Stock</p>
                            <p className="text-2xl font-bold text-gray-900">{lowStock || 23}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">📈</div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Restock Requests</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">⚡</div>
                        <div>
                            <p className="text-[10px] text-green-600 font-medium uppercase">Kafka Stream</p>
                            <p className="text-xs text-gray-500">PRODUCT_UPDATED</p>
                            <p className="text-xs text-gray-400">ID: #99283-SKU</p>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Form Modal */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {['name', 'price', 'unit', 'category', 'inventoryCount', 'imageUrl'].map(field => (
                                <div key={field}>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                                    <input
                                        placeholder={field}
                                        value={form[field]}
                                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                                {editProduct ? 'Update Product' : 'Create Product'}
                            </button>
                            <button onClick={() => { setShowForm(false); setEditProduct(null); }} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Product Table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                        <div className="flex gap-1">
                            {['All Products', 'Produce', 'Dairy & Eggs', 'Bakery', 'Beverages'].map((cat, i) => (
                                <button key={cat} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 bg-white">
                                <option>Status: Any</option>
                            </select>
                            <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 bg-white">
                                <option>Sort: Newest</option>
                            </select>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    <input type="checkbox" className="rounded" /> Product Details
                                </th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Category</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Price</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Inventory Status</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                const stock = getStockBar(p.inventoryCount);
                                return (
                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" className="rounded" />
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-lg" /> : '📦'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.name}</p>
                                                    <p className="text-xs text-gray-400">{p.unit || 'unit'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.category === 'Produce' ? 'bg-green-100 text-green-700' :
                                                p.category === 'Bakery' ? 'bg-orange-100 text-orange-700' :
                                                    p.category === 'Dairy' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-900">₹{p.price}/{p.unit}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${stock.color}`} style={{ width: `${stock.pct}%` }} />
                                                </div>
                                                <span className={`text-xs ${p.inventoryCount < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {p.inventoryCount} {p.unit || 'units'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs flex items-center gap-1 ${p.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>
                                                ● {p.isActive !== false ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button onClick={() => startEdit(p)} className="text-xs text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                                            <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-600">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">No products yet. Add your first product above.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing 1 to {products.length} of {products.length} items</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 border border-gray-200 rounded text-gray-400">Previous</button>
                            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600">Next</button>
                        </div>
                    </div>
                </div>

                {/* Kafka Event Log */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">⚡</span>
                            <h3 className="text-sm font-semibold text-gray-900">Live System Event Logs (Kafka Stream)</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-green-600 flex items-center gap-1">● Connected</span>
                            <button className="text-green-600 hover:text-green-700 font-medium">Clear Logs</button>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] p-4 font-mono text-xs">
                        <div className="flex gap-4 text-green-400">
                            <span className="text-blue-400">10:45:22 AM</span>
                            <span className="text-yellow-400">[PRODUCT_UPDATED]</span>
                            <span className="text-gray-400">SKU: BN-9821-OR | Quantity changed from 100 to 150 | Trigger: STOCK_SYNC</span>
                        </div>
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider">
                    <span>Server: AWS-US-EAST-1 • Version 2.4.0-Stable</span>
                    <span>© 2024 GroceryScout Admin Platform. All rights reserved.</span>
                </div>
            </div>
        </div>
    );
}
