import React from "react";
import { MOSQUES, useMosque } from "@/contexts/MosqueContext";

const MosqueSelectorDialog: React.FC = () => {
    const { isFirstVisit, setMosque, setFirstVisitDone, selectedMosque } = useMosque();

    if (!isFirstVisit && selectedMosque) {
        return null;
    }

    const handleSelect = (mosqueId: string) => {
        setMosque(mosqueId);
        setFirstVisitDone();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-center">
                    <h2 className="text-2xl font-bold text-white">🕌 Select Your Mosque</h2>
                    <p className="text-emerald-100 text-sm mt-1">Choose a mosque to view prayer times</p>
                </div>

                {/* Mosque Options */}
                <div className="p-6 space-y-3">
                    {MOSQUES.map((mosque) => (
                        <button
                            key={mosque.id}
                            onClick={() => handleSelect(mosque.id)}
                            className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 
                hover:border-emerald-400 hover:bg-emerald-50 
                transition-all duration-200 group cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                                        {mosque.name}
                                    </div>
                                    <div className="text-sm text-gray-500">Dundee, Scotland</div>
                                </div>
                                <div className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                                    →
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MosqueSelectorDialog;
