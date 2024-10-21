import * as React from 'react';
import dayjs from 'dayjs';
import { Box, TextField, Typography } from '@mui/material';
import { DateField, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ItemInfoField({fridge_item}) {
  const {item_id, item_name, expiry_date, purchase_date} = fridge_item
  const [expiryDate, setExpiryDate] = React.useState(dayjs(expiry_date).hour(12))
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
        <TextField defaultValue={item_name} label="Item name" variant='outlined' />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={dayjs(purchase_date).hour(12)} label="Date purchased" />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField sx={{ marginLeft: "10px" }} defaultValue={dayjs(expiry_date).hour(12)} label="Expiry date" onChange={(value) => handleExpiryDateChange(value)} />
        </LocalizationProvider>
        <Typography sx={{ marginLeft: "10px", display: 'inline-flex', verticalAlign:'middle', alignItems:'center' }}>
          Expires in {(dayjs(expiryDate).startOf('day').diff(dayjs().startOf('day'), 'days') === 1) ? "1 day" : `${dayjs(expiryDate).startOf('day').diff(dayjs().startOf('day'), 'days')} days`}
        </Typography>
      </Box>
    </Box>
  );
}