import React from 'react'
import './BannerARLayout.css'

/**
 * BannerARLayout - Reusable UI layout component for AR experiences
 * 
 * @param {string} bannerSrc - Path to the banner PNG image
 * @param {JSX} children - Content to render inside the glass container (video, gallery, etc.)
 */
export default function BannerARLayout({ bannerSrc, children }) {
  return (
    <div className="banner-ar-layout">
      {/* Top Banner Image */}
      <div className="banner-ar-layout__banner">
        <img 
          src={bannerSrc} 
          alt="Banner" 
          className="banner-ar-layout__banner-img"
        />
      </div>

      {/* Glass Blur Container for AR/Video Content */}
      <div className="banner-ar-layout__glass-container">
        {children}
      </div>
    </div>
  )
}



