import { useState } from 'react';
import { Heart, ShoppingCart, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const INSTRUCTIONS = [
    { num: '1', title: 'Interact', desc: 'Click the floating chef icon or use the sidebar to start a conversation about your meal.' },
    { num: '2', title: 'Request', desc: "Tell us what you want to cook or list what's left in your fridge." },
    { num: '3', title: 'Magic', desc: 'Our AI generates a custom recipe and matches it with store inventory.' },
    { num: '4', title: 'Shop', desc: 'Review your ingredients, swap brands, and checkout in one tap.' },
];

const QUICK_TAGS = ['Chicken Biryani', 'Puran Poli', 'Paneer Tikka', 'Dal Makhani'];

export default function ChefAssistantPage() {
    const [prompt, setPrompt] = useState('');
    const [servings, setServings] = useState('4');
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim() || loading) return;
        setError('');
        setLoading(true);
        setIsSaved(false); // Reset save state for new recipe
        try {
            const res = await api.post('/user/chef/generate', { prompt: `${prompt}. Servings: ${servings}` });
            setRecipe(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate recipe. Make sure you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    const [buttonFeedback, setButtonFeedback] = useState('');
    const { addToast } = useToast();
    const cartCtx = useCart();
    const fetchCart = cartCtx?.fetchCart;

    const handleAddToCart = async () => {
        if (!fetchCart) {
            console.error("Cart Context not available");
            addToast("Error: Cart system not loaded. Please refresh.", "error");
            return;
        }
        if (!recipe?.ingredients) return;

        setAddingToCart(true);
        let addedCount = 0;
        let errors = 0;

        for (const ing of recipe.ingredients) {
            if (ing.linkedProduct && ing.linkedProduct.id) {
                try {
                    await api.post('/user/cart/add', {
                        productId: ing.linkedProduct.id,
                        quantity: 1
                    });
                    addedCount++;
                } catch (e) {
                    console.error("Failed to add item:", ing.name, e);
                    errors++;
                }
            }
        }

        // Refresh cart state globally
        await fetchCart();

        setAddingToCart(false);

        // UX Feedback (Toast + Button Text)
        if (addedCount > 0) {
            setButtonFeedback(`Added ${addedCount} items!`);
            addToast(`Successfully added ${addedCount} items to cart`, "success");

            // Revert button text after 2 seconds
            setTimeout(() => setButtonFeedback(''), 2000);
        } else if (errors > 0) {
            addToast("Failed to add items to cart", "error");
        } else {
            addToast("No matching products found for these ingredients", "info");
        }
    };

    const toggleSave = () => {
        setIsSaved(!isSaved);
        // In a real app, you would call an API here to persist the save
    };

    const estimatedCost = recipe?.ingredients?.reduce((acc, ing) => acc + (ing.linkedProduct?.price || 0), 0) || 0;
    const matchedCount = recipe?.ingredients?.filter(i => i.linkedProduct).length || 0;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC]">
            {/* Height 100vh minus rounded 64px navbar height if needed, or just h-full if parent dictates */}

            {/* Left Panel - Input Form */}
            <div className="w-[380px] bg-white border-r border-gray-100 p-6 shrink-0 overflow-y-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Chef Assistant</h1>
                <p className="text-sm text-gray-500 mb-6">Create recipes tailored to your taste and inventory.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dish / Ingredients</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400">🍳</span>
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="e.g. Spicy Chicken Curry"
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Servings</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {QUICK_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setPrompt(tag)}
                                className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full py-3 rounded-lg bg-green-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>✨ Generate Recipe</>
                        )}
                    </button>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                </div>
            </div>

            {/* Right Panel - Recipe Display */}
            <div className="flex-1 p-6 overflow-y-auto relative pb-32">
                {!recipe && !loading && (
                    <div className="grid grid-cols-4 gap-4 mb-10">
                        {INSTRUCTIONS.map(step => (
                            <div key={step.num} className="bg-white rounded-xl border border-gray-100 p-4">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-2 font-bold">{step.num}</div>
                                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                                <p className="text-xs text-gray-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Chef is cooking up your recipe...</p>
                    </div>
                )}

                {recipe && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h2>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span>⏱ {recipe.prepTime || '30 mins'}</span>
                                    <span>📊 {recipe.difficulty || 'Easy'}</span>
                                </div>
                            </div>
                            <div className="text-6xl opacity-20">🍽️</div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-24">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🛒 Ingredients</h3>
                                <div className="space-y-3">
                                    {recipe.ingredients?.map((ing, i) => (
                                        <div key={i} className="flex justify-between items-start p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${ing.linkedProduct ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className={`font-medium ${ing.linkedProduct ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                                        {ing.name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 pl-4 mt-0.5">{ing.quantity}</p>
                                            </div>
                                            {ing.linkedProduct && (
                                                <div className="text-right">
                                                    <span className="block text-sm font-bold text-green-600">₹{ing.linkedProduct.price}</span>
                                                    <span className="text-xs text-gray-400">In Stock</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">📖 Instructions</h3>
                                <div className="space-y-4">
                                    {Array.isArray(recipe.instructions)
                                        ? recipe.instructions.map((step, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                                            </div>
                                        ))
                                        : recipe.instructions?.split('\n').filter(s => s.trim()).map((step, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="fixed bottom-0 left-[380px] right-0 bg-white border-t border-gray-200 p-4 px-8 flex items-center justify-between z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Cost</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">₹{estimatedCost.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">({matchedCount} items)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleSave}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium border transition-colors ${isSaved
                                        ? 'bg-pink-50 text-pink-600 border-pink-200'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'
                                        }`}
                                >
                                    <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                                    <span>{isSaved ? 'Saved!' : 'Save Recipe'}</span>
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    id="add-all-btn"
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {addingToCart ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ShoppingCart size={20} />
                                    )}
                                    {buttonFeedback || 'Add All to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
