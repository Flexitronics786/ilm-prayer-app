import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface MosqueInfo {
    id: string;
    name: string;
    shortName: string;
    showMithal1: boolean;
    googleSheetUrl?: string;
}

export const MOSQUES: MosqueInfo[] = [
    {
        id: "dundee_central",
        name: "Dundee Central Mosque",
        shortName: "Central",
        showMithal1: true,
        googleSheetUrl: "https://docs.google.com/spreadsheets/d/12wa17Tk_JCSmXoIXYUgrGEgsUjrKzwWrtTe4GgoBf2k/edit?usp=sharing"
    },
    {
        id: "al_maktoum",
        name: "Al Maktoum Mosque",
        shortName: "Al Maktoum",
        showMithal1: false,
        googleSheetUrl: "https://docs.google.com/spreadsheets/d/1_3WCMQ4X5MLjFtyce3VgBBUAxwlF_u9rr87nXqejYWU/edit?usp=sharing"
    },
    {
        id: "bilal",
        name: "Jamia Masjid Bilal",
        shortName: "Bilal",
        showMithal1: false,
        googleSheetUrl: "https://docs.google.com/spreadsheets/d/10LPLiUzagD0HGc1fDSiMYDGUbevG8T6OUNXoANP1GJ8/edit?usp=sharing"
    },
];

const STORAGE_KEY = "selected-mosque";

interface MosqueContextType {
    selectedMosque: string;
    mosqueInfo: MosqueInfo;
    setMosque: (mosqueId: string) => void;
    isFirstVisit: boolean;
    setFirstVisitDone: () => void;
}

const MosqueContext = createContext<MosqueContextType | undefined>(undefined);

export const MosqueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedMosque, setSelectedMosque] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY) || "";
    });
    const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
        return !localStorage.getItem(STORAGE_KEY);
    });

    const mosqueInfo = MOSQUES.find(m => m.id === selectedMosque) || MOSQUES[0];

    const setMosque = (mosqueId: string) => {
        setSelectedMosque(mosqueId);
        localStorage.setItem(STORAGE_KEY, mosqueId);
    };

    const setFirstVisitDone = () => {
        setIsFirstVisit(false);
    };

    return (
        <MosqueContext.Provider value={{ selectedMosque, mosqueInfo, setMosque, isFirstVisit, setFirstVisitDone }}>
            {children}
        </MosqueContext.Provider>
    );
};

export const useMosque = (): MosqueContextType => {
    const context = useContext(MosqueContext);
    if (!context) {
        throw new Error("useMosque must be used within a MosqueProvider");
    }
    return context;
};
