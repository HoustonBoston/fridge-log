import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from "@react-oauth/google"
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LaptopPage from "./components/pages/page";
import LoginPage from './components/pages/LoginPage';

const clientId = "726133421526-1e3g6etorn5s4re8h6hncg7mplhsqepp.apps.googleusercontent.com"

const isUserLoggedIn = () => {
   return !!localStorage.getItem('user_token')
}

function App() {
   const [isAuthenticated, setIsAuthenticated] = useState(isUserLoggedIn())

   useEffect(() => {
      setIsAuthenticated(isUserLoggedIn())
   }, [])

   return (
      <Router>
         <GoogleOAuthProvider clientId={clientId}>
            <Routes>
               <Route path='/fridge-log' exact element={isAuthenticated ? <LaptopPage setIsAuthenticated={setIsAuthenticated} /> : <LoginPage setIsAuthenicated={setIsAuthenticated} />} />
            </Routes>
         </GoogleOAuthProvider>
      </Router>
   )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
   <App />
)