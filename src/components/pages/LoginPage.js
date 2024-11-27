import React from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"

export default function LoginPage({ setIsAuthenicated }) {
    const navigate = useNavigate()

    const handleLoginSuccess = (credentialResponse) => {
        localStorage.setItem('user_token', credentialResponse.credential)
        setIsAuthenicated(true)
        navigate('/')
    }

    const hanldeLoginError = () => {
        console.log('login error')
    }

    return (
        <Box>
            <h2>Login Page</h2>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={hanldeLoginError}
            />
        </Box>
    )
}