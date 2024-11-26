import React from 'react';
import { Box, Button } from '@mui/material'
import { GoogleLogin } from '@react-oauth/google'


export default function LoginButton() {
    return (
        <Box>
            <GoogleLogin 
                onSuccess={(credentialResponse) => console.log('credential response', credentialResponse)}
                onError={() => console.log("login error")}
            />
        </Box>
    )
}