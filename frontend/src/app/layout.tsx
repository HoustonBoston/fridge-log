'use client'

import React from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import type { Metadata } from 'next'

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
        <GoogleOAuthProvider clientId={clientId}>
          <div id="root">{children}</div>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
