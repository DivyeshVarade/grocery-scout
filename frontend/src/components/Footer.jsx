import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">G</span>
                            </div>
                            <span className="text-base font-bold text-white">GroceryScout</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Your smart grocery companion with AI-powered recipe suggestions.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            <Link to="/catalog" className="hover:text-white transition-colors">Produce</Link>
                            <Link to="/catalog" className="hover:text-white transition-colors">Meat & Seafood</Link>
                            <Link to="/catalog" className="hover:text-white transition-colors">Pantry</Link>
                            <Link to="/catalog" className="hover:text-white transition-colors">Bakery</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            <Link to="/recipes" className="hover:text-white transition-colors">Recipes</Link>
                            <Link to="/chef" className="hover:text-white transition-colors">AI Assistant</Link>
                            <Link to="/catalog" className="hover:text-white transition-colors">Pricing</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            <span className="hover:text-white cursor-pointer transition-colors">About Us</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Careers</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
                        </div>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between text-xs">
                    <span>© 2024 GroceryScout Inc. All rights reserved.</span>
                    <div className="flex gap-4">
                        <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-white cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
