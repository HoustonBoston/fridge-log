import * as React from 'react';
import { Box, Fab, Tooltip, Zoom, CircularProgress } from '@mui/material';
import { Add, Close, AddTask, PhotoCamera, Check, Error } from "@mui/icons-material";

/**
 * AddItemButton - A floating action button (FAB) component that expands to show
 * additional action options (Add Item and Camera).
 * 
 * @param {Function} handleAddItem - Callback function to add a new item
 * @param {Function} handleClickPicture - Callback function to handle camera image capture
 * @param {string} status - Status of the last action: 'idle' | 'success' | 'error'
 * @param {boolean} loading - Whether a picture is being processed
 */
export default function AddItemButton({ handleAddItem, handleClickPicture, status = 'idle', loading = false }) {
    // Reference to the hidden file input element for triggering camera/file picker
    const inputRef = React.useRef(null)
    
    // Reference to the FAB container for detecting clicks outside
    const fabRef = React.useRef(null)
    
    // State to track whether the FAB menu is expanded or collapsed
    const [open, setOpen] = React.useState(false)

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (fabRef.current && !fabRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open])

    // Determine FAB color based on status: green for success, red for error, primary for idle
    const getFabColor = () => {
        if (loading) return 'primary'  // Keep primary color while loading
        if (status === 'success') return 'success'
        if (status === 'error') return 'error'
        return 'primary'
    }

    // Determine which icon to show based on status
    const getFabIcon = () => {
        if (loading) return <CircularProgress size={24} color="inherit" />  // Show spinner while loading
        if (status === 'success') return <Check />
        if (status === 'error') return <Error />
        return open ? <Close /> : <Add />
    }

    // Toggle the menu open/closed state
    const handleToggle = () => setOpen((prev) => !prev)
    
    // Close the menu
    const handleClose = () => setOpen(false)

    // Opens the native file dialog for camera capture, then closes menu
    const handleOpenFileDialog = () => {
        if (inputRef.current)
            inputRef.current.click()
        handleClose()
    }

    // Handles adding a new item and closes the menu
    const handleAddItemClick = () => {
        handleAddItem()
        handleClose()
    }

    return (
        // Container for the FAB - fixed to bottom-right corner of viewport
        <Box
            ref={fabRef}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                display: 'flex',
                flexDirection: 'column',  // Stack buttons vertically
                alignItems: 'center',
                gap: 1.5,                  // Spacing between buttons
                zIndex: 1000,              // Ensure FAB stays above other content
            }}
        >
            {/* Hidden file input - triggered programmatically for camera capture */}
            <input
                id="cameraFileInput"
                type="file"
                accept="image/*"           // Only accept image files
                capture="environment"      // Use rear camera on mobile devices
                onChange={handleClickPicture}
                ref={inputRef}
                style={{ display: 'none' }}
            />

            {/* Camera button - appears first (top) when menu is expanded */}
            {/* Zoom animation with 100ms delay for staggered effect */}
            <Zoom in={open} style={{ transitionDelay: open ? '100ms' : '0ms' }}>
                <Tooltip title="Camera" placement="left">
                    <Fab
                        size="small"
                        color="secondary"
                        aria-label="camera"
                        onClick={handleOpenFileDialog}
                        sx={{ 
                            display: open ? 'flex' : 'none',  // Hide when menu closed
                        }}
                    >
                        <PhotoCamera />
                    </Fab>
                </Tooltip>
            </Zoom>

            {/* Add Item button - appears second when menu is expanded */}
            {/* Zoom animation with 50ms delay (appears slightly before camera) */}
            <Zoom in={open} style={{ transitionDelay: open ? '50ms' : '0ms' }}>
                <Tooltip title="Add Item" placement="left">
                    <Fab
                        size="small"
                        color="secondary"
                        aria-label="add item"
                        onClick={handleAddItemClick}
                        onBlur={handleClose}
                        sx={{ 
                            display: open ? 'flex' : 'none',  // Hide when menu closed
                        }}
                    >
                        <AddTask />
                    </Fab>
                </Tooltip>
            </Zoom>

            {/* Main FAB button - always visible, toggles the menu */}
            {/* Color changes: green (success), red (error), or primary (idle) */}
            {/* Rotates 45 degrees when open (+ becomes ×) */}
            <Fab
                color={getFabColor()}
                aria-label="add"
                onClick={handleToggle}
                sx={{
                    transition: 'transform 0.3s ease, background-color 0.3s ease',  // Smooth rotation and color animation
                    transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
            >
                {getFabIcon()}
            </Fab>
        </Box>
    )
}