import React from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { jwtDecode } from "jwt-decode"

export default function LoginPage ({ setIsAuthenicated })
{
    const navigate = useNavigate()
    const device_ip = "localhost"

    // call api to check if email is already in DB
    const checkEmailInDDB = async () =>
    {
        console.log('checking email in DDB')
        const decoded = jwtDecode(localStorage.getItem('user_token'))
        const userEmail = decoded.email
        const apiUrl = `https://vt9hyjifpg.execute-api.us-east-1.amazonaws.com/prod/checkEmailExistence/email?email=${userEmail}` //api gw url, can be accessed via host machine's IP with configured firewall
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
        await checkEmailInDDB().then(setIsAuthenicated(true)).then(navigate('/'))
    }

    const hanldeLoginError = () =>
    {
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