"use client"

import React from "react"

const ItemsContext = React.createContext(null)

export default function FridgeItemsProvider({ children }: {
    children: React.ReactNode
})  {
    const [fridgeItems, setFridgeItems] = React.useState<Array<any>>([])

    return (
        <ItemsContext.Provider value={[fridgeItems, setFridgeItems]}>
            {children}
        </ItemsContext.Provider>
    )
}

export const useItems = () => {
    const context = React.useContext(ItemsContext)
    if (!context) {
        throw new Error("useItems must be used within a FridgeItemsProvider")
    }
    return context
}
