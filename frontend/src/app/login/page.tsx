'use client'

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { Box, Typography, Card, TextField, Button, Input } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode"
import Image from 'next/image'

import urls from "../../urls"
import img from '../../fridge.png'

import DecodedToken from "../../interfaces/DecodedToken"

export default function LoginPage(): JSX.Element | null {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState<boolean>(true)
    const [imageLoaded, setImageLoaded] = useState<boolean>(false)

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

    const handleLoginError = (): void => {
        console.log('login error')
    }

    // Show loading while checking authentication
    if (isChecking) {
        return null
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            paddingTop: "-4em",
        }}>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "1.5em",
                padding: { xs: "1em 0.5em", sm: "3em 4em" },
                boxShadow: "0 1.25em 3.75em rgba(0, 0, 0, 0.2)",
                gap: { xs: "1em", sm: "1.5em" },
                opacity: imageLoaded ? 1 : 0,
                transform: imageLoaded ? "translateY(0)" : "translateY(-20px)",
                transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                width: { xs: "90%", sm: "auto" },
                maxWidth: "400px",
            }}>
                <Image 
                    src={img} 
                    alt="Fridge Log" 
                    width={120} 
                    height={120}
                    onLoad={() => setImageLoaded(true)}
                    style={{
                        transition: "opacity 0.5s ease-out",
                        width: "clamp(80px, 20vw, 120px)",
                        height: "auto",
                    }}
                />
                
                <Box sx={{ textAlign: "center", mb: 1 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700, 
                            color: "#333",
                            mb: 0.5,
                            fontSize: { xs: "1.5rem", sm: "2.125rem" }
                        }}
                    >
                        Fridge Log
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: "#666",
                            fontSize: { xs: "0.85rem", sm: "0.95rem" }
                        }}
                    >
                        Track your food, reduce waste
                    </Typography>
                </Box>

                <GoogleLogin
                    text="continue_with"
                    theme="filled_blue"
                    type="standard"
                    shape="pill"
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                />
                
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: "#999", 
                        textAlign: "center",
                        maxWidth: "20em",
                        lineHeight: 1.5
                    }}
                >
                    Sign in to manage your fridge items and get expiration reminders
                </Typography>
            </Box>
        </Box>
    )
}
