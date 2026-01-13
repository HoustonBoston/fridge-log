'use client'

import React from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import NavBar from "../components/navbar/NavBar"
import FridgeItemsProvider from "../contexts/ItemsContext"
import IsMobileProvider from "../contexts/IsMobileContext"
import SearchProvider from "../contexts/SearchContext"

const clientId = "726133421526-1e3g6etorn5s4re8h6hncg7mplhsqepp.apps.googleusercontent.com"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Fridge Log Application</title>
      </head>
      <body>
        <IsMobileProvider>
          <FridgeItemsProvider>
            <SearchProvider>
              <GoogleOAuthProvider clientId={clientId}>
                <NavBar />
                <div id="root" style={{ marginTop: '4em' }}>{children}</div>
              </GoogleOAuthProvider>
            </SearchProvider>
          </FridgeItemsProvider>
        </IsMobileProvider>
      </body>
    </html>
  )
}
