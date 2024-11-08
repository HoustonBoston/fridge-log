import * as React from 'react';
import { Typography, Box, Button, IconButton } from '@mui/material';
import { AddTask, PhotoCamera } from "@mui/icons-material";

export default function AddItemButton ({ handleAddItem, isMobile })
{
    const inputRef = React.useRef(null)

    const handleOpenFileDialog = () =>
    {
        if (inputRef.current)
            inputRef.current.click()
    }

    const handleClickPicture = (event) =>
    {
        const file = event.target.files[0]
        if (file) {
            console.log('photo captured', file)
            const reader = new FileReader()
            reader.onload = () =>
            {
                console.log('after loading', reader.result) //after loading
                //call API
                
            }

            reader.readAsDataURL(file) //load
        }
    }

    return (
        <>
            <Button onClick={handleAddItem} sx={{ textTransform: 'inherit', width: '100%', height: '100%', borderRadius: '20px', }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', gap: '0.5em' }} >
                    <AddTask color='blue' />
                    <Typography>
                        Add an item
                    </Typography>
                </Box>
            </Button>
            {isMobile ?
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        id="cameraFileInput"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleClickPicture}
                        ref={inputRef}
                        style={{ display: 'none' }}
                    />
                    <IconButton color="primary" aria-label="upload picture" onClick={handleOpenFileDialog}
                        sx={{
                            textTransform: 'inherit',
                            width: '100%',
                            height: '100%',
                            borderRadius: '20px',
                            gap:'0.5em'
                        }}>
                        <PhotoCamera />
                        <Typography>
                            Take a picture
                        </Typography>
                    </IconButton>
                </Box>
                : <></>}
        </>
    )
}