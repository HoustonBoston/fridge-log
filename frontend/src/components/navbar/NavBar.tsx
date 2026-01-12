import './NavBar.css'

import { SearchOutlined } from '@mui/icons-material'
import { Box, IconButton, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function NavBar() {
    const [searchOpen, setSearchOpen] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSearchClick = () => {
        setSearchOpen(!searchOpen)
    }

    useEffect(() => {
        if (searchOpen && inputRef.current) {
            // Small delay to ensure the animation starts before focusing
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [searchOpen])

    return (
        <header className="navbar">
            <Box className="nav-btns" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: searchOpen ? '50vw' : '0px',
                        opacity: searchOpen ? 1 : 0,
                        transition: 'width 0.3s ease, opacity 0.3s ease',
                        overflow: 'hidden',
                        transformOrigin: 'right center',
                    }}
                >
                    <TextField
                        inputRef={inputRef}
                        size="small"
                        placeholder="Search..."
                        variant="outlined"
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            }
                        }}
                    />
                </Box>
                <IconButton onClick={handleSearchClick} sx={{ color: 'white' }}>
                    <SearchOutlined />
                </IconButton>
            </Box>
        </header>
    )
}
