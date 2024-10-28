import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid"
import ReactDOM from 'react-dom/client'
import ItemInfoField from './components/fields/ItemInfoField';
import AddItemButton from './components/buttons/AddItemButton';
import { Box } from '@mui/material';

import { initialTasks } from './local-data/initialData.js'
import dayjs from "dayjs";


const root = ReactDOM.createRoot(document.getElementById('root'))
function App ()
{
    const [fridgeItems, setFridgeItems] = useState([])

    const callFetchItemsApi = async () =>
    {
        const apiUrl = "http://127.0.0.1:8080/ReadFromDDB/items" //api gw url
        console.log('trying to call fetch items API')

        try {
            const res = await fetch(apiUrl, {
                method: 'GET',
            })
            if (res.ok) {
                const data = await res.json()
                console.log('OK respose received from callFetchItemsApi:', res)
                console.log('res body:', res.body)
                console.log('data', data)
                setFridgeItems(data.Items)
                console.log('items', data.Items)
            }
            else console.error('API call failed')
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            await callFetchItemsApi()
        }
        console.log('use effect')
        fetchData()
    }, []) // when updating. Depends on fridgeItems

    const callPutItemApi = async (item) =>
    {
        const { item_id, item_name, expiry_date, purchase_date } = item
        const apiUrl = `http://127.0.0.1:8080/WriteToDDB/putItem?item_id=${item_id}&item_name=${item_name}&date_purchased_epoch_dayjs=${purchase_date}&expiry_date_epoch_dayjs=${expiry_date}`
        console.log('trying to call put item API')

        try {
            const res = await fetch(apiUrl, {
                method: 'POST'
            })
            if (res.ok) {
                console.log('OK response from callPutItemApi', res)
            }
            else console.error('callPutItemApi error', res)
        } catch (error) {
            console.log('catching callPutItemApi error:', error)
        }
    }

    const handleAddItem = () =>
    {
        const item = {
            item_id: uuidv4(),
            item_name: "",
            expiry_date: dayjs().hour(12),
            purchase_date: dayjs().hour(12)
        }
        console.log('item.expiry_date', item.expiry_date)
        callPutItemApi(item).then(setFridgeItems([item, ...fridgeItems]))
        console.log('fridge items after adding item', fridgeItems)
        console.log('expiry date of item:', item.expiry_date)
    }

    const handleUpdateItem = (item_to_update) =>
    {
        const { item_id, item_name, expiry_date, purchase_date } = item_to_update
        const updated_item = {
            item_id: item_id,
            item_name: item_name,
            expiry_date: expiry_date,
            purchase_date: purchase_date
        }
        console.log('calling update item')

        setFridgeItems((prevItems) => prevItems.map((item) => item.item_id === item_id ? updated_item : item))
        
        callPutItemApi(updated_item)

        console.log('fridge items after updating item', fridgeItems)
    }

    const handleDeleteItem = async (id) =>
    {
        const apiUrl = `http://127.0.0.1:8080/DeleteItem/item/${id}`
        console.log('trying to call delete item API for id', id)
        setFridgeItems((prevItems) => prevItems.filter((item) => item.item_id !== id))
        try {
            const res = await fetch(apiUrl, {
                method: 'POST'
            })
            if (res.ok) {
                console.log('OK response from handleDeleteItem', res)
            }
            else console.error('handleDeleteItem error', res)
        } catch (error) {
            console.log('catching handleDeleteItem error:', error)
        }
    }

    return (
        <>

            <Box sx={{
                display: 'flex',            // Use flexbox for layout
                justifyContent: 'center',   // Center the entire layout horizontally
                alignItems: 'center',       // Align items vertically
            }}>
                <Box>
                    {console.log('adding add item button')}
                    <AddItemButton handleAddItem={handleAddItem} />
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
                            <ItemInfoField key={item.item_id} fridge_item={item} handleDeleteItem={() => handleDeleteItem(item.item_id)} handleUpdateItem={handleUpdateItem}/>
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