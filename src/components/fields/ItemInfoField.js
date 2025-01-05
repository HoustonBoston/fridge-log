import * as React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { DateField, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ItemInfoField({ fridge_item, handleDeleteItem, handleUpdateItem, isMobile }) {
  dayjs.extend(utc)
  dayjs.extend(timezone)

  const { item_name, expiry_date } = fridge_item //in unix when data is fetched
  const [expiryDate, setExpiryDate] = React.useState(dayjs.unix(expiry_date)) // convert back to dayjs object
  console.log('expiryDate in ItemInfoField', expiryDate)

  const handleExpiryDateChange = (value) => {
    console.log('calling handleExpiryDateChange')
    console.log('value in handleExpiryDateChange', value)

    if (dayjs.isDayjs(value)) {
      const updatedItem = { ...fridge_item, expiry_date: value.tz('America/New_York').hour(12).minute(0).second(0).millisecond(0).unix() }
      handleUpdateItem(updatedItem)
      setExpiryDate(dayjs(value).tz('America/New_York').hour(12).minute(0).second(0).millisecond(0))
    }
  }

  const handleItemNameChange = (event) => {
    console.log('event.targe.value', event.target.value)
    const updatedItem = {
      ...fridge_item, 'item_name': event.target.value
    }
    handleUpdateItem(updatedItem)
  }

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: 'start',
      flexDirection: {
        lg: "row",
        md: "row",
        sm: "column",
        xs: "column"
      },
      gap: '1em'
    }}>
      <Box >
        <TextField defaultValue={item_name} label="Item name" variant='outlined' onBlur={handleItemNameChange} />
        {
          isMobile ?
            <IconButton onClick={() => handleDeleteItem()} color='blue'>
              <DeleteIcon color='blue' />
            </IconButton>
            : <></>
        }
      </Box>

      <Box >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField value={expiryDate} label="Expiry date" onChange={handleExpiryDateChange} />
        </LocalizationProvider>
        <Typography sx={{ pt: '2%', marginLeft: "10px" }}>
          Expires in {(expiryDate.tz('America/New_York').startOf('day').diff(dayjs().tz('America/New_York').startOf('day'), 'days') === 1) ? "1 day" : `${expiryDate.tz('America/New_York').startOf('day').diff(dayjs().tz('America/New_York').startOf('day'), 'days')} days`}
        </Typography>
      </Box>

      <Box>
        {
          !isMobile ?
            <IconButton onClick={() => handleDeleteItem()} color='blue'>
              <DeleteIcon color='blue' />
            </IconButton>
            : <></>
        }

      </Box>
    </Box>
  );
}