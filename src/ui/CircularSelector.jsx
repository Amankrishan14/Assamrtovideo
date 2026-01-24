import { useRef, useEffect, useState } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function CircularSelector({ videos }) {
  const containerRef = useRef(null)
  const wheelRef = useRef(null)
  const { activeVideoId, setActiveVideo } = useVideoStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  // Find active index based on activeVideoId and set initial transforms
  useEffect(() => {
    const index = videos.findIndex(v => v.id === activeVideoId)
    if (index !== -1) {
      setActiveIndex(index)
      
      // Set initial 3D transforms immediately
      if (wheelRef.current) {
        const circles = wheelRef.current.querySelectorAll('.circular-thumb')
        circles.forEach((circle, i) => {
          const isActive = i === index
          const offset = i - index
          
          if (isActive) {
            // Active: centered
            gsap.set(circle, {
              translateX: 0,
              translateZ: 0,
              rotateY: 0,
              scale: 1.0,
              opacity: 1,
            })
          } else {
            // Inactive: offset with 3D transform
            const translateX = offset * 40
            const translateZ = -40
            const rotateY = offset * -30
            
            gsap.set(circle, {
              translateX: translateX,
              translateZ: translateZ,
              rotateY: rotateY,
              scale: 0.8,
              opacity: 0.6,
            })
          }
        })
      }
    }
  }, [activeVideoId, videos])

  // Animate 3D cylindrical transforms on activeIndex change
  useEffect(() => {
    if (!wheelRef.current) return

    const circles = wheelRef.current.querySelectorAll('.circular-thumb')
    circles.forEach((circle, index) => {
      const isActive = index === activeIndex
      
      // Calculate position relative to active index
      const offset = index - activeIndex
      
      if (isActive) {
        // Active: centered, scale 1.0, no rotation
        gsap.to(circle, {
          translateX: 0,
          translateZ: 0,
          rotateY: 0,
          scale: 1.0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        })
      } else {
        // Inactive: offset to side with 3D transform
        const translateX = offset * 40 // 40px offset per position
        const translateZ = -40 // Push back in 3D space
        const rotateY = offset * -30 // Rotate away from center
        
        gsap.to(circle, {
          translateX: translateX,
          translateZ: translateZ,
          rotateY: rotateY,
          scale: 0.8,
          opacity: 0.6,
          duration: 0.5,
          ease: 'power2.out',
        })
      }
    })
  }, [activeIndex])

  // Touch/Mouse drag handlers
  const handleStart = (clientX) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleMove = (clientX) => {
    if (!isDragging) return
    setCurrentX(clientX)
  }

  const handleEnd = () => {
    if (!isDragging) return
    
    const deltaX = currentX - startX
    const threshold = 50 // Minimum swipe distance
    
    // Determine swipe direction
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous video
        const newIndex = activeIndex === 0 ? videos.length - 1 : activeIndex - 1
        setActiveIndex(newIndex)
        setActiveVideo(videos[newIndex].id)
      } else {
        // Swipe left - go to next video
        const newIndex = activeIndex === videos.length - 1 ? 0 : activeIndex + 1
        setActiveIndex(newIndex)
        setActiveVideo(videos[newIndex].id)
      }
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

  // Global mouse events for drag outside element
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

  // Click handler for direct selection
  const handleCircleClick = (index, id) => {
    if (index !== activeIndex) {
      setActiveIndex(index)
      setActiveVideo(id)
    }
  }

  return (
    <div 
      ref={containerRef}
      className="curved-circular-selector"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div 
        ref={wheelRef}
        className="circular-wheel"
      >
        {videos.map((video, index) => {
          const isActive = index === activeIndex
          return (
            <div
              key={video.id}
              className={`circular-thumb ${isActive ? 'active' : ''}`}
              onClick={() => handleCircleClick(index, video.id)}
            >
              <video
                src={video.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="circular-video"
              />
              {isActive && (
                <div className="circular-glow" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

