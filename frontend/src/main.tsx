import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/context.tsx'
import "leaflet/dist/leaflet.css";
import { SocketProvider } from './context/socketContext.tsx'
export const authService = '/auth-api'
export const restaurantService = '/restaurant-api'
export const utilsService = '/utils-api'
export const realtimeService = '/realtime-api'
export const riderService = '/rider-api'
export const adminService = '/admin-api'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="312310535295-nljij6pop13qibktp21s2fc3q3c5f3s9.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
         <App />
        </SocketProvider>
      </AppProvider>     
    </GoogleOAuthProvider>
  </StrictMode>
)
