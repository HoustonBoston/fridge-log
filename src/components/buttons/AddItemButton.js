import * as React from 'react';
import { CardActions, Typography, Box, Button } from '@mui/material';
import AddTaskIcon from '@mui/icons-material/AddTask';

export default function AddItemButton({ handleAddItem }) {
    return (
        <CardActions sx={{ width: '100%' }}>
            <Button onClick={handleAddItem} sx={{ textTransform: 'inherit', width: '100%', borderRadius: '20px', }}>
                <AddTaskIcon color='blue' />
                <Box width={'25px'} />
                <Typography>
                    Add an item
                </Typography>
            </Button>
        </CardActions>
    )
}