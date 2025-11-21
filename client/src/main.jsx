import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug: Check if PayPal Client ID is loaded
console.log("🔍 PAYPAL KEY:", import.meta.env.VITE_APP_PAYPAL_CLIENT_ID);
console.log("🔍 All env vars:", import.meta.env);

createRoot(document.getElementById('root')).render(
    <App />
)
