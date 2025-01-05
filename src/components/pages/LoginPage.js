import React from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { Box, Typography } from "@mui/material"
import { jwtDecode } from "jwt-decode"

import image from '../../fridge.png'

export default function LoginPage ({ setIsAuthenicated })
{
    const navigate = useNavigate()

    // call api to check if email is already in DB
    const checkEmailInDDB = async () =>
    {
        console.log('checking email in DDB')
        const decoded = jwtDecode(localStorage.getItem('user_token'))
        const userEmail = decoded.email
        const apiUrl = `https://9mjp9t9wpa.execute-api.us-east-1.amazonaws.com/prod/checkEmailExistence/email?email=${userEmail}` //api gw url, can be accessed via host machine's IP with configured firewall
        console.log('trying to call check email existence API')

        try {
            const res = await fetch(apiUrl, {
                method: 'GET',
            })

            if (res.ok)
                return true
            return false;
        } catch (e) {
            console.error(e)
        }
    }

    const handleLoginSuccess = async (credentialResponse) =>
    {
        localStorage.setItem('user_token', credentialResponse.credential) //JWT
        await checkEmailInDDB().then(setIsAuthenicated(true)).then(navigate('/fridge-log'))
    }

    const hanldeLoginError = () =>
    {
        console.log('login error')
    }

    return (
        <Box sx={{
            "display" : "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexDirection" : "column",
            "height" : "50vh"
        }}>
            <img src={image} alt="Logo" height="100px" />
            <br></br>
            <Typography>Welcome to Fridge Log!</Typography>
            <br></br>
            <Typography>Sign in to look at what's in your fridge.</Typography>
            <br></br>
            <GoogleLogin
                theme="filled_blue"
                type="standard"
                onSuccess={handleLoginSuccess}
                onError={hanldeLoginError}
            />
        </Box>
    )
}