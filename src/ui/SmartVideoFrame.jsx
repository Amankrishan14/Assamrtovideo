import { useRef, useEffect, useState } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function SmartVideoFrame({ videoSrc, label }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const blurBgRef = useRef(null)
  const { activeVideoId } = useVideoStore()
  const [aspectRatio, setAspectRatio] = useState(16 / 9)

  // Auto-detect aspect ratio and handle responsive sizing
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    const updateDimensions = () => {
      if (video.videoWidth && video.videoHeight) {
        const ratio = video.videoWidth / video.videoHeight
        setAspectRatio(ratio)

        // Use CSS for responsive sizing, just set aspect-ratio
        if (containerRef.current) {
          containerRef.current.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`
          
          // Smooth fade-in animation
          gsap.fromTo(containerRef.current, 
            { opacity: 0, scale: 0.95 },
            { 
              opacity: 1, 
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
            }
          )
        }
      }
    }

    if (video.readyState >= 2) {
      updateDimensions()
    } else {
      video.addEventListener('loadedmetadata', updateDimensions, { once: true })
    }

    return () => {
      video.removeEventListener('loadedmetadata', updateDimensions)
    }
  }, [videoSrc])

  // Handle window resize for responsive updates
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && videoRef.current) {
        // Trigger reflow to update CSS-based dimensions
        containerRef.current.style.width = containerRef.current.offsetWidth + 'px'
        containerRef.current.style.width = ''
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Crossfade on video change - 0.3s fade as specified
  useEffect(() => {
    if (videoRef.current && blurBgRef.current) {
      // Fade out both videos
      gsap.set([videoRef.current, blurBgRef.current], { opacity: 0 })
      
      // Fade in after a brief moment
      gsap.to([videoRef.current, blurBgRef.current], {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0.05,
      })
    }
  }, [videoSrc, activeVideoId])

  // Animate scale based on active state
  useEffect(() => {
    if (!containerRef.current) return

    gsap.to(containerRef.current, {
      scale: 1.0,
      duration: 0.45,
      ease: 'power2.out',
    })
  }, [activeVideoId])

  return (
    <div 
      ref={containerRef}
      className="curved-main-video"
    >
      {/* Blurred background fill */}
      <video
        ref={blurBgRef}
        src={videoSrc}
        className="video-blur-bg"
        autoPlay
        loop
        muted
        playsInline
      />
      
      {/* Main video */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 1 }}
      />

      {/* Label */}
      {label && (
        <div className="video-label">{label}</div>
      )}
    </div>
  )
}
