import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-50 rounded-xl text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{title || 'Confirm Delete'}</h2>
                    <p className="text-slate-500 leading-relaxed">
                        {message || 'Are you sure you want to delete this item?'}
                        {itemName && <span className="block mt-2 font-semibold text-slate-700">"{itemName}"</span>}
                    </p>
                    <p className="mt-4 text-sm text-red-600 font-medium">This action cannot be undone.</p>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl border border-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all"
                    >
                        Delete Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
