"use client"

import React from "react"

const IsMobileContext = React.createContext(false)

export default function IsMobileProvider({ children }: {
    children: React.ReactNode
})  {
    const [isMobile, setIsMobile] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.innerWidth <= 768
    })
    
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        // Set initial value on mount (for SSR hydration)
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <IsMobileContext.Provider value={isMobile}>
            {children}
        </IsMobileContext.Provider>
    );
}

export const useIsMobile = () => {
    const context = React.useContext(IsMobileContext);
    if (context === undefined) {
        throw new Error("useIsMobile must be used within an IsMobileProvider");
    }
    return context;
}