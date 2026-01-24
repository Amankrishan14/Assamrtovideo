/**
 * BannerARLayout Usage Examples
 * 
 * This file demonstrates how to use the BannerARLayout component
 * in different AR experience scenarios.
 */

import React from 'react'
import BannerARLayout from './BannerARLayout'

// ============================================
// EXAMPLE 1: SBMU Video Experience
// ============================================

export function SBMUExample() {
  return (
    <BannerARLayout bannerSrc="/assets/banners/sbmu-banner.png">
      <video 
        src="/videos/SBMU.mp4" 
        autoPlay 
        loop 
        muted
        playsInline
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: '20px'
        }}
      />
    </BannerARLayout>
  )
}

// ============================================
// EXAMPLE 2: GSRTC Swipeable Video Gallery
// ============================================

// Mock SwipeableVideoGallery component for demonstration
function SwipeableVideoGallery({ videos }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  
  const handleSwipe = (direction) => {
    if (direction === 'left' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <video
        src={videos[currentIndex]?.src}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: '20px'
        }}
      />
      {/* Swipe controls would go here */}
    </div>
  )
}

export function GSRTCExample() {
  const videosArray = [
    { id: 1, src: '/videos/GSRTC.mp4', label: 'GSRTC Video 1' },
    { id: 2, src: '/videos/GSRTC-2.mp4', label: 'GSRTC Video 2' },
    { id: 3, src: '/videos/GSRTC-3.mp4', label: 'GSRTC Video 3' }
  ]

  return (
    <BannerARLayout bannerSrc="/assets/banners/gsrtc-banner.png">
      <SwipeableVideoGallery videos={videosArray} />
    </BannerARLayout>
  )
}

// ============================================
// EXAMPLE 3: Custom AR Content
// ============================================

export function CustomARExample() {
  return (
    <BannerARLayout bannerSrc="/assets/banners/custom-banner.png">
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {/* Your custom AR content here */}
        <canvas id="ar-canvas" style={{ width: '100%', height: '100%' }} />
      </div>
    </BannerARLayout>
  )
}



