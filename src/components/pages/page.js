import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid"
import ItemInfoField from "../fields/ItemInfoField";
import AddItemButton from "../buttons/AddItemButton";
import { Box } from '@mui/material';

import dayjs from "dayjs";

const device_ip = "10.248.39.181";

export default function LaptopPage ()
{
    const [fridgeItems, setFridgeItems] = useState([])
    const innerWidth = window.innerWidth
    const isMobile = innerWidth < 900

    const callFetchItemsApi = async () =>
    {
        const apiUrl = `http://${device_ip}:8080/ReadFromDDB/items` //api gw url, can be accessed via host machine's IP with configured firewall
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
        const apiUrl = `http://${device_ip}:8080/WriteToDDB/putItem?item_id=${item_id}&item_name=${item_name}&date_purchased_epoch_dayjs=${purchase_date}&expiry_date_epoch_dayjs=${expiry_date}&timestamp=${timestamp}`
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
        const apiUrl = `http://${device_ip}:8080/DeleteItem/item/${id}?timestamp=${timestamp}`
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

    const callUploadPhotoApi = async (base64Image) =>
    {
        const apiUrl = `http://${device_ip}:8080/capturePhoto/item`

        try {
            const res = await fetch(apiUrl,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        base64Image: base64Image
                    })
                }
            )
            if (res.ok) {
                const resJson = await res.json()
                console.log('response json', resJson)
                return resJson
            }
            else {
                console.log('failure response from callUploadPhotoApi', res)
            }
        } catch (error) {
            console.error('error in callUploadPhotoApi', error)
        }
    }

    const handleClickPicture = (event) =>
    {
        const file = event.target.files[0]
        if (file) {
            console.log('photo captured', file)
            const reader = new FileReader()
            reader.readAsDataURL(file) //convert to base64 encoding
            let resJson
            reader.onload = async () =>
            {
                //call API
                resJson = await callUploadPhotoApi(reader.result)
                if(resJson && resJson.TextDetections)
                console.log('text detections in handleClickPicture', resJson.TextDetections)
            }
        }
    }

    return (
        <Box sx={{ display: "flex", justifyContent: "center", flexDirection: 'column' }}>
            <Box sx={{
                display: 'flex',            // Use flexbox for layout
                justifyContent: 'center',   // Center the entire layout horizontally
                alignItems: 'center',       // Align items vertically
            }}>
                <Box sx={{ paddingBottom: isMobile ? '0.5em' : '1em' }}>
                    {console.log('adding add item button')}
                    <AddItemButton handleAddItem={handleAddItem} isMobile={isMobile} handleClickPicture={handleClickPicture} />
                </Box>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                //padding: isMobile ? '16px' : '0',
                //marginTop: isMobile ? '16px' : 0,
                width: '100%',
                justifyContent: 'center',
                gap: '1.5em'
            }}>
                {
                    fridgeItems.map((item, index) =>
                    {
                        return (
                            <ItemInfoField
                                key={index}
                                fridge_item={item}
                                handleDeleteItem={() => handleDeleteItem(item.item_id, item.timestamp)}
                                handleUpdateItem={handleUpdateItem}
                                isMobile={isMobile}
                            />
                        )
                    }
                    )
                }
            </Box >
        </Box>
    )

}