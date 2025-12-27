import * as React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import DeleteItemDialog from '../dialog/DeleteItemDialog';

export default function ItemInfoField({ fridge_item, handleDeleteItem, handleUpdateItem, isMobile }) {
  dayjs.extend(utc)
  dayjs.extend(timezone)

  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
  const { item_name, expiry_date } = fridge_item //in unix when data is fetched
  const [expiryDate, setExpiryDate] = React.useState(dayjs.unix(expiry_date)) // convert back to dayjs object

  const handleExpiryDateChange = (value) => {
    console.log('calling handleExpiryDateChange')
    console.log('value in handleExpiryDateChange', value)

    if (dayjs.isDayjs(value) && value.tz('America/New_York').hour(12).minute(0).second(0).millisecond(0).unix() !==
      expiryDate.tz('America/New_York').hour(12).minute(0).second(0).millisecond(0).unix()) {
      const updatedItem = { ...fridge_item, expiry_date: value.tz('America/New_York').hour(12).minute(0).second(0).millisecond(0).unix() }
      handleUpdateItem(updatedItem)
      setExpiryDate(dayjs(value).tz('America/New_York').hour(12).minute(0).second(0).millisecond(0))
    }
  }

  const handleItemNameChange = (event) => {
    if (event.target.value !== item_name) {
      console.log('event.targe.value', event.target.value)
      const updatedItem = {
        ...fridge_item, 'item_name': event.target.value
      }
      handleUpdateItem(updatedItem)
    }
  }

  const handleOpenDialog = () => {
    setOpenDeleteDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false)
  }

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: 'start',
      flexDirection: isMobile? 'column' : "row",
      gap: '1em'
    }}>
      <DeleteItemDialog open={openDeleteDialog} itemName={item_name} onDeleteClick={handleDeleteItem} onCancelClick={handleCloseDialog} />
      <Box >
        <TextField defaultValue={item_name} label="Item name" variant='outlined' onBlur={handleItemNameChange} />
        {
          isMobile ?
            <IconButton onClick={handleOpenDialog} color='blue'>
              <DeleteIcon color="blue" />
            </IconButton>
            : <></>
        }
      </Box>

      <Box >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker value={expiryDate} label="Expiry date" onAccept={handleExpiryDateChange} />
        </LocalizationProvider>
        <Typography sx={{ pt: '2%', marginLeft: "10px" }}>
          {(expiryDate.tz('America/New_York').startOf('day').diff(dayjs().tz('America/New_York').startOf('day'), 'days') === 1) ? "1 day left" : `${expiryDate.tz('America/New_York').startOf('day').diff(dayjs().tz('America/New_York').startOf('day'), 'days')} days left`}
        </Typography>
      </Box>

      <Box>
        {
          !isMobile ?
            <IconButton onClick={handleOpenDialog} color='blue'>
              <DeleteIcon color='blue' />
            </IconButton>
            : <></>
        }
      </Box>
    </Box>
  );
}