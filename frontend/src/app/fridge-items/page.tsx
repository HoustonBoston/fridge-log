'use client'

import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from "uuid"
import ItemInfoField from "../../components/fields/ItemInfoField";
import AddItemButton from "../../components/buttons/AddItemButton";
import { Box, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { gsap } from "gsap"
import { Flip } from 'gsap/Flip';
import {useGSAP} from "@gsap/react"

import urls from '../../urls';

import DecodedToken from '../../interfaces/DecodedToken';
import { useItems } from '../../contexts/ItemsContext';
import { useIsMobile } from '../../contexts/IsMobileContext';
import { useSearch } from '../../contexts/SearchContext';

// Register Flip plugin
gsap.registerPlugin(Flip)


export default function LaptopPage ()
{
    const [relevantTexts, setRelevantTexts] = useState(null)
    const [fridgeItems, setFridgeItems] = useItems()
    const [searchQuery, setSearchQuery] = useSearch()
    const [fabStatus, setFabStatus] = useState('idle')  // 'idle' | 'success' | 'error'    
    const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)  // Loading state for photo processing
    const pageSize = useRef(10)  // Items per page
    const visibleCount = useRef(pageSize.current)
    const [hasMore, setHasMore] = useState(false)  // Whether more items exist
    const listRef = useRef(null)
    
    // Use ref to keep track of last added item's index (GSAP)
    let lastAddedIndex = useRef(null)
    // Store Flip state before DOM changes
    let flipStateRef = useRef(null)
    // Store Flip state for delete animation
    const deleteFlipStateRef = useRef(null)
    // Track newly added item ID to apply initial hidden style
    const newlyAddedItemId = useRef<string | null>(null)
    // Track previous filtered items for search animation
    const prevFilteredIdsRef = useRef<string[]>([])
    
    const isMobile = useIsMobile();
    
    const router = useRouter()
    
    const [userEmail, setUserEmail] = useState<string | null>(null)

    // Protect the page - redirect to login if not authenticated
    useEffect(() => {
        const userToken = localStorage.getItem('user_token')
        if (!userToken) {
            router.push('/login')
        } else {
            const decoded = jwtDecode<DecodedToken>(userToken)
            setUserEmail(decoded.email)
        }
    }, [router])

    // runs on page load or refresh
    const callFetchItemsApi = async () =>
    {
        if (!userEmail) return
        
        let apiUrl = `${urls.readFromDDBUrl}ReadFromDDB/items?email=${userEmail}`
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
                
                // Update pagination state
                setHasMore(visibleCount.current < sortedData.length)
                
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
        if (userEmail) {
            fetchData()
        }
    }, [userEmail])

    const loadMoreItems = () => {
        if (!hasMore) return
        
        // render more items on the page
        visibleCount.current += pageSize.current
        setHasMore(visibleCount.current < fridgeItems.length)
    }

    const callPutItemApi = async (item) =>
    {
        const { item_id, item_name, expiry_date, timestamp, user_email } = item
        const apiUrl = `${urls.writeToDDBUrl}WriteToDDB/putItem?email=${user_email}&item_id=${item_id}&item_name=${item_name}&expiry_date_epoch_dayjs=${expiry_date}&timestamp=${timestamp}`
        console.log('trying to call put item API')

        try {
            const res = await fetch(apiUrl, {
                method: 'POST'
            })

            if (res.ok) {
                console.log('OK response from callPutItemApi', res)
                return true  // Return success
            }
            else {
                console.error('callPutItemApi error', res)
                return false  // Return failure
            }
        } catch (error) {
            console.log('catching callPutItemApi error:', error)
            return false  // Return failure on exception
        }
    }

    const handleAddItem = async () => // send dates as unix!!
    {
        if (!userEmail) return
        
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

        // Clear search so new item is visible
        if (searchQuery) {
            setSearchQuery('')
        }

        // Capture current positions before DOM updates
        if (listRef.current) {
            flipStateRef.current = Flip.getState('.list-item',)
        }

        // Mark this item as newly added so it renders hidden
        newlyAddedItemId.current = item.item_id

        setFridgeItems([item, ...fridgeItems])
        lastAddedIndex.current = 0;

        console.log('adding new item', item)

        // Call API and update FAB status based on result
        const success = await callPutItemApi(item)
        setFabStatus(success ? 'success' : 'error')
        
        // Reset FAB status back to idle after 500ms
        setTimeout(() => setFabStatus('idle'), 500)

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

    const handleDeleteItem = async (id, timestamp, email, index) =>
    {
        const apiUrl = `${urls.deleteItemApiUrl}DeleteItem/item/${email}?timestamp=${timestamp}`
        console.log('trying to call delete item API for id', id)
        
        const elementToRemove = listRef.current?.children[index] as HTMLElement
        
        if (elementToRemove) {
            // Get the current height for animation
            const currentHeight = elementToRemove.offsetHeight
            
            // Set explicit height so we can animate it
            gsap.set(elementToRemove, { height: currentHeight, overflow: 'hidden' })
            
            // Animate fade out and collapse height together
            gsap.to(elementToRemove, {
                opacity: 0,
                x: -30,
                duration: 0.3,
                ease: 'power2.out',
                delay: 0.35,
                onComplete: () => {
                    // Capture Flip state right BEFORE removing from DOM
                    // This captures positions of all items including the one about to be removed
                    deleteFlipStateRef.current = Flip.getState('.list-item')
                    
                    // Remove from state - useLayoutEffect will handle the animation
                    setFridgeItems((prevItems) => prevItems.filter((item) => item.item_id !== id))
                }
            })
        } else {
            // Fallback: just remove without animation
            setFridgeItems((prevItems) => prevItems.filter((item) => item.item_id !== id))
        }

        try {
            const res = await fetch(apiUrl, {
                method: 'DELETE'
            })

            if (res.ok) {
                console.log('OK response from handleDeleteItem', res)
            }
            else console.error('handleDeleteItem error', res)
        } catch (error) {
            console.log('catching handleDeleteItem error:', error)
        }
    }

    // Handle delete animation after DOM updates
    useGSAP(() => {
        if (deleteFlipStateRef.current) {
            Flip.from(deleteFlipStateRef.current, {
                duration: 0.3,
                ease: 'power2.out',
                targets: '.list-item',
            })
            deleteFlipStateRef.current = null
        }
    }, { dependencies: [fridgeItems], scope: listRef.current })

    const callUploadPhotoApi = async (base64Image) =>
    {
        const apiUrl = `${urls.capturePhotoApiUrl}capturePhoto/item`

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
                //call API - show loading spinner while processing
                setIsProcessingPhoto(true)
                try {
                    resJson = await callUploadPhotoApi(reader.result)
                    if (resJson) {
                        setRelevantTexts(resJson.answer)
                        setFabStatus('success')
                    } else {
                        setFabStatus('error')
                    }
                } catch (error) {
                    console.error('Error processing photo:', error)
                    setFabStatus('error')
                } finally {
                    setIsProcessingPhoto(false)
                    // Reset status after 500ms
                    setTimeout(() => setFabStatus('idle'), 500)
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
            await callPutItemApi(item).then(() => {
                setFridgeItems([item, ...fridgeItems])
                lastAddedIndex.current = 0
            })
        }
    }

    // useGSAP hook handles add item animation
    useGSAP(() => {
        // If a new item was just added, animate its entry
        if (lastAddedIndex.current !== null && listRef.current) {
            const newItemElement = listRef.current.children[lastAddedIndex.current] as HTMLElement
            
            if (newItemElement && flipStateRef.current) {
                // 1. Animate existing items sliding down using Flip
                Flip.from(flipStateRef.current, {
                    duration: 0.3,
                    ease: 'power2.out',
                    targets: '.list-item',
                    onEnter: (elements) => {
                        // Keep new element hidden during Flip
                        return gsap.set(elements, { opacity: 0 })
                    },
                    onComplete: () => {
                        // 2. After items slide down, fade in the new item
                        gsap.fromTo(newItemElement, {
                            opacity: 0,
                            y: -20
                        }, {
                            opacity: 1,
                            y: 0,
                            duration: 0.3,
                            ease: 'power2.out',
                            onComplete: () => {
                                // Clear the newly added ID after animation
                                newlyAddedItemId.current = null
                                // Reset ref so we don't re-animate on other state changes
                                lastAddedIndex.current = null
                            }
                        })
                    }
                })
                
                flipStateRef.current = null
            } else if (newItemElement) {
                // Fallback: just animate the new item
                console.log('fallback animation for new item')
                gsap.fromTo(newItemElement, {
                    opacity: 0,
                    y: -20
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        newlyAddedItemId.current = null
                        // Reset ref so we don't re-animate on other state changes
                        lastAddedIndex.current = null
                    }
                })
            }
        }
    }, [fridgeItems])

    // Filter items based on search query
    const filteredItems = searchQuery
        ? fridgeItems.filter(item => 
            item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : fridgeItems

    // Animate search result changes
    useGSAP(() => {
        if (!listRef.current) return
        
        const currentIds = filteredItems.slice(0, visibleCount.current).map(item => item.item_id)
        const prevIds = prevFilteredIdsRef.current
        
        // Skip animation if this is from add/delete (handled separately)
        if (lastAddedIndex.current !== null) {
            prevFilteredIdsRef.current = currentIds
            return
        }
        
        // Find items that are newly appearing
        const newlyAppearing = currentIds.filter(id => !prevIds.includes(id))
        
        // Animate newly appearing items
        if (newlyAppearing.length > 0 && prevIds.length > 0) {
            newlyAppearing.forEach(id => {
                const element = listRef.current?.querySelector(`[data-flip-id="${id}"]`)
                if (element) {
                    gsap.fromTo(element, 
                        { opacity: 0, scale: 0.95 },
                        { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
                    )
                }
            })
        }
        
        prevFilteredIdsRef.current = currentIds
    }, { dependencies: [filteredItems, searchQuery], scope: listRef.current })

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "center", flexDirection: 'column', gap: "1em" }}>

                <Box ref={listRef} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'center',
                    gap: '1.5em'
                }}>
                    {
                        filteredItems.slice(0, visibleCount.current).map((item, index) =>
                        {
                            const isNewlyAdded = item.item_id === newlyAddedItemId.current
                            return (
                                <div 
                                    className='list-item' 
                                    key={item.item_id} 
                                    data-flip-id={item.item_id}
                                    style={isNewlyAdded ? { opacity: 0 } : undefined}
                                >
                                    <ItemInfoField
                                        fridge_item={item}
                                        handleDeleteItem={() => handleDeleteItem(item.item_id, item.timestamp, item.user_email, index)}
                                        handleUpdateItem={handleUpdateItem}
                                    />
                                </div>
                            )
                        }
                        )
                    }
                </Box >
                
                {/* Load More Button */}
                {!searchQuery && hasMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '1em', paddingBottom: '2em' }}>
                        <Button 
                            variant="outlined" 
                            onClick={loadMoreItems}
                            disabled={!hasMore}
                            sx={{ minWidth: '150px' }}
                        >
                            {hasMore && 'Load More'}
                        </Button>
                    </Box>
                )}
                
                {/* Show message when all items are loaded */}
                {!searchQuery && !hasMore && fridgeItems.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '1em', paddingBottom: '2em' }}>
                        <Typography variant="body2" color="text.secondary">
                            All items loaded ({fridgeItems.length} total)
                        </Typography>
                    </Box>
                )}
                
                {/* Show search results count */}
                {searchQuery && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '1em', paddingBottom: '2em' }}>
                        <Typography variant="body2" color="text.secondary">
                            {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} found
                        </Typography>
                    </Box>
                )}
            </Box>
                
            {/* Floating Action Button in bottom right */}
            <AddItemButton handleAddItem={handleAddItem} handleClickPicture={handleClickPicture} status={fabStatus} loading={isProcessingPhoto} />
        </>
    )
}
