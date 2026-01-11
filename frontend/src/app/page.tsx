'use client'

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { Box, Typography, Card } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode"
import Image from 'next/image'

import urls from "../urls"
import image from '../fridge.png'

import DecodedToken from "../interfaces/DecodedToken"

export default function LoginPage(): JSX.Element | null {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState<boolean>(true)

    useEffect(() => {
        // Check if user is already logged in and redirect to fridge-items
        const userToken = localStorage.getItem('user_token')
        if (userToken) {
            router.push('/fridge-items')
        } else {
            setIsChecking(false)
        }
    }, [router])

    // call api to check if email is already in DB
    const checkEmailInDDB = async (): Promise<boolean | undefined> => {
        console.log('checking email in DDB')
        const token = localStorage.getItem('user_token')
        if (!token) return false
        
        const decoded = jwtDecode<DecodedToken>(token)
        const userEmail = decoded.email
        const apiUrl = `${urls.checkEmailExistenceApiUrl}checkEmailExistence/email?email=${userEmail}` //api gw invoke url
        console.log('trying to call check email existence API')

        try {
            const res = await fetch(apiUrl, {
                method: 'GET',
            })

            if (res.ok)
                return true
            return false
        } catch (e) {
            console.error(e)
            return false
        }
    }

    const handleLoginSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
        if (!credentialResponse.credential) return
        
        localStorage.setItem('user_token', credentialResponse.credential)  //JWT
        await checkEmailInDDB()
        router.push('/fridge-items')
    }

    const hanldeLoginError = (): void => {
        console.log('login error')
    }

    // Show loading while checking authentication
    if (isChecking) {
        return null
    }

    return (
        <Box sx={{
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexDirection": "column",
            "height": "50vh"
        }}>
            <Image src={image} alt="Logo" height={100} />
            <br></br>
            <Typography>Welcome to Fridge Log!</Typography>
            <br></br>
            <Card sx={{
                width: "15em",
                color: "red",
                fontSize: 20
            }} variant="outlined">
                <Typography>NOTE: If you are a new user, you will see an email from AWS in your spam folder.
                    Click that link to confirm email subscription so you can start receiving notifications on your items expiring soon.</Typography>
            </Card>
            <br></br>
            <GoogleLogin
                text="continue_with"
                theme="filled_blue"
                type="standard"
                onSuccess={handleLoginSuccess}
                onError={hanldeLoginError}
            />
        </Box>
    )
}