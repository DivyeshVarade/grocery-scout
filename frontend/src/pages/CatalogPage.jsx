import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { Plus, Check } from 'lucide-react';

const RECIPES = [
    { name: 'Pav Bhaji', match: '98%', icon: '🍲' },
    { name: 'Biryani', match: '94%', icon: '🍚' },
    { name: 'Puran Poli', match: '🫓', icon: '🫓' },
];

export default function CatalogPage() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/public/products'),
                api.get('/public/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Failed to load catalog data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        const success = await addToCart(product.id, 1);
        if (success) {
            setAddedId(product.id);
            setTimeout(() => setAddedId(null), 1500);
        }
    };

    const filtered = products.filter(p =>
        (activeCategory === 'All' || p.category === activeCategory) &&
        (p.name?.toLowerCase().includes(search.toLowerCase()) || !search)
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Pills */}
            <div className="bg-white border-b border-gray-100 py-3 sticky top-1 z-40">
                <div className="max-w-[1400px] mx-auto px-6 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        🛒 All Products
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Recipe Match Banner */}
            <div className="max-w-[1400px] mx-auto px-6 mt-2">
                {/* Same Banner Code ... */}
                <div className="bg-gradient-to-r from-[#0F4A2E] to-[#166534] rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-500/30 text-green-200 px-2.5 py-1 rounded-full mb-4">
                            ✨ AI RECIPE MATCH
                        </span>
                        <h2 className="text-3xl font-bold mb-2">Feeling like Pav Bhaji or Biryani?</h2>
                        <p className="text-green-200/80 text-sm max-w-md mb-5">
                            Based on your selection, our AI recommends these authentic local favorites.
                            One tap to add all necessary ingredients to your cart.
                        </p>
                        <div className="flex gap-3">
                            {RECIPES.map(r => (
                                <div key={r.name} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                                    <span className="text-xl">{r.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-white">{r.name}</p>
                                        <p className="text-xs text-green-300">{r.match} Match</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative z-10">
                        <Link
                            to="/chef"
                            className="flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            💬 Ask Chef AI
                        </Link>
                        <p className="text-xs text-green-300/70 mt-2 text-right">✨ Powered by ScoutAI Engine</p>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Catalog › {activeCategory === 'All' ? 'All Products' : activeCategory}</p>
                        <h2 className="text-xl font-bold text-gray-900">Summer Harvest Essentials</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-48"
                            />
                        </div>

                        <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white">
                            <option>Sort: Popularity</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <span className="text-5xl block mb-4">📦</span>
                        <p className="text-lg">No products found</p>
                        <p className="text-sm mt-1">Try a different category or search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {filtered.map(product => (
                            <div key={product.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
                                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <span className="text-5xl opacity-20">🥬</span>
                                    )}
                                    {product.category === 'Produce' && (product.inventoryCount ?? 0) > 0 && (
                                        <span className="absolute top-2 left-2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-semibold tracking-wide">
                                            FRESH
                                        </span>
                                    )}
                                    {(product.inventoryCount === 0 || product.inventoryCount == null) && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                                OUT OF STOCK
                                            </span>
                                        </div>
                                    )}
                                    {(product.inventoryCount ?? 0) > 0 && product.inventoryCount <= 10 && (
                                        <span className="absolute top-2 right-2 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded font-semibold">
                                            Only {product.inventoryCount} left
                                        </span>
                                    )}
                                </div>
                                <div className="p-3.5 flex flex-col flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-green-600 transition-colors mb-1">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-bold text-gray-900">₹{product.price}<span className="text-gray-400 font-normal text-xs">/{product.unit}</span></span>
                                        {(product.inventoryCount === 0 || product.inventoryCount == null) ? (
                                            <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg cursor-not-allowed" title="Out of stock">
                                                Out of Stock
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${addedId === product.id
                                                    ? 'bg-green-600 text-white scale-110'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                                    }`}
                                            >
                                                {addedId === product.id ? <Check size={16} /> : <Plus size={16} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
