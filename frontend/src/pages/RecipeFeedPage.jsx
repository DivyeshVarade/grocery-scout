import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import RecipeModal from '../components/RecipeModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useToast } from '../context/ToastContext';
import { Trash2 } from 'lucide-react';

export default function RecipeFeedPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);

    useEffect(() => {
        if (user) {
            // Logged-in users see their own + manager recipes (filtered by backend)
            api.get('/user/recipes').then(r => setRecipes(r.data)).catch(console.error).finally(() => setLoading(false));
        } else {
            // Not logged in — show public recipes
            api.get('/public/recipes').then(r => setRecipes(r.data)).catch(console.error).finally(() => setLoading(false));
        }
    }, [user]);

    const isOwnRecipe = (recipe) => user && recipe.creator?.email === user.email;
    const isManagerRecipe = (recipe) => recipe.creator?.role === 'MANAGER';

    const promptDelete = (e, recipe) => {
        e.stopPropagation();
        setRecipeToDelete(recipe);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!recipeToDelete) return;

        api.delete(`/user/recipes/${recipeToDelete.id}`)
            .then(() => {
                setRecipes(prev => prev.filter(r => r.id !== recipeToDelete.id));
                const msg = isOwnRecipe(recipeToDelete) ? "Recipe deleted permanently" : "Recipe removed from your feed";
                addToast(msg, "success");
                setIsDeleteModalOpen(false);
                setRecipeToDelete(null);
            })
            .catch(err => {
                console.error(err);
                addToast("Failed to delete recipe", "error");
                setIsDeleteModalOpen(false);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Generated Recipe Feed</h1>
                    <p className="text-gray-500">Your recipes and chef-curated recipes, powered by AI</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <span className="text-6xl block mb-4">👨‍🍳</span>
                        <p className="text-lg">No recipes yet</p>
                        <p className="text-sm mt-1">Generate recipes using the Chef Assistant to see them here</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {recipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative"
                            >
                                <div
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="h-44 bg-gray-100 flex items-center justify-center relative overflow-hidden"
                                >
                                    {recipe.imageUrl ? (
                                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">🍽️</span>
                                    )}

                                    {/* Source Badge */}
                                    <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm z-10 ${isOwnRecipe(recipe)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-amber-500 text-white'
                                        }`}>
                                        {isOwnRecipe(recipe) ? '👤 By You' : '👨‍🍳 By Chef'}
                                    </span>

                                    {/* Delete Button — visible for own recipes + manager recipes (not other users') */}
                                    {user && (user.role === 'ADMIN' || isOwnRecipe(recipe) || isManagerRecipe(recipe)) && (
                                        <button
                                            onClick={(e) => promptDelete(e, recipe)}
                                            className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 shadow-md z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                                            title={isOwnRecipe(recipe) ? "Delete permanently" : "Remove from your feed"}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div onClick={() => setSelectedRecipe(recipe)} className="p-5">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-green-600 transition-colors">{recipe.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.instructions?.slice(0, 100)}...</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>⏱ {recipe.prepTime || 'Quick'}</span>
                                        <span>📊 {recipe.difficulty || 'Easy'}</span>
                                        <span>🧾 {recipe.ingredients?.length || 0} items</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recipe Detail Modal */}
            {selectedRecipe && (
                <RecipeModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                recipeName={recipeToDelete?.title}
            />

            <Footer />
        </div >
    );
}

