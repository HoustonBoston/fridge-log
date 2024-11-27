import LoginButton from "../buttons/LoginButton"
import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"

export default function LoginPage({ setIsAuthenicated }){
    return (
        <LoginButton />
    )
}