import { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';

export default function ProductFormModal({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        unit: 'kg',
        inventoryCount: '',
        imageUrl: '',
        isActive: true
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || '',
                price: product.price || '',
                unit: product.unit || 'kg',
                inventoryCount: product.inventoryCount || '',
                imageUrl: product.imageUrl || '',
                isActive: product.isActive !== false
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. Fresh Tomatoes"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <input
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. Vegetables"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Price (₹)</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                            >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="l">l</option>
                                <option value="ml">ml</option>
                                <option value="pcs">pcs</option>
                                <option value="pack">pack</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Stock</label>
                            <input
                                name="inventoryCount"
                                type="number"
                                value={formData.inventoryCount}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Image URL</label>
                        <div className="flex gap-2">
                            <input
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="https://..."
                            />
                            {formData.imageUrl && (
                                <div className="w-10 h-10 rounded border overflow-hidden shrink-0">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            id="isActive"
                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">Product is Active (Visible to users)</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
