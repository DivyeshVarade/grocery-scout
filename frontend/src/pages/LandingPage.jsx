import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const CATEGORIES = [
    { name: 'Produce', sub: 'Fresh Fruits', img: '🥬' },
    { name: 'Dairy & Eggs', sub: 'Farm Fresh', img: '🥛' },
    { name: 'Meat & Seafood', sub: 'Premium Cuts', img: '🥩' },
    { name: 'Bakery', sub: 'Daily Baked', img: '🍞' },
];

const STEPS = [
    { num: '1', title: 'Select Ingredients', desc: 'Shop as usual or simply scan items you already have in your fridge.' },
    { num: '2', title: 'Ask AI Chef', desc: "What's dinner with chicken and spinach? Our AI gets to work instantly." },
    { num: '3', title: 'Get Custom Recipe', desc: 'Receive a step-by-step recipe tailored to your ingredients and dietary needs.' },
];

const TRENDING = [
    { title: 'Superfood Green Bowl', desc: 'A nutrient-packed bowl loaded with greens, avocado, and quinoa.', tag: 'AI Optimized', time: '25 mins' },
    { title: 'One-Pot Basil Pasta', desc: 'All ingredients in one pot. Simple, the weeknight dinner revolution.', tag: 'AI Optimized', time: '20 mins' },
    { title: 'Citrus Glazed Salmon', desc: 'Perfect light balance between citrus sweetness and savory fish.', tag: 'AI Optimized', time: '30 mins' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-green-50 to-white overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-6">
                        🚀 Powered By AI Assistant To Dishes
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                        Fresh Groceries,<br />
                        <span className="text-green-600">Smarter Cooking.</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
                        Shop your essentials and let our AI Chef turn them into tonight's dinner.
                        Discover recipes based on what's in your cart.
                    </p>
                    <div className="max-w-xl mx-auto relative mb-4">
                        <input
                            type="text"
                            placeholder="Search for organic apples, pasta, or chicken items..."
                            className="w-full px-5 py-3.5 pl-12 rounded-full bg-white border border-gray-200 shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <span className="absolute left-4 top-4 text-gray-400">🔍</span>
                        <button className="absolute right-2 top-1.5 px-5 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors">
                            Find
                        </button>
                    </div>
                    <div className="flex justify-center gap-2 text-xs text-gray-400">
                        <span>Popular:</span>
                        {['🥑 Avocados', '🧈 Butter', '🌾 Quinoa'].map(t => (
                            <span key={t} className="text-gray-500 hover:text-green-600 cursor-pointer">{t}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop by Category */}
            <section className="max-w-[1400px] mx-auto px-6 py-16">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                        <p className="text-sm text-gray-500 mt-1">High quality essentials delivered to your door.</p>
                    </div>
                    <Link to="/catalog" className="text-sm text-green-600 font-medium hover:text-green-700">View All →</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {CATEGORIES.map(cat => (
                        <Link
                            key={cat.name}
                            to="/catalog"
                            className="group relative h-48 rounded-2xl bg-gray-100 overflow-hidden flex items-end p-5 hover:shadow-lg transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40 group-hover:scale-110 transition-transform">
                                {cat.img}
                            </div>
                            <div className="relative z-20">
                                <h3 className="text-white font-semibold text-base">{cat.name}</h3>
                                <p className="text-white/70 text-xs">{cat.sub}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* AI Sous-Chef Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-[1400px] mx-auto px-6 text-center">
                    <p className="text-xs font-semibold text-green-600 tracking-wider uppercase mb-2">Powered by ScoutAI™</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Personal AI Sous-Chef</h2>
                    <p className="text-gray-500 max-w-lg mx-auto mb-12">
                        Don't know what to cook? Our AI analyzes your cart and pantry to suggest perfect recipes instantly.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
                        {STEPS.map(step => (
                            <div key={step.num} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold mb-4 mx-auto">
                                    {step.num}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Link
                        to="/chef"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        🤖 Try AI Assistant Now
                    </Link>
                </div>
            </section>

            {/* Trending Recipes */}
            <section className="max-w-[1400px] mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Trending AI Recipes</h2>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600">←</button>
                        <button className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600">→</button>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {TRENDING.map(recipe => (
                        <div key={recipe.title} className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                            <div className="h-44 bg-gray-100 relative flex items-center justify-center">
                                <span className="text-6xl opacity-30">🍽️</span>
                                <span className="absolute top-3 left-3 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">
                                    {recipe.tag}
                                </span>
                                <span className="absolute bottom-3 left-3 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                                    ⏱ {recipe.time}
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1">{recipe.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.desc}</p>
                                <Link to="/recipes" className="text-sm text-green-600 font-medium hover:text-green-700">
                                    View Recipe →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-green-50 py-16">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Start Cooking Smarter Today</h2>
                        <p className="text-gray-500 mb-6">
                            Join thousands of foodies saving time and reducing waste with GroceryScout.
                        </p>
                        <div className="flex gap-3">
                            <Link to="/login" className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                Create Free Account
                            </Link>
                            <Link to="/catalog" className="px-5 py-2.5 border border-green-600 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                                Explore Shop
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
