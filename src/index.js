import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from "@react-oauth/google"
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LaptopPage from "./components/pages/page";
import LoginPage from './components/pages/LoginPage';

const root = ReactDOM.createRoot(document.getElementById('root'))
const clientId = "726133421526-1e3g6etorn5s4re8h6hncg7mplhsqepp.apps.googleusercontent.com"

root.render(
   <Router>
      <GoogleOAuthProvider clientId={clientId}>
         <Routes>
            <Route path='/login' element={<LoginPage />}/>
            <Route path='/' element={<LaptopPage />}/>
         </Routes>
      </GoogleOAuthProvider>
   </Router>
)