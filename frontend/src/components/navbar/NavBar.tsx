import './NavBar.css'

import { LogoutOutlined, SearchOutlined } from '@mui/icons-material'
import { Box, IconButton, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

import { useSearch } from '../../contexts/SearchContext'


export default function NavBar() {
    const [searchOpen, setSearchOpen] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useSearch()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSearchClick = () => {
        setSearchOpen(!searchOpen)
        if (searchOpen) {
            // Clear search when closing
            setSearchQuery('')
        }
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    useEffect(() => {
        if (searchOpen && inputRef.current) {
            // Small delay to ensure the animation starts before focusing
            setTimeout(() => {
                inputRef.current?.focus()
            }, 320)
        }
    }, [searchOpen])

    return (
        <header className="navbar">
            <Box className="nav-btns" sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
                <Box
                    sx={{
                        flex: searchOpen ? 1 : 0,
                        opacity: searchOpen ? 1 : 0,
                        transition: 'flex 0.3s ease, opacity 0.3s ease',
                        overflow: 'hidden',
                    }}
                >
                    <TextField
                        inputRef={inputRef}
                        size="small"
                        placeholder="Search..."
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            },
                            "input::placeholder": {
                                color: 'black',
                                opacity: 0.9
                            }
                        }}
                    />
                </Box>
                <IconButton onClick={handleSearchClick} sx={{ color: 'white' }}>
                    <SearchOutlined />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                    <LogoutOutlined />
                </IconButton>
            </Box>
        </header>
    )
}
