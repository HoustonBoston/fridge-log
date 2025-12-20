import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from "uuid"
import ItemInfoField from "../fields/ItemInfoField";
import AddItemButton from "../buttons/AddItemButton";
import { Box, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { LogoutOutlined } from '@mui/icons-material';

import { gsap } from "gsap"
import {Flip} from "gsap/Flip"
import {useGSAP} from "@gsap/react"

// Register Flip plugin
gsap.registerPlugin(Flip)


export default function LaptopPage ({ setIsAuthenticated })
{
    const [relevantTexts, setRelevantTexts] = useState(null)
    const [fridgeItems, setFridgeItems] = useState([])
    const listRef = useRef(null)
    // Use ref to keep track of last added item's index
    let lastAddedIndex = useRef(null)
    // Store Flip state before DOM changes
    const flipStateRef = useRef(null)
    const innerWidth = window.innerWidth
    const isMobile = innerWidth < 900
    const navigate = useNavigate()

    const decoded = jwtDecode(localStorage.getItem('user_token'))
    const userEmail = decoded.email

    // runs on page load or refresh
    const callFetchItemsApi = async () =>
    {
        const apiUrl = `https://1li9sdgxv3.execute-api.us-east-1.amazonaws.com/prod/ReadFromDDB/items?email=${userEmail}` //api gw url, can be accessed via host machine's IP with configured firewall
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
                const sortedData = data.Items.sort((a, b) => a.expiry_date - b.expiry_date)
                setFridgeItems(sortedData)
                console.log('items', data.Items)
            }
            else console.error('callFetchItemsApi call failed in page.js')
        } catch (error) {
            console.log('error after fetch in callFetchItemsApi', error)
        }
    }

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            console.log('trying to fetch data in useEffect')
            await callFetchItemsApi()
        }
        fetchData()
    }, [])

    const callPutItemApi = async (item) =>
    {
        const { item_id, item_name, expiry_date, timestamp, user_email } = item
        const apiUrl = `https://ymyr2o2ex8.execute-api.us-east-1.amazonaws.com/prod/WriteToDDB/putItem?email=${user_email}&item_id=${item_id}&item_name=${item_name}&expiry_date_epoch_dayjs=${expiry_date}&timestamp=${timestamp}`
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
        dayjs.extend(utc)
        dayjs.extend(timezone)
        const currentDate = dayjs().tz('America/New_York').hour(12).minute(0).second(0).millisecond(0)

        const item = {
            user_email: userEmail,
            item_id: uuidv4(),
            item_name: "",
            expiry_date: currentDate.add(2, "day").unix(),
            timestamp: dayjs().unix()
        }

        // Capture current positions before DOM updates
        if (listRef.current) {
            flipStateRef.current = Flip.getState('.list-item',)
        }

        setFridgeItems([item, ...fridgeItems])
        lastAddedIndex.current = 0;

        console.log('adding new item', item)

        await callPutItemApi(item)


        console.log('fridge items after adding item', fridgeItems)
    }

    const handleUpdateItem = async (item_to_update) =>
    {
        const { item_id, item_name, expiry_date, timestamp } = item_to_update

        const updated_item = {
            user_email: userEmail,
            item_id: item_id,
            item_name: item_name,
            expiry_date: expiry_date,
            timestamp: timestamp,
        }

        console.log('calling update item')

        await callPutItemApi(updated_item)

        setFridgeItems((prevItems) => prevItems.map((item) => item.item_id === item_id ? updated_item : item))

        console.log('fridge items after updating item', fridgeItems)
    }

    const handleDeleteItem = async (id, timestamp, email) =>
    {
        const apiUrl = `https://zhiet2z5zd.execute-api.us-east-1.amazonaws.com/prod/DeleteItem/item/${email}?timestamp=${timestamp}`
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
        const apiUrl = `https://7lyb190wdk.execute-api.us-east-1.amazonaws.com/prod/capturePhoto/item`
        const testApiUrl = `http://172.23.0.162:8080/capturePhoto/item`

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
                console.log('failure response from callUploadPhotoApi', res.body)
            }
        } catch (error) {
            console.error('error in callUploadPhotoApi', error)
        }
    }

    const handleClickPicture = (event) =>
    {
        const file = event.target.files[0]

        if (file) {
            const reader = new FileReader()
            reader.readAsDataURL(file) //convert to base64 encoding
            let resJson
            reader.onload = async () =>
            {
                //call API
                resJson = await callUploadPhotoApi(reader.result)
                if (resJson) {
                    setRelevantTexts(resJson.answer)
                }
            }
        }
    }


    useEffect(() =>
    {
        if (relevantTexts) {
            console.log('relevant texts', relevantTexts)
            console.log('adding to text after extraction')
            addToTableAfterTextract()
        }
    }, [relevantTexts])

    const addToTableAfterTextract = async () =>
    {
        if (relevantTexts) {
            let relevantDateStr = relevantTexts
            console.log('relevantDateStr:', relevantDateStr)

            const dateObject = new Date(relevantDateStr)
            console.log('date object', dateObject)
            console.log('day:', dateObject.getDate(), 'month:', dateObject.getMonth() + 1, 'year:', dateObject.getFullYear())

            const currentDate = dayjs().hour(12)
            const daysjsDate = dayjs(dateObject).hour(12)
            const item = {
                item_id: uuidv4(),
                user_email: userEmail,
                item_name: "",
                expiry_date: daysjsDate.unix(),
                timestamp: currentDate.unix()
            }
            await callPutItemApi(item).then(setFridgeItems([item, ...fridgeItems])).then(lastAddedIndex.current = 0)
        }
    }

    const handleClickLogout = () =>
    {
        localStorage.removeItem('user_token')
        setIsAuthenticated(false)
        navigate('/fridge-log')
    }

    // useGSAP hook handles animations and cleanup
    useGSAP(() => {
        // If a new item was just added, animate its entry and move other items
        if (lastAddedIndex.current !== null && listRef.current) {
            const newItemElement = listRef.current.children[lastAddedIndex.current]
            
            // Animate existing items moving down using Flip
            if (flipStateRef.current && newItemElement) {
                // Hide the new item initially
                gsap.set(newItemElement, { opacity: 0, y: -30 })
                
                // 1. First: Slide down existing items to make space
                Flip.from(flipStateRef.current, {
                    duration: 0.3,
                    ease: 'power2.out',
                    targets: '.list-item:not(:first-child)', // Exclude new item from Flip
                    onComplete: () => {
                        // 2. Then: Animate the new item entry
                        gsap.to(newItemElement, {
                            opacity: 1,
                            y: 0,
                            duration: 0.3,
                            ease: 'power2.out'
                        })
                    }
                })
                flipStateRef.current = null
            } else if (newItemElement) {
                // Fallback: just animate the new item
                gsap.fromTo(
                    newItemElement,
                    { opacity: 0, y: -30 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                )
            }
            
            // Reset the ref so we don't re-animate on other state changes
            lastAddedIndex.current = null
        }

        // TODO: animate removal of an item
    }, { dependencies: [fridgeItems], scope: listRef })  // Reruns when fridgeItems state changes 

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
                <Box ref={listRef} sx={{
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
                                <div className='list-item' key={item.item_id} data-flip-id={item.item_id}>
                                    <ItemInfoField
                                        fridge_item={item}
                                        handleDeleteItem={() => handleDeleteItem(item.item_id, item.timestamp, item.user_email)}
                                        handleUpdateItem={handleUpdateItem}
                                        isMobile={isMobile}
                                    />
                                </div>
                            )
                        }
                        )
                    }
                </Box >
            </Box>
        </>
    )
}