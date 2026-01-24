import { useRef, useEffect, useState } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function CylinderVideoCarousel({ videos }) {
  const cylinderRef = useRef(null)
  const containerRef = useRef(null)
  const { activeVideoId, setActiveVideo } = useVideoStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [rotationY, setRotationY] = useState(0)

  // Find active index
  const activeIndex = videos.findIndex(v => v.id === activeVideoId)
  // Simplified rotation for mobile: subtle 3D effect
  const targetRotation = activeIndex === 0 ? 0 : -90

  // Animate cylinder rotation when video changes
  useEffect(() => {
    if (!cylinderRef.current) return

    gsap.to(cylinderRef.current, {
      rotateY: targetRotation,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        // Update rotation state for real-time updates
        const currentRot = gsap.getProperty(cylinderRef.current, 'rotateY')
        setRotationY(currentRot)
      }
    })
  }, [targetRotation, activeIndex])

  // Animate face visibility and effects during rotation
  useEffect(() => {
    if (!containerRef.current) return

    const faces = containerRef.current.querySelectorAll('.cylinder-face')
    faces.forEach((face, index) => {
      const isActive = index === activeIndex
      const currentRot = rotationY
      const faceRot = index === 0 ? 0 : 90
      // Calculate how far face is from front (0deg)
      const faceAngle = index === 0 ? 0 : 90
      const currentAngle = (currentRot % 360 + 360) % 360
      const rotDiff = Math.min(Math.abs(currentAngle - faceAngle), Math.abs(currentAngle - (faceAngle + 360)))

      // Calculate blur, scale, and opacity based on rotation
      const blurAmount = Math.min(rotDiff / 90 * 15, 15) // Max 15px blur
      const scale = 1 - (rotDiff / 90 * 0.15) // Scale down to 0.85
      const opacity = isActive ? 1 : 0.6 - (rotDiff / 90 * 0.3) // Fade to 0.3

      gsap.to(face, {
        filter: `blur(${blurAmount}px)`,
        scale: scale,
        opacity: opacity,
        duration: 0.1,
        ease: 'none'
      })
    })
  }, [rotationY, activeIndex])

  // Touch/Mouse drag handlers
  const handleStart = (clientX) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleMove = (clientX) => {
    if (!isDragging || !cylinderRef.current) return
    setCurrentX(clientX)
    
    const deltaX = clientX - startX
    const sensitivity = 0.5
    const dragRotation = targetRotation - (deltaX * sensitivity)
    
    // Clamp rotation between -90 and 0
    const clampedRot = Math.max(-90, Math.min(0, dragRotation))
    gsap.set(cylinderRef.current, { rotateY: clampedRot })
    setRotationY(clampedRot)
  }

  const handleEnd = () => {
    if (!isDragging) return
    
    const deltaX = currentX - startX
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && activeIndex < videos.length - 1) {
        // Swipe left - go to next (rotate right)
        setActiveVideo(videos[activeIndex + 1].id)
      } else if (deltaX > 0 && activeIndex > 0) {
        // Swipe right - go to previous (rotate left)
        setActiveVideo(videos[activeIndex - 1].id)
      } else {
        // Snap back
        gsap.to(cylinderRef.current, {
          rotateY: targetRotation,
          duration: 0.4,
          ease: 'power2.out'
        })
      }
    } else {
      // Snap back to current
      gsap.to(cylinderRef.current, {
        rotateY: targetRotation,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
    
    setIsDragging(false)
  }

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault()
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    handleEnd()
  }

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault()
    handleStart(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    handleMove(e.clientX)
  }

  const handleMouseUp = (e) => {
    e.preventDefault()
    handleEnd()
  }

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, currentX, startX])

  // Floating animation
  useEffect(() => {
    if (!containerRef.current) return

    gsap.to(containerRef.current, {
      y: 3,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
  }, [])

  return (
    <div 
      ref={containerRef}
      className="cylinder-video-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Radial glow behind cylinder */}
      <div className="cylinder-glow" />
      
      {/* Shadow under cylinder */}
      <div className="cylinder-shadow" />

      {/* Cylinder container */}
      <div className="cylinder-container">
        <div 
          ref={cylinderRef}
          className="cylinder"
        >
          {videos.map((video, index) => {
            const isActive = index === activeIndex
            // Position faces around cylinder: 0deg (front) and 90deg (right side)
            const faceRot = index === 0 ? 0 : 90
            
            return (
              <div
                key={video.id}
                className={`cylinder-face ${isActive ? 'active' : ''}`}
                style={{
                  transform: `translate(-50%, -50%) rotateY(${faceRot}deg) translateZ(200px)`
                }}
              >
                <div className="face-video-wrapper">
                  <video
                    src={video.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="face-video"
                    style={{
                      opacity: isActive ? 1 : 0.7,
                      filter: isActive ? 'none' : 'brightness(0.8)'
                    }}
                  />
                  <div className="face-label">{video.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

