import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, recipeName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={20} />
                        <h3 className="font-bold text-lg">Delete Recipe</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 mb-2">
                        Are you sure you want to delete <span className="font-bold text-gray-900">"{recipeName}"</span>?
                    </p>
                    <p className="text-sm text-gray-400">
                        This action cannot be undone. All associated ingredients and instructions will be removed.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-200 transition-colors"
                    >
                        Delete Recipe
                    </button>
                </div>
            </div>
        </div>
    );
}
