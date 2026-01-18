'use client'

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { Box, Typography, Card, TextField, Button, Input } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode"
import Image from 'next/image'
import Form from "next/form"

import urls from "../../urls"
import img from '../../fridge.png'

import DecodedToken from "../../interfaces/DecodedToken"
import Link from "next/link"

export default function LoginPage(): JSX.Element | null {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState<boolean>(true)
    const [email, setEmail] = useState<string>('')

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

    const formAction = (formData: FormData) => {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Here you would typically send the email and password to your backend for verification.
        console.log('Email:', email);
        console.log('Password:', password);
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "2em",
            marginTop: "-4em"
        }}>

            {/* <Card sx={{
                    width: "50%",
                    color: "red",
                    fontSize: 20
                }} variant="outlined">
                    <Typography>If you are a new user, you will see an email from AWS in your spam folder.
                        Click that link to confirm email subscription so you can start receiving notifications on your items expiring soon.</Typography>
                </Card> */}

            <Box sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                border: "0.01em solid #ccc",
                borderRadius: "0.5em",
                padding: "1em 1em",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}>
                <Image src={img} alt="Fridge Log" width={100} height={100} />
                <Form action={formAction} style={{ gap: "0.5em", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "1em" }}>
                    <TextField
                        label="Email" 
                        placeholder="Email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ backgroundColor: "rgba(63, 161, 209, 0.3)" }}
                    />
                    <TextField required={!!email} label="Password" placeholder="Password" type="password"
                        sx={{ backgroundColor: "rgba(63, 161, 209, 0.3)" }}
                    />
                    <TextField required={!!email} label="Confirm Password" placeholder=" Confirm Password" type="password"
                        sx={{ backgroundColor: "rgba(63, 161, 209, 0.3)" }}
                    />
                    <Button type="submit" variant="contained" sx={{ width: "100%" }}>Sign Up</Button>
                </Form>

                <Typography style={{marginTop: "1em"}}>Already have an account? <Link href="/login">Login</Link></Typography>

                {/** separator with text */}
                <Box sx={{ margin: "0.5em 0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%" }}>
                    {/** Left line */}
                    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}></Box>
                    <Typography sx={{margin: "0 0.5em"}}>OR</Typography>
                    {/** Right line */}
                    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}></Box>
                </Box>

                <GoogleLogin
                    text="continue_with"
                    theme="filled_blue"
                    type="standard"
                    shape="pill"
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                />
            </Box>
        </Box>
    )
}
