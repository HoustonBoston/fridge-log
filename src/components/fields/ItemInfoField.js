import * as React from 'react';
import dayjs from 'dayjs';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { DateField, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ItemInfoField({ fridge_item, handleDeleteItem }) {
  const { item_id, item_name, expiry_date, purchase_date } = fridge_item
  const [expiryDate, setExpiryDate] = React.useState((expiry_date).hour(12)) // expiryDate is now a dayjs object

  const handleExpiryDateChange = (value) => {
    if (value !== NaN && value !== null) {
      setExpiryDate(dayjs(value).startOf('day'))
    }
  }

  return (
    <Box className="App" sx={{
      display: "flex",
      justifyContent: "center",
      height: "100px"
    }}>
      <Box>
        <IconButton onClick={handleDeleteItem} color='blue'>
          <DeleteIcon color='blue' />
        </IconButton>
        <TextField defaultValue={item_name} label="Item name" variant='outlined' />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={purchase_date.hour(12)} label="Date purchased" />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={expiry_date.hour(12)} label="Expiry date" onChange={(value) => handleExpiryDateChange(value)} />
        </LocalizationProvider>
        <Typography sx={{ marginLeft: "10px", display: 'inline-flex', verticalAlign: 'middle', alignItems: 'center' }}>
          Expires in {(expiryDate.startOf('day').diff(dayjs().startOf('day'), 'days') === 1) ? "1 day" : `${expiryDate.startOf('day').diff(dayjs().startOf('day'), 'days')} days`}
        </Typography>
      </Box>
    </Box>
  );
}