import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client'
import ItemInfoField from './components/fields/ItemInfoField';
import AddItemButton from './components/buttons/AddItemButton';
import { Box } from '@mui/material';

import { initialTasks } from './local-data/initialData.js'
import dayjs from "dayjs";
const root = ReactDOM.createRoot(document.getElementById('root'))


function App() {
    const [fridgeItems, setFridgeItems] = useState(initialTasks)

    const callFetchItemsApi = async () => {
        const apiUrl = "http://127.0.0.1:8080/ReadFromDDB/items" //api gw url
        console.log('trying to call API')

        try {
            const res = await fetch(apiUrl, {
                method: 'GET',
            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => callFetchItemsApi(), []) // when updating 

    const callPutItemApi = async (item) => {
        const { item_name, item_id, expiry_date, purchase_date } = item
        const apiUrl = `http://127.0.0.1:8080/PutToDDB/putItem?item_name=${item_name}&date_purchased_epoch_dayjs=${purchase_date}&expiry_date_epoch_dayjs=${expiry_date}`
        console.log('trying to call API')

        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
            })

            if (res.ok) {
                setFridgeItems(res)
            } else console.log('API call failed')

        } catch (error) {
            console.log('catching callPutItemApi error:', error)
        }
    }

    const handleAddItem = () => {
        const item = {
            item_id: 3,
            expiry_date: dayjs().hour(12),
            purchase_date: dayjs().hour(12)
        }
        callPutItemApi(item)
        
        console.log('expiry date of item:', item.expiry_date)
        setFridgeItems([...fridgeItems, item])
    }

    const handleUpdateItem = () => {

    }

    const handleDeleteItem = () => {

        const handleDeleteItem = (id) => {
            setFridgeItems(fridgeItems.filter((item) => item.item_id != id));
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
                        fridgeItems.map((item, index) => {
                            return (
                                <ItemInfoField key={item.item_id} fridge_item={item} handleDeleteItem={() => handleDeleteItem(item.item_id)} />
                            )
                        }
                        )
                    }
                </Box >
            </>
        )
    }
}

root.render(
    <App />
)