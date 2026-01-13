"use client"

import React from "react"

const SearchContext = React.createContext(null)

export default function SearchProvider({ children }: {
    children: React.ReactNode
})  {
    const [searchQuery, setSearchQuery] = React.useState<string>("")

    return (
        <SearchContext.Provider value={[searchQuery, setSearchQuery]}>
            {children}
        </SearchContext.Provider>
    )
}

export const useSearch = () => {
    const context = React.useContext(SearchContext)
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider")
    }
    return context
}
