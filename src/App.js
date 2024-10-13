import * as React from 'react';
import dayjs from 'dayjs';
import { Box, TextField } from '@mui/material';
import { DateField, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  return (
    <Box className="App" sx={{
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      height:"100px"
    }}>
      <header className="App-header">
        <Box>
          <TextField label="Item name" variant='outlined'/>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateField sx={{marginLeft:"10px"}} defaultValue={dayjs(new Date())} label="Date purchased" />
          </LocalizationProvider>
        </Box>
      </header>
    </Box>
  );
}

export default App;
