import { useState, useEffect } from 'react';
import api from '../../api/axios';
import ProductFormModal from '../../components/ProductFormModal';
import { Plus, Edit2, Search } from 'lucide-react';

export default function ManagerInventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState('');

    const fetchProducts = () => {
        setLoading(true);
        api.get('/public/products')
            .then(res => setProducts(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddClick = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (editingProduct) {
                await api.put(`/admin/products/${editingProduct.id}`, formData);
            } else {
                await api.post('/admin/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product. Check console for details.");
        }
    };

    const filtered = products.filter(p =>
        search === '' ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div>Loading inventory...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-sm mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
            </div>

            <p className="text-xs text-gray-400 mb-3">{filtered.length} of {products.length} products</p>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No products match "{search}"
                                </td>
                            </tr>
                        ) : (
                            filtered.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl overflow-hidden border border-gray-200">
                                            {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : '📦'}
                                        </div>
                                        <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">₹{p.price}/{p.unit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-mono ${p.inventoryCount === 0
                                                ? 'text-red-600 font-bold'
                                                : p.inventoryCount <= 10
                                                    ? 'text-orange-600 font-semibold'
                                                    : 'text-gray-500'
                                            }`}>
                                            {p.inventoryCount === 0 ? 'Out of Stock' : p.inventoryCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEditClick(p)}
                                            className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                            title="Edit Product"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
