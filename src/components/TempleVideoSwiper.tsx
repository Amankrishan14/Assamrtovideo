import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import '../ui/styles.css'

// Video configuration - handles spaces in filenames
const templeVideos = [
  { id: 1, filename: 'Portal to Pandora.mp4', label: 'Portal to Pandora' },
  { id: 2, filename: 'Through the Valley of Mahadev.mp4', label: 'Through the Valley of Mahadev' }
]

interface Video {
  id: number
  filename: string
  label: string
}

interface TempleVideoSwiperProps {
  autoplay?: boolean
  showLabels?: boolean
}

export default function TempleVideoSwiper({ 
  autoplay = true, 
  showLabels = true 
}: TempleVideoSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [translateX, setTranslateX] = useState(0)

  const totalVideos = templeVideos.length

  // Calculate translate position based on current index
  const getTargetTranslate = (index: number) => {
    if (!containerRef.current) return 0
    const containerWidth = containerRef.current.offsetWidth
    return -index * containerWidth
  }

  // Animate to target slide
  const animateToSlide = (index: number) => {
    if (!sliderRef.current || !containerRef.current) return
    
    const targetTranslate = getTargetTranslate(index)
    
    gsap.to(sliderRef.current, {
      x: targetTranslate,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        if (sliderRef.current) {
          const currentTranslate = gsap.getProperty(sliderRef.current, 'x') as number
          setTranslateX(currentTranslate)
        }
      }
    })
  }

  // Update slide when index changes
  useEffect(() => {
    animateToSlide(currentIndex)
  }, [currentIndex])

  // Go to next slide
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalVideos)
  }

  // Go to previous slide
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalVideos) % totalVideos)
  }

  // Touch/Mouse drag handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current || !containerRef.current) return
    
    setCurrentX(clientX)
    const deltaX = clientX - startX
    const targetTranslate = getTargetTranslate(currentIndex)
    const newTranslate = targetTranslate + deltaX
    
    gsap.set(sliderRef.current, { x: newTranslate })
    setTranslateX(newTranslate)
  }

  const handleEnd = () => {
    if (!isDragging || !containerRef.current) return
    
    const deltaX = currentX - startX
    const containerWidth = containerRef.current.offsetWidth
    const threshold = containerWidth * 0.2 // 20% of width to trigger swipe
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        goToPrevious()
      } else {
        // Swipe left - go to next
        goToNext()
      }
    } else {
      // Snap back to current
      animateToSlide(currentIndex)
    }
    
    setIsDragging(false)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientX)
      const handleGlobalMouseUp = () => handleEnd()
      
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, currentX, startX, currentIndex])

  // Floating animation for container
  useEffect(() => {
    if (!containerRef.current) return
    
    gsap.to(containerRef.current, {
      y: 5,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
  }, [])

  return (
    <div className="temple-video-swiper-wrapper">
      {/* Swipe instruction */}
      <div className="swipe-instruction">
        <div className="swipe-arrows">
          <span>←</span>
          <span>Swipe</span>
          <span>→</span>
        </div>
      </div>

      {/* Main swiper container */}
      <div
        ref={containerRef}
        className="temple-video-swiper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Slider container */}
        <div
          ref={sliderRef}
          className="temple-slider"
          style={{
            display: 'flex',
            width: `${totalVideos * 100}%`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {templeVideos.map((video, index) => (
            <div
              key={video.id}
              className="temple-slide"
              style={{
                width: `${100 / totalVideos}%`,
                flexShrink: 0
              }}
            >
              <div className="temple-video-container">
                <video
                  src={`/videos/${encodeURIComponent(video.filename)}`}
                  autoPlay={autoplay}
                  loop
                  muted
                  playsInline
                  className="temple-video"
                  style={{
                    opacity: index === currentIndex ? 1 : 0.6,
                    transform: index === currentIndex ? 'scale(1)' : 'scale(0.95)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                  }}
                />
                {showLabels && (
                  <div className="temple-video-label">
                    {video.label}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="temple-dots">
        {templeVideos.map((video, index) => (
          <button
            key={video.id}
            className={`temple-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to ${video.label}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        className="temple-nav temple-nav-prev"
        onClick={goToPrevious}
        aria-label="Previous video"
      >
        ‹
      </button>
      <button
        className="temple-nav temple-nav-next"
        onClick={goToNext}
        aria-label="Next video"
      >
        ›
      </button>

      <style>{`
        .temple-video-swiper-wrapper {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .swipe-instruction {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: white;
          font-size: 18px;
          font-weight: 600;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          animation: fadeInOut 3s ease-in-out infinite;
        }

        .swipe-arrows {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .swipe-arrows span {
          font-size: 24px;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .temple-video-swiper {
          position: relative;
          width: 90%;
          max-width: 600px;
          height: 70vh;
          max-height: 700px;
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-y;
        }

        .temple-slider {
          height: 100%;
        }

        .temple-slide {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .temple-video-container {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
        }

        .temple-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        }

        .temple-video-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: white;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .temple-dots {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .temple-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .temple-dot.active {
          width: 30px;
          border-radius: 5px;
          background: white;
        }

        .temple-dot:hover {
          background: rgba(255, 255, 255, 0.7);
        }

        .temple-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
        }

        .temple-nav:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-50%) scale(1.1);
        }

        .temple-nav-prev {
          left: 20px;
        }

        .temple-nav-next {
          right: 20px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .temple-video-swiper {
            width: 95%;
            height: 60vh;
          }

          .swipe-instruction {
            top: 20px;
            font-size: 16px;
          }

          .temple-nav {
            width: 40px;
            height: 40px;
            font-size: 24px;
          }

          .temple-nav-prev {
            left: 10px;
          }

          .temple-nav-next {
            right: 10px;
          }

          .temple-video-label {
            font-size: 16px;
            padding: 15px;
          }
        }

        @media (max-width: 480px) {
          .temple-video-swiper {
            width: 100%;
            height: 55vh;
            border-radius: 16px;
          }

          .swipe-instruction {
            font-size: 14px;
          }

          .swipe-arrows span {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}

