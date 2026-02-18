import { X, Clock, BarChart3, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function RecipeModal({ recipe, onClose }) {
    const { user } = useAuth();
    const [addingToCart, setAddingToCart] = useState(false);
    const [saved, setSaved] = useState(false);

    if (!recipe) return null;

    // Parse ingredients if string
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const instructions = recipe.instructions || '';

    const { addToast } = useToast();
    const { fetchCart } = useCart();

    const handleAddToCart = async () => {
        setAddingToCart(true);
        let addedCount = 0;
        try {
            // This is a naive implementation: loop and add. 
            // Better: Bulk add endpoint. For now, sequential is fine for < 20 items.
            for (const ing of ingredients) {
                if (ing.linkedProduct) {
                    await api.post('/user/cart/add', {
                        productId: ing.linkedProduct.id,
                        quantity: 1
                    });
                    addedCount++;
                }
            }
            if (addedCount > 0) {
                await fetchCart(); // Refresh cart
                addToast(`Added ${addedCount} available ingredients to your cart!`, "success");
                onClose();
            } else {
                addToast("No available products found for this recipe.", "info");
            }
        } catch (error) {
            console.error("Failed to add ingredients:", error);
            addToast("Some items could not be added. Please try again.", "error");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSave = () => {
        setSaved(!saved);
        // Here we would call an API, but for now it's a visual toggle as requested
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Details */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>

                    <span className="text-green-600 font-bold text-sm tracking-wide uppercase mb-2 block">AI Chef Special</span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{recipe.title}</h2>

                    <div className="flex gap-6 mb-8 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Clock size={20} className="text-green-600" />
                            <span className="font-medium">{recipe.prepTime || '30 mins'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BarChart3 size={20} className="text-green-600" />
                            <span className="font-medium">{recipe.difficulty || 'Medium'}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Ingredients</h3>
                        <ul className="space-y-3">
                            {ingredients.map((ing, idx) => (
                                <li key={idx} className="flex items-start justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${ing.linkedProduct ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className={ing.linkedProduct ? 'text-gray-700' : 'text-gray-400 line-through'}>
                                            {ing.name} <span className="text-gray-400 text-sm">({ing.quantity})</span>
                                        </span>
                                    </div>
                                    {ing.linkedProduct && (
                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                            In Stock
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Instructions</h3>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            {instructions.split('\n').map((step, idx) => step.trim() && (
                                <p key={idx} className="flex gap-4">
                                    <span className="font-bold text-green-600 font-mono">{idx + 1}.</span>
                                    {step}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side / Bottom: Actions & Image (placeholder) */}
                <div className="md:w-80 bg-gray-50 p-8 border-l border-gray-100 flex flex-col shrink-0">
                    <button
                        onClick={onClose}
                        className="hidden md:flex self-end p-2 hover:bg-gray-200 rounded-full text-gray-500 mb-10 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="space-y-4 mt-auto">
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {addingToCart ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    Add All to Cart
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleSave}
                            className={`w-full py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${saved
                                ? 'bg-pink-50 border-pink-200 text-pink-600'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <Heart size={20} className={saved ? 'fill-current' : ''} />
                            {saved ? 'Saved to Collection' : 'Save Recipe'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
