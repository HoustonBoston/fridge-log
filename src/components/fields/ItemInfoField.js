import * as React from 'react';
import dayjs from 'dayjs';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { DateField, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ItemInfoField ({ fridge_item, handleDeleteItem, handleUpdateItem })
{
  const { item_name, expiry_date, date_purchased_epoch_dayjs } = fridge_item

  const handleExpiryDateChange = (value) =>
  {
    if (value !== NaN && value !== null) {
      const updatedItem = { ...fridge_item, expiry_date: dayjs(value.valueOf()).hour(12) }
      handleUpdateItem(updatedItem)
    }
  }

  const handleItemNameChange = (event) =>
  {
    console.log('event.targe.value', event.target.value)
    const updatedItem = {
      ...fridge_item, 'item_name': event.target.value
    }
    handleUpdateItem(updatedItem)
  }

  return (
    <Box className="App" sx={{
      display: "flex",
      justifyContent: "center",
      height: "100px"
    }}>
      <Box>
        <IconButton onClick={() => handleDeleteItem()} color='blue'>
          <DeleteIcon color='blue' />
        </IconButton>
        <TextField defaultValue={item_name} label="Item name" variant='outlined' onChange={handleItemNameChange} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={dayjs(date_purchased_epoch_dayjs).hour(12)} label="Date purchased" />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={dayjs(expiry_date).hour(12)} label="Expiry date" onChange={handleExpiryDateChange} />
        </LocalizationProvider>
        <Typography sx={{ marginLeft: "10px", display: 'inline-flex', verticalAlign: 'middle', alignItems: 'center' }}>
          Expires in {(dayjs(expiry_date).startOf('day').diff(dayjs().startOf('day'), 'days') === 1) ? "1 day" : `${dayjs(expiry_date).startOf('day').diff(dayjs().startOf('day'), 'days')} days`}
        </Typography>
      </Box>
    </Box>
  );
}