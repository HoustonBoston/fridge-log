import * as React from 'react';
import dayjs from 'dayjs';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { DateField, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ItemInfoField ({ fridge_item, handleDeleteItem, handleUpdateItem })
{
  const { item_name, expiry_date, purchase_date } = fridge_item //in unix when data is fetched
  const [datePurchased, setDatePurchased] = React.useState(dayjs.unix(purchase_date)) //convert back to dayjs object
  const [expiryDate, setExpiryDate] = React.useState(dayjs.unix(expiry_date)) // convert back to dayjs object
  console.log('purchase_date in item info field', purchase_date)
  console.log('expiry_date in item info field', expiry_date)
  console.log('datePurchased in item info field', datePurchased)
  console.log('expiryDate', expiryDate)
  console.log('is expiryDate dayjs object?', dayjs.isDayjs(expiryDate))
  console.log('is datePurchased dayjs object?', dayjs.isDayjs(datePurchased))
  console.log('expiryDate start of', expiryDate.startOf('day'))

  const handleExpiryDateChange = (value) =>
  {
    console.log('calling handleExpiryDateChange')
    console.log('value in handleExpiryDateChange', value)
    if (dayjs.isDayjs(value)) {
      const updatedItem = { ...fridge_item, expiry_date: value.hour(12).unix() }
      handleUpdateItem(updatedItem)
      setExpiryDate(dayjs(value).hour(12))
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

        <TextField defaultValue={item_name} label="Item name" variant='outlined' onBlur={handleItemNameChange} />
        
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={datePurchased} label="Date purchased" />
        </LocalizationProvider>
        
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} value={expiryDate} label="Expiry date" onChange={handleExpiryDateChange} />
        </LocalizationProvider>
        
        <Typography sx={{ marginLeft: "10px", display: 'inline-flex', verticalAlign: 'middle', alignItems: 'center' }}>
          Expires in {(expiryDate.startOf('day').diff(dayjs().startOf('day'), 'days') === 1) ? "1 day" : `${(expiryDate).startOf('day').diff(dayjs().startOf('day'), 'days')} days`}
        </Typography>
      </Box>
    </Box>
  );
}