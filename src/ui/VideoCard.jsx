import { useRef, useEffect, useState } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function VideoCard({ id, videoSrc, label }) {
  const cardRef = useRef(null)
  const videoRef = useRef(null)
  const blurBgRef = useRef(null)
  const { activeVideoId, setActiveVideo } = useVideoStore()
  const [hovered, setHovered] = useState(false)
  const isActive = activeVideoId === id

  const handleClick = (e) => {
    e.stopPropagation()
    setActiveVideo(id)
  }

  // Responsive hover/tap scale animation using GSAP
  useEffect(() => {
    if (!cardRef.current) return

    // Use scale instead of fixed pixel values for responsiveness
    const targetScale = isActive ? 1.05 : hovered ? 1.03 : 1.0

    gsap.to(cardRef.current, {
      scale: targetScale,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [isActive, hovered])

  // Touch-friendly interactions
  const handleTouchStart = () => {
    setHovered(true)
  }

  const handleTouchEnd = () => {
    setTimeout(() => setHovered(false), 200)
  }

  return (
    <div
      ref={cardRef}
      className={`video-card ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Blurred filler background */}
      <video
        ref={blurBgRef}
        src={videoSrc}
        className="card-blur-bg"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Video thumbnail */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={{
          opacity: isActive ? 1 : hovered ? 0.95 : 0.85,
        }}
      />

      {/* Label */}
      {label && (
        <div className="card-label">{label}</div>
      )}
    </div>
  )
}
