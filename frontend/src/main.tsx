import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/context.tsx'

export const authService = "http://localhost:3000"
export const restaurantService = "http://localhost:3001"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="312310535295-nljij6pop13qibktp21s2fc3q3c5f3s9.apps.googleusercontent.com">
      <AppProvider>
         <App />
      </AppProvider>     
    </GoogleOAuthProvider>
  </StrictMode>
)
