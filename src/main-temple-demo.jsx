import React from 'react'
import ReactDOM from 'react-dom/client'
import TempleVideoDemo from './TempleVideoDemo'
import './index.css'

/**
 * QUICK START: Temple Video Swiper Demo
 * 
 * To test the Temple Video Swiper:
 * 
 * 1. Update vite.config.js to use this file as entry point, OR
 * 2. Temporarily rename this file to main.jsx (backup original first), OR
 * 3. Import TempleVideoDemo into your existing App.jsx
 * 
 * This will display a full-screen swipeable carousel with all 6 temple videos.
 */

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <TempleVideoDemo />
    </React.StrictMode>
  )
}

