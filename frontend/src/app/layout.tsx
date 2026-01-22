'use client'

import React from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { usePathname } from "next/navigation"
import NavBar from "../components/navbar/NavBar"
import FridgeItemsProvider from "../contexts/ItemsContext"
import IsMobileProvider from "../contexts/IsMobileContext"
import SearchProvider from "../contexts/SearchContext"

import path from 'path'
import process from 'process';

process.loadEnvFile(path.join(__dirname, '../../.env'));

const clientId = process.env.GOOGLE_CLIENT_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const hideNavPaths = new Set(['/login'])

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Fridge Log</title>
      </head>
      <body>
        <IsMobileProvider>
          <FridgeItemsProvider>
            <SearchProvider>
              <GoogleOAuthProvider clientId={clientId}>
                {!hideNavPaths.has(pathname) && <NavBar />}
                <div id="root" style={{ marginTop: hideNavPaths.has(pathname) ? 0 : '4em' }}>{children}</div>
              </GoogleOAuthProvider>
            </SearchProvider>
          </FridgeItemsProvider>
        </IsMobileProvider>
      </body>
    </html>
  )
}
