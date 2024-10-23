import React, { useState } from 'react';
import ReactDOM from 'react-dom/client'
import ItemInfoField from './components/fields/ItemInfoField';
import AddItemButton from './components/buttons/AddItemButton';
import { Box } from '@mui/material';

import { initialTasks } from './local-data/initialData.js'
import dayjs from "dayjs";
const root = ReactDOM.createRoot(document.getElementById('root'))


function App ()
{
    const [fridgeItems, setFridgeItems] = useState(initialTasks)

    const handleAddItem = () =>
    {
        const item = {
            item_id: 2,
            expiry_date: dayjs().hour(12),
            purchase_date: dayjs().hour(12)
        }
        setFridgeItems([...fridgeItems, item])
    }

    const handleDeleteItem = () => {
        
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
            <Box sx={{
                flexDirection: 'column',    // Stack items vertically
                alignItems: 'flex-start',   // Align items at the start of the container
            }}
            >
                {
                    fridgeItems.map((item, index) =>
                    {
                        return (
                            <ItemInfoField key={item.item_id} fridge_item={item} />
                        )
                    }
                    )
                }
            </Box >
        </>
    )
}

root.render(
    <App />
)