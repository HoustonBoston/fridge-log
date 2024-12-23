import React from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"

export default function LoginPage({ setIsAuthenicated }) {
    const navigate = useNavigate()

    // call api to check if email is already in DB
    const checkEmailInDDB = async () => {
        const decoded = jwtDecode(localStorage.getItem('user_token'))
        const userEmail = decoded.email
        const apiUrl = `http://${device_ip}:8080/CheckEmailExistence` //api gw url, can be accessed via host machine's IP with configured firewall
        console.log('trying to call fetch items API')
        try{
            const res = await fetch(apiUrl, {
                method: 'GET',
                body: JSON.stringify({
                    email: userEmail
                })
            })
        } catch (e) {
            console.error(e)
        }
    }

    const handleLoginSuccess = async (credentialResponse) => {
        await checkEmailInDDB()
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