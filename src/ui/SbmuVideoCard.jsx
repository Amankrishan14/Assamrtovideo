import { useRef, useEffect, useState } from 'react'
import { useVideoStore } from '../store'
import './sbmu-video-card.css'

const videoConfigs = [
  { id: 1, videoSrc: '/videos/SBMU.mp4', bannerSrc: '/assets/banner/sbmu-banner.png', label: 'SBMU – Swachh Bharat Gujarat' },
  { id: 2, videoSrc: '/videos/GSRTC.mp4', bannerSrc: '/assets/banner/gsrtc-banner.png', label: 'GSRTC Smart Campaign' },
]

export default function SbmuVideoCard({ onVideoPlaying }) {
  const { activeVideoId, setActiveVideo } = useVideoStore()
  const videoRef = useRef(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const activeIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
  const activeVideo = videoConfigs[activeIndex] || videoConfigs[0]
  const activeBannerSrc = activeVideo.bannerSrc || videoConfigs[0].bannerSrc

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = async () => {
      if (videoRef.current && !audioEnabled) {
        try {
          videoRef.current.muted = false
          videoRef.current.volume = 1.0
          await videoRef.current.play()
          setAudioEnabled(true)
        } catch (err) {
          // Keep trying on next interaction
        }
      }
    }

    const events = ['touchstart', 'touchend', 'mousedown', 'click', 'touchmove']
    const handlers = events.map(event => {
      const handler = () => enableAudio()
      document.addEventListener(event, handler, { once: true, passive: true })
      return { event, handler }
    })

    return () => {
      handlers.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler)
      })
    }
  }, [audioEnabled])

  // Update video source when active video changes
  useEffect(() => {
    if (videoRef.current && activeVideo) {
      const video = videoRef.current
      video.src = activeVideo.videoSrc
      video.muted = !audioEnabled
      video.load()
      
      const playVideo = () => {
        if (video.readyState >= 3) {
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (audioEnabled) video.muted = false
                if (onVideoPlaying) onVideoPlaying()
              })
              .catch(() => {
                video.muted = true
                video.play().then(() => {
                  if (onVideoPlaying) onVideoPlaying()
                })
              })
          }
        }
      }

      if (video.readyState >= 3) {
        playVideo()
      } else {
        const handleReady = () => {
          if (video.readyState >= 3) {
            playVideo()
          }
        }
        video.addEventListener('canplaythrough', handleReady, { once: true })
        video.addEventListener('loadeddata', handleReady, { once: true })
        video.addEventListener('canplay', handleReady, { once: true })
      }
    }
  }, [activeVideo, audioEnabled, onVideoPlaying])

  // Swipe functionality to switch between videos
  useEffect(() => {
    let touchStartX = 0
    let touchEndX = 0
    let isSwiping = false

    const goToNextVideo = () => {
      const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
      if (currentActiveIndex < videoConfigs.length - 1) {
        const nextVideoId = videoConfigs[currentActiveIndex + 1].id
        setActiveVideo(nextVideoId)
      }
    }

    const goToPrevVideo = () => {
      const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
      if (currentActiveIndex > 0) {
        const prevVideoId = videoConfigs[currentActiveIndex - 1].id
        setActiveVideo(prevVideoId)
      }
    }

    function handleStart(e) {
      isSwiping = true
      touchStartX = e.touches ? e.touches[0].clientX : e.clientX
      touchEndX = touchStartX
    }

    function handleMove(e) {
      if (!isSwiping) return
      touchEndX = e.touches ? e.touches[0].clientX : e.clientX
    }

    function handleEnd() {
      if (!isSwiping) return
      isSwiping = false

      const deltaX = touchEndX - touchStartX
      const threshold = 40

      if (Math.abs(deltaX) < threshold) {
        return
      }

      if (deltaX < 0) {
        goToNextVideo()
      } else {
        goToPrevVideo()
      }
    }

    // Touch events
    window.addEventListener("touchstart", handleStart, { passive: true })
    window.addEventListener("touchmove", handleMove, { passive: true })
    window.addEventListener("touchend", handleEnd, { passive: true })

    // Mouse events for laptop
    let mouseDown = false
    const handleMouseDown = (e) => {
      mouseDown = true
      handleStart(e)
    }

    const handleMouseMove = (e) => {
      if (mouseDown) {
        handleMove(e)
      }
    }

    const handleMouseUp = () => {
      if (mouseDown) {
        mouseDown = false
        handleEnd()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener("touchstart", handleStart)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeVideoId, setActiveVideo])

  return (
    <div className="sbmu-frame-root">
      {/* Single rounded card that contains both banner and video */}
      <div className="sbmu-card">
        <img
          src={activeBannerSrc}
          className="sbmu-card__banner"
          alt={activeVideo?.label || 'Campaign banner'}
        />
        <video
          ref={videoRef}
          className="sbmu-card__video"
          autoPlay
          loop
          muted={!audioEnabled}
          playsInline
          preload="auto"
          volume={1}
        />
      </div>
    </div>
  )
}

