import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './styles'
// Importa el archivo principal de Tailwind y tus globales
import "./styles/globals.css";
import "./styles/tailwind.css";
//import "./styles/*"
import "./styles/tailwind.css";

import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
