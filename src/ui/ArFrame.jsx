import { useRef, useEffect, useState } from 'react'
import './ar-frame.css'

export default function ArFrame({ banner, video, onVideoPlaying }) {
  const videoRef = useRef(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const previousVideoRef = useRef(null)

  // Enable audio automatically when video starts playing (not waiting for touch)
  // This runs once when the component mounts or when video is ready
  useEffect(() => {
    if (audioEnabled) return // Already enabled, no need to run again

    const videoEl = videoRef.current
    if (!videoEl) return

    const enableAudioOnReady = async () => {
      if (videoEl.readyState >= 3 && videoEl.paused === false) {
        try {
          videoEl.muted = false
          videoEl.volume = 1.0
          setAudioEnabled(true)
        } catch (err) {
          // If autoplay is blocked, set up fallback for user interaction
          const enableOnInteraction = async () => {
            try {
              if (videoEl) {
                videoEl.muted = false
                videoEl.volume = 1.0
                await videoEl.play()
                setAudioEnabled(true)
              }
            } catch (e) {
              // Still blocked, will try again on next interaction
            }
          }
          const events = ['touchstart', 'touchend', 'mousedown', 'click']
          events.forEach(event => {
            document.addEventListener(event, enableOnInteraction, { once: true, passive: true })
          })
        }
      }
    }

    // Try immediately if video is already playing
    if (videoEl.readyState >= 3 && !videoEl.paused) {
      enableAudioOnReady()
    } else {
      // Wait for video to start playing
      const handlePlaying = () => {
        enableAudioOnReady()
      }
      videoEl.addEventListener('playing', handlePlaying, { once: true })
      return () => {
        videoEl.removeEventListener('playing', handlePlaying)
      }
    }
  }, [audioEnabled])

  // Update video source when video prop changes - smooth transition with no blank frames
  useEffect(() => {
    if (!videoRef.current || !video) return

    const videoEl = videoRef.current
    
    // Store previous video source to keep it visible during transition
    if (videoEl.src && videoEl.src !== video) {
      previousVideoRef.current = videoEl.src
    }

    // Don't show blank frame - keep previous video visible during transition
    const wasPlaying = !videoEl.paused
    setVideoReady(false)
    
    // Only change opacity if we're switching to a different video
    if (videoEl.src && videoEl.src !== video) {
      videoEl.style.opacity = '0.98' // Slightly fade to indicate loading
    }
    
    videoEl.src = video
    videoEl.muted = !audioEnabled
    videoEl.load()
    
    const playVideo = () => {
      if (videoEl.readyState >= 3) {
        // Video is ready - smoothly fade in (no blank frame)
        requestAnimationFrame(() => {
          videoEl.style.opacity = '1'
        })
        setVideoReady(true)
        
        const playPromise = videoEl.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video is playing - try to enable audio immediately
              if (!audioEnabled) {
                try {
                  videoEl.muted = false
                  videoEl.volume = 1.0
                  setAudioEnabled(true)
                } catch (err) {
                  // Browser blocked autoplay with audio, keep muted
                  // The useEffect will handle enabling on user interaction
                  videoEl.muted = true
                }
              } else {
                // Audio already enabled, just unmute
                videoEl.muted = false
              }
              if (onVideoPlaying) onVideoPlaying()
            })
            .catch(() => {
              // Play failed, try muted
              videoEl.muted = true
              videoEl.play().then(() => {
                if (onVideoPlaying) onVideoPlaying()
              })
            })
        }
      }
    }

    // Check if video is already ready
    if (videoEl.readyState >= 3) {
      playVideo()
    } else {
      // Wait for video to be ready - use multiple events for better compatibility
      const handleReady = () => {
        if (videoEl.readyState >= 3) {
          playVideo()
        }
      }
      
      // Use canplaythrough for best quality (entire video buffered)
      videoEl.addEventListener('canplaythrough', handleReady, { once: true })
      // Fallback to loadeddata if canplaythrough doesn't fire
      videoEl.addEventListener('loadeddata', handleReady, { once: true })
      videoEl.addEventListener('canplay', handleReady, { once: true })
    }
  }, [video, audioEnabled, onVideoPlaying])

  return (
    <div className="ar-frame">
      <img src={banner} className="banner" alt="Banner" />
      <video
        ref={videoRef}
        className="video"
        autoPlay
        loop
        muted={!audioEnabled}
        playsInline
        preload="auto"
        volume={1}
      />
    </div>
  )
}


