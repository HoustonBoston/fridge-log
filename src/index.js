import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid"
import ReactDOM from 'react-dom/client'
import ItemInfoField from './components/fields/ItemInfoField';
import AddItemButton from './components/buttons/AddItemButton';
import { Box } from '@mui/material';

import dayjs from "dayjs";


const root = ReactDOM.createRoot(document.getElementById('root'))
function App ()
{
    const [fridgeItems, setFridgeItems] = useState([])

    const callFetchItemsApi = async () =>
    {
        const apiUrl = "http://192.168.1.14:8080/ReadFromDDB/items" //api gw url, can be accessed via host machine's IP with configured firewall
        console.log('trying to call fetch items API')

        try {
            console.log('inside try')
            const res = await fetch(apiUrl, {
                method: 'GET',
            })
            console.log('after invoking try')
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
            console.log('error after fetch', error)
        }
    }

    useEffect(() =>
    {
        console.log('use effect')
        const fetchData = async () =>
        {
            console.log('trying to fetch data')
            await callFetchItemsApi()
        }
        fetchData()
    }, []) // when updating. Depends on fridgeItems

    const callPutItemApi = async (item) =>
    {
        const { item_id, item_name, expiry_date, purchase_date, timestamp } = item
        console.log('purchase date in callPutItemApi', purchase_date)
        const apiUrl = `http://192.168.1.14:8080/WriteToDDB/putItem?item_id=${item_id}&item_name=${item_name}&date_purchased_epoch_dayjs=${purchase_date}&expiry_date_epoch_dayjs=${expiry_date}&timestamp=${timestamp}`
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

    const handleAddItem = async () => // send dates as unix!!
    {
        const currentDate = dayjs().hour(12)
        const item = {
            item_id: uuidv4(),
            item_name: "",
            expiry_date: currentDate.unix(),
            purchase_date: currentDate.unix(),
            timestamp: dayjs().unix()
        }
        console.log('adding new item', item)
        await callPutItemApi(item).then(setFridgeItems([item, ...fridgeItems]))
        console.log('fridge items after adding item', fridgeItems)
    }

    const handleUpdateItem = (item_to_update) =>
    {
        const { item_id, item_name, expiry_date, purchase_date, timestamp } = item_to_update
        const updated_item = {
            item_id: item_id,
            item_name: item_name,
            expiry_date: expiry_date,
            purchase_date: purchase_date,
            timestamp: timestamp
        }
        console.log('calling update item')

        setFridgeItems((prevItems) => prevItems.map((item) => item.item_id === item_id ? updated_item : item))

        callPutItemApi(updated_item)

        console.log('fridge items after updating item', fridgeItems)
    }

    const handleDeleteItem = async (id, timestamp) =>
    {
        const apiUrl = `http://192.168.1.14:8080/DeleteItem/item/${id}?timestamp=${timestamp}`
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
                            <ItemInfoField key={item.item_id} fridge_item={item} handleDeleteItem={() => handleDeleteItem(item.item_id, item.timestamp)} handleUpdateItem={handleUpdateItem} />
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