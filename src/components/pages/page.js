import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid"
import ItemInfoField from "../fields/ItemInfoField";
import AddItemButton from "../buttons/AddItemButton";
import { Box, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

import dayjs from "dayjs";
import { LogoutOutlined } from '@mui/icons-material';

const device_ip = "localhost";

export default function LaptopPage({ setIsAuthenticated }) {
    const [relevantTexts, setRelevantTexts] = useState([])
    const [detectedTexts, setDetectedTexts] = useState([])
    const [fridgeItems, setFridgeItems] = useState([])
    const innerWidth = window.innerWidth
    const isMobile = innerWidth < 900
    const navigate = useNavigate()

    const decoded = jwtDecode(localStorage.getItem('user_token'))
    const userEmail = decoded.email
    console.log('decoded', decoded)
    console.log('user email', userEmail)

    const callFetchItemsApi = async () => {
        const apiUrl = `http://${device_ip}:8080/ReadFromDDB/items?email=${userEmail}` //api gw url, can be accessed via host machine's IP with configured firewall
        console.log('trying to call fetch items API')

        try {
            console.log('inside try for callFetchItemsApi in page.js')
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
            else console.error('callFetchItemsApi call failed in page.js')
        } catch (error) {
            console.log('error after fetch in callFetchItemsApi', error)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            console.log('trying to fetch data in useEffect')
            await callFetchItemsApi()
        }
        fetchData()
    }, [])

    const callPutItemApi = async (item) => {
        const { item_id, item_name, expiry_date, purchase_date, timestamp, user_email } = item
        console.log('purchase date in callPutItemApi', purchase_date)
        const apiUrl = `http://${device_ip}:8080/WriteToDDB/putItem?email=${user_email}&item_id=${item_id}&item_name=${item_name}&date_purchased_epoch_dayjs=${purchase_date}&expiry_date_epoch_dayjs=${expiry_date}&timestamp=${timestamp}`
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
            user_email: userEmail,
            item_id: uuidv4(),
            item_name: "",
            expiry_date: currentDate.unix(),
            purchase_date: currentDate.unix(),
            timestamp: dayjs().unix()
        }

        setFridgeItems([item, ...fridgeItems])

        console.log('adding new item', item)

        await callPutItemApi(item)


        console.log('fridge items after adding item', fridgeItems)
    }

    const handleUpdateItem = async (item_to_update) => {
        const { item_id, item_name, expiry_date, purchase_date, timestamp } = item_to_update

        const updated_item = {
            user_email: userEmail,
            item_id: item_id,
            item_name: item_name,
            expiry_date: expiry_date,
            purchase_date: purchase_date,
            timestamp: timestamp,
        }

        console.log('calling update item')

        await callPutItemApi(updated_item)

        setFridgeItems((prevItems) => prevItems.map((item) => item.item_id === item_id ? updated_item : item))

        console.log('fridge items after updating item', fridgeItems)
    }

    const handleDeleteItem = async (id, user_email) => {
        const apiUrl = `http://${device_ip}:8080/DeleteItem/item/${id}?email=${user_email}`
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

    const callUploadPhotoApi = async (base64Image) => {
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

    const handleClickPicture = (event) => {
        const file = event.target.files[0]

        if (file) {
            console.log('photo captured', file)
            const reader = new FileReader()
            reader.readAsDataURL(file) //convert to base64 encoding
            let resJson
            reader.onload = async () => {
                //call API
                resJson = await callUploadPhotoApi(reader.result)
                if (resJson && resJson.TextDetections) {
                    setDetectedTexts(resJson.TextDetections)
                }
            }
        }
    }

    const findRelevantTexts = () => {
        const foundTexts = []
        let targetIndex = -1;
        for (let i = 0; i < detectedTexts.length; i++) {
            let word = detectedTexts[i].DetectedText.toLowerCase()
            if (word.includes("exp") || word.includes("manufacture date") || word.includes("used b") || word.includes("use before") || word.includes("best b") || word.includes("best")) {
                console.log('found word with exp or manuf:', word)
                targetIndex = i;
            }
            if (targetIndex !== -1 && i <= targetIndex + 2) {
                foundTexts.push(word)
                console.log('pushing word into foundTexts', word)
            }
        }
        setRelevantTexts(foundTexts)
    }

    useEffect(() => {
        if (detectedTexts.length > 0) {
            console.log('detectedTexts has changed')
            findRelevantTexts()
        }
    }, [detectedTexts])

    useEffect(() => {
        console.log('relevant texts', relevantTexts)
        console.log('adding to text after extraction')
        addToTableAfterTextract()
    }, [relevantTexts])

    const addToTableAfterTextract = async () => {
        //for this example format: 'best jan 23 2026' 
        if (relevantTexts.length > 0) {
            let relevantDateStr = relevantTexts[0].substring(5)
            const dateMatch = relevantDateStr.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) \d{1,2} \d{4}/i)

            if (dateMatch) {
                const dateString = dateMatch[0]
                console.log('date string:', dateString)
                const dateObject = new Date(dateString)
                console.log('date object', dateObject)
                console.log('day:', dateObject.getDate(), 'month:', dateObject.getMonth() + 1, 'year:', dateObject.getFullYear())

                const currentDate = dayjs().hour(12)
                const daysjsDate = dayjs(dateObject).hour(12)
                const item = {
                    item_id: uuidv4(),
                    user_email: userEmail,
                    item_name: "",
                    expiry_date: daysjsDate.unix(),
                    purchase_date: currentDate.unix(),
                    timestamp: currentDate.unix()
                }
                await callPutItemApi(item).then(setFridgeItems([item, ...fridgeItems]))
            }
        }
    }

    const handleClickLogout = () => {
        localStorage.removeItem('user_token')
        setIsAuthenticated(false)
        navigate('/login')
    }

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "center", flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex',            // Use flexbox for layout
                    justifyContent: 'center',   // Center the entire layout horizontally
                    alignItems: 'center',       // Align items vertically
                }}>
                    <Box sx={{ paddingBottom: isMobile ? '0.5em' : '1em' }}>
                        <Box sx={{ flexDirection: 'row', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography>Welcome, {decoded.name}!</Typography>
                            <Button onClick={handleClickLogout}>
                                <LogoutOutlined />
                            </Button>
                        </Box>
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
                        fridgeItems.map((item, index) => {
                            return (
                                <ItemInfoField
                                    key={item.item_id + index}
                                    fridge_item={item}
                                    handleDeleteItem={() => handleDeleteItem(item.item_id, item.user_email)}
                                    handleUpdateItem={handleUpdateItem}
                                    isMobile={isMobile}
                                />
                            )
                        }
                        )
                    }
                </Box >
            </Box>
        </>
    )
}