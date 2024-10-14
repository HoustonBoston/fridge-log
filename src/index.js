import React from 'react';
import ReactDOM from 'react-dom/client'
import ItemInfoField from './components/fields/ItemInfoField';
import AddItemButton from './components/buttons/AddItemButton';
import { Box } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'))

const handleAddItem = () => {

}

root.render(
    <>
        <Box sx={{
            display: 'flex',            // Use flexbox for layout
            justifyContent: 'center',   // Center the entire layout horizontally
            alignItems: 'center',       // Align items vertically
        }}>
            <Box>
                <AddItemButton handleAddItem={handleAddItem} />
            </Box>
        </Box>
        <ItemInfoField />
    </>
)