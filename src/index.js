import React, { useState } from 'react';
import ReactDOM from 'react-dom/client'
import ItemInfoField from './components/fields/ItemInfoField';
import AddItemButton from './components/buttons/AddItemButton';
import { Box } from '@mui/material';

import {initialTasks} from './local-data/initialData.js'
const root = ReactDOM.createRoot(document.getElementById('root'))


function App() {
    const [fridgeItems, setFridgeItems] = useState(initialTasks)

    const handleAddItem = () => {
        const item = {
            "item_id": 2
        }
        setFridgeItems([...fridgeItems, item])
    }

    return (
        <>

            <Box sx={{
                display: 'flex',            // Use flexbox for layout
                justifyContent: 'center',   // Center the entire layout horizontally
                alignItems: 'center',       // Align items vertically
            }}>
                <Box>
                    <AddItemButton handleAddItem={() => handleAddItem()} />
                </Box>
            </Box>
                {
                    fridgeItems.map((item, index) => {
                        return (
                            <ItemInfoField key={item.item_id} fridge_item={item} />
                        )
                    }
                    )
                }
        </>
    )
}

root.render(
    <App />
)