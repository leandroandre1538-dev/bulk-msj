import { createContext, useContext, useEffect, useState } from 'react';

// Estado visual del panel lateral: plegado en escritorio y abierto/cerrado en móvil.
const LayoutContext = createContext(null);

const readCollapsed = () => {
    try {
        return localStorage.getItem('sidebarCollapsed') === '1';
    } catch {
        return false;
    }
};

export function LayoutProvider({ children }) {
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
        } catch {
            /* sin almacenamiento disponible */
        }
    }, [collapsed]);

    return (
        <LayoutContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
            {children}
        </LayoutContext.Provider>
    );
}

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) throw new Error('useLayout must be used within a LayoutProvider');
    return context;
};
