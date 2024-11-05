import * as React from 'react';
import { CardActions, Typography, Box, Button } from '@mui/material';
import AddTaskIcon from '@mui/icons-material/AddTask';

export default function AddItemButton ({ handleAddItem })
{
    return (
        <Button onClick={handleAddItem} sx={{ textTransform: 'inherit', width: '100%', height: '100%', borderRadius: '20px', }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }} >
                <AddTaskIcon color='blue' />
                <Typography>
                    Add an item
                </Typography>
            </Box>
        </Button>
    )
}