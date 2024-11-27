import React from 'react';
import { Box, Button } from '@mui/material'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom';

export default function LoginButton() {
    const navigate = useNavigate()

    return (
        <Box>
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    console.log('credential response', credentialResponse)
                    navigate('/')
                }}
                onError={() => console.log("login error")}
            />
        </Box>
    )
}