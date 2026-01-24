import { useState, useRef, useEffect, useCallback } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import './styles.css'

const videoConfigs = [
  { id: 1, videoSrc: '/videos/SBMU.mp4', label: 'SBMU – Swachh Bharat Gujarat' },
  { id: 2, videoSrc: '/videos/GSRTC.mp4', label: 'GSRTC Smart Campaign' },
]

export default function FloatingGlassVideo({ onVideoPlaying }) {
  const { activeVideoId, setActiveVideo } = useVideoStore()
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const nextVideoRef = useRef(null) // Second video for crossfade
  const animationFrameRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [nextVideoReady, setNextVideoReady] = useState(false)
  // Use refs to avoid stale closures in event handlers
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isTransitioningRef = useRef(false)
  const lastMoveTimeRef = useRef(0)
  const lastMoveXRef = useRef(0)
  const preloadedVideosRef = useRef(new Map()) // Preload all videos

  const activeIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
  const activeVideo = videoConfigs[activeIndex] || videoConfigs[0]

  // Preload all videos upfront to prevent blank frames
  useEffect(() => {
    videoConfigs.forEach((config) => {
      if (!preloadedVideosRef.current.has(config.id)) {
        const preloadVideo = document.createElement('video')
        preloadVideo.src = config.videoSrc
        preloadVideo.preload = 'auto'
        preloadVideo.muted = true
        preloadVideo.playsInline = true
        preloadVideo.load()
        preloadedVideosRef.current.set(config.id, preloadVideo)
      }
    })
  }, [])

  // Enable audio on first user interaction (required by browser autoplay policies)
  useEffect(() => {
    const enableAudio = async () => {
      if (videoRef.current && !audioEnabled) {
        try {
          videoRef.current.muted = false
          videoRef.current.volume = 1.0
          
          // Try to play with audio
          await videoRef.current.play()
          
          setAudioEnabled(true)
          console.log('Audio enabled')
        } catch (err) {
          console.warn('Audio autoplay prevented, will enable on next interaction:', err)
          // Keep trying on next interaction
        }
      }
    }

    // Enable audio on any user interaction
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

  // Smooth video loading with preloading - no blank frames
  useEffect(() => {
    if (!videoRef.current || !activeVideo) return
    
    const video = videoRef.current
    setVideoReady(false)
    
    // Check if video is already preloaded
    const preloadedVideo = preloadedVideosRef.current.get(activeVideo.id)
    
    // Use preloaded video if available, otherwise load normally
    if (preloadedVideo && preloadedVideo.readyState >= 3) {
      // Video is already loaded, use it immediately - no blank frame
      video.src = activeVideo.videoSrc
      video.volume = 1.0
      video.muted = !audioEnabled
      video.currentTime = 0
      
      // Set ready immediately since video is preloaded
      setVideoReady(true)
      
      // Play immediately since it's preloaded
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
    } else {
      // Load video normally - show previous frame until ready
      video.src = activeVideo.videoSrc
      video.volume = 1.0
      video.muted = !audioEnabled
      video.currentTime = 0
      video.load()
      
      // Keep video visible while loading (no blank frame)
      gsap.set(video, { opacity: 0.95 })
      
      const playVideo = () => {
        if (video.readyState >= 3) {
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (audioEnabled) video.muted = false
                setVideoReady(true)
                // Smooth fade to full opacity
                gsap.to(video, {
                  opacity: 1,
                  duration: 0.2,
                  ease: 'power2.out'
                })
                if (onVideoPlaying) onVideoPlaying()
              })
              .catch(() => {
                video.muted = true
                video.play().then(() => {
                  setVideoReady(true)
                  gsap.to(video, {
                    opacity: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                  })
                  if (onVideoPlaying) onVideoPlaying()
                })
              })
          }
        }
      }
      
      // Wait for video to be ready
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

  // Listen for video play events and initial load
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      if (onVideoPlaying) {
        onVideoPlaying()
      }
    }

    const handlePlaying = () => {
      if (onVideoPlaying) {
        onVideoPlaying()
      }
    }

    const handleLoadedData = () => {
      // If video is already playing when loaded, notify immediately
      if (!video.paused && video.readyState >= 2) {
        if (onVideoPlaying) {
          onVideoPlaying()
        }
      }
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('loadeddata', handleLoadedData)

    // Check if video is already playing
    if (!video.paused && video.readyState >= 2) {
      if (onVideoPlaying) {
        onVideoPlaying()
      }
    }

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [onVideoPlaying, activeVideo])

  // Smooth animation using requestAnimationFrame
  const updateTransform = useCallback((x, rot) => {
    if (containerRef.current) {
      // Apply transform to the panel, not the wrapper
      containerRef.current.style.transform = `translateX(${x}px) rotateY(${rot}deg)`
    }
  }, [])

  // Handle swipe start
  const handleStart = useCallback((clientX) => {
    if (isTransitioningRef.current) return
    
    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    setIsDragging(true)
    isDraggingRef.current = true
    setStartX(clientX)
    startXRef.current = clientX
    setCurrentX(clientX)
    currentXRef.current = clientX
    lastMoveXRef.current = clientX
    lastMoveTimeRef.current = Date.now()
    
    // Enable GPU acceleration and add dragging class
    if (containerRef.current) {
      containerRef.current.style.willChange = 'transform'
      containerRef.current.classList.add('dragging')
    }
  }, [])

  // Handle swipe move - optimized for smooth performance
  const handleMove = useCallback((clientX) => {
    if (!isDraggingRef.current || isTransitioningRef.current || !containerRef.current) return
    
    const now = Date.now()
    lastMoveXRef.current = clientX
    lastMoveTimeRef.current = now
    
    setCurrentX(clientX)
    currentXRef.current = clientX
    const deltaX = clientX - startXRef.current
    
    // Responsive max drag based on screen width - more sensitive for mobile
    const screenWidth = window.innerWidth
    const maxDelta = screenWidth < 400 ? 120 : screenWidth < 600 ? 140 : 150
    
    // Clamp the drag distance
    const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaX))
    setTranslateX(clampedDelta)
    
    // Apply rotation based on drag
    const rotationY = (clampedDelta / maxDelta) * 7
    
    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      updateTransform(clampedDelta, rotationY)
    })
  }, [updateTransform])

  // Handle swipe end - use ref to get latest activeVideoId
  const activeVideoIdRef = useRef(activeVideoId)
  useEffect(() => {
    activeVideoIdRef.current = activeVideoId
  }, [activeVideoId])

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current || isTransitioningRef.current) return
    
    const deltaX = currentXRef.current - startXRef.current
    const screenWidth = window.innerWidth
    // Very low threshold for mobile - make swiping super easy and responsive
    const threshold = screenWidth < 400 ? 15 : screenWidth < 600 ? 18 : 20
    
    // Calculate velocity for quick swipes (even if distance is small)
    const timeDelta = Date.now() - lastMoveTimeRef.current
    const velocity = timeDelta > 0 ? Math.abs(deltaX) / timeDelta : 0
    const velocityThreshold = 0.3 // pixels per millisecond
    
    // Get current active index using ref to avoid stale closure
    const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoIdRef.current)
    
    setIsDragging(false)
    isDraggingRef.current = false
    setIsTransitioning(true)
    isTransitioningRef.current = true
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    // Check swipe direction and distance OR velocity
    const absDeltaX = Math.abs(deltaX)
    const shouldSwitch = absDeltaX > threshold || velocity > velocityThreshold
    
    if (shouldSwitch) {
      // Swipe LEFT (negative deltaX, finger moves left) = NEXT video
      if (deltaX < 0 && currentActiveIndex < videoConfigs.length - 1) {
        const nextVideoId = videoConfigs[currentActiveIndex + 1].id
        setActiveVideo(nextVideoId)
      }
      // Swipe RIGHT (positive deltaX, finger moves right) = PREVIOUS video
      else if (deltaX > 0 && currentActiveIndex > 0) {
        const prevVideoId = videoConfigs[currentActiveIndex - 1].id
        setActiveVideo(prevVideoId)
      }
    }
    
    // Reset position with smooth animation
    const currentTranslateX = translateX
    const maxDeltaForRot = screenWidth < 400 ? 120 : screenWidth < 600 ? 140 : 150
    const startRot = (currentTranslateX / maxDeltaForRot) * 7
    const animObj = { x: currentTranslateX, rot: startRot }
    
    gsap.to(animObj, {
      x: 0,
      rot: 0,
      duration: 0.22,
      ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      onUpdate: () => {
        updateTransform(animObj.x, animObj.rot)
      },
      onComplete: () => {
        setTranslateX(0)
        setIsTransitioning(false)
        isTransitioningRef.current = false
        updateTransform(0, 0)
        
        // Remove will-change and dragging class after animation
        if (containerRef.current) {
          containerRef.current.style.willChange = 'auto'
          containerRef.current.classList.remove('dragging')
        }
      }
    })
  }, [setActiveVideo, translateX, updateTransform])

  // FULLSCREEN SWIPE LISTENERS - Simple and reliable
  useEffect(() => {
    let touchStartX = 0
    let touchEndX = 0
    let isSwiping = false

    const goToNextVideo = () => {
      const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoIdRef.current)
      if (currentActiveIndex < videoConfigs.length - 1) {
        const nextVideoId = videoConfigs[currentActiveIndex + 1].id
        // Preload next video before switching
        const nextVideo = preloadedVideosRef.current.get(nextVideoId)
        if (nextVideo && nextVideo.readyState < 3) {
          nextVideo.load()
        }
        setActiveVideo(nextVideoId)
      }
    }

    const goToPrevVideo = () => {
      const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoIdRef.current)
      if (currentActiveIndex > 0) {
        const prevVideoId = videoConfigs[currentActiveIndex - 1].id
        // Preload previous video before switching
        const prevVideo = preloadedVideosRef.current.get(prevVideoId)
        if (prevVideo && prevVideo.readyState < 3) {
          prevVideo.load()
        }
        setActiveVideo(prevVideoId)
      }
    }

    function handleStart(e) {
      console.log("[SWIPE DEBUG] touchstart")
      isSwiping = true
      touchStartX = e.touches[0].clientX
      touchEndX = touchStartX
    }

    function handleMove(e) {
      if (!isSwiping) return
      touchEndX = e.touches[0].clientX
      const deltaX = touchEndX - touchStartX
      console.log("[SWIPE DEBUG] deltaX:", deltaX)
      
      // Update visual feedback during swipe
      if (containerRef.current && Math.abs(deltaX) > 5) {
        const screenWidth = window.innerWidth
        const maxDelta = screenWidth < 400 ? 120 : screenWidth < 600 ? 140 : 150
        const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaX))
        const rotationY = (clampedDelta / maxDelta) * 7
        updateTransform(clampedDelta, rotationY)
      }
    }

    function handleEnd() {
      console.log("[SWIPE DEBUG] touchend")
      if (!isSwiping) return
      isSwiping = false

      const deltaX = touchEndX - touchStartX
      console.log("[SWIPE DEBUG] final deltaX:", deltaX)

      // Minimum swipe distance threshold
      if (Math.abs(deltaX) < 40) {
        console.log("[SWIPE DEBUG] swipe too small")
        // Reset position
        updateTransform(0, 0)
        return
      }

      if (deltaX < 0) {
        console.log("[SWIPE] NEXT VIDEO")
        goToNextVideo()
      } else {
        console.log("[SWIPE] PREV VIDEO")
        goToPrevVideo()
      }
      
      // Reset position
      updateTransform(0, 0)
    }

    // Attach listeners to FULL screen, not container
    window.addEventListener("touchstart", handleStart, { passive: true })
    window.addEventListener("touchmove", handleMove, { passive: true })
    window.addEventListener("touchend", handleEnd, { passive: true })

    // Keep mouse events for laptop
    const container = containerRef.current
    if (container) {
      const handleMouseDown = (e) => {
        if (!isTransitioningRef.current) {
          isSwiping = true
          touchStartX = e.clientX
          touchEndX = touchStartX
        }
      }

      const handleMouseMove = (e) => {
        if (isSwiping && !isTransitioningRef.current) {
          touchEndX = e.clientX
          const deltaX = touchEndX - touchStartX
          if (Math.abs(deltaX) > 5) {
            const screenWidth = window.innerWidth
            const maxDelta = screenWidth < 400 ? 120 : screenWidth < 600 ? 140 : 150
            const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaX))
            const rotationY = (clampedDelta / maxDelta) * 7
            updateTransform(clampedDelta, rotationY)
          }
        }
      }

      const handleMouseUp = () => {
        if (isSwiping) {
          isSwiping = false
          const deltaX = touchEndX - touchStartX
          if (Math.abs(deltaX) > 40) {
            if (deltaX < 0) {
              goToNextVideo()
            } else {
              goToPrevVideo()
            }
          }
          updateTransform(0, 0)
        }
      }

      container.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener("touchstart", handleStart)
        window.removeEventListener("touchmove", handleMove)
        window.removeEventListener("touchend", handleEnd)
        container.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }

    return () => {
      window.removeEventListener("touchstart", handleStart)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
    }
  }, [setActiveVideo, updateTransform])

  // Container ref for centering
  const containerWrapperRef = useRef(null)

  // Ensure perfect alignment on resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-center on resize - ensure container stays centered
      if (containerWrapperRef.current) {
        const container = containerWrapperRef.current
        // Ensure container is always centered - never override with drag transform
        container.style.top = '50%'
        container.style.left = '50%'
        container.style.right = 'auto'
        container.style.bottom = 'auto'
        // Always maintain centering transform on container
        container.style.transform = 'translate(-50%, -50%)'
      }
    }

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(handleResize, 100)
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 200) // Delay for orientation change
    })
    
    // Initial alignment check
    handleResize()

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Smooth crossfade transition - Instagram style (no blank frames)
  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return
    
    const container = containerRef.current
    const video = videoRef.current
    
    // Always keep container fully visible - never fade out (prevents blank frames)
    gsap.set(container, { opacity: 1 })
    
    // Smooth video opacity transition when ready
    if (videoReady) {
      // Video is ready, fade to full opacity smoothly
      gsap.to(video, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      })
    } else {
      // Video loading - keep it slightly visible (no blank frame)
      gsap.set(video, { opacity: 0.98 })
    }
  }, [activeVideoId, videoReady])
  
  // Initial video ready state - prevent blank frame on first load
  useEffect(() => {
    if (videoRef.current && !videoReady) {
      const video = videoRef.current
      // Keep video visible while loading
      gsap.set(video, { opacity: 0.98 })
    }
  }, [videoReady])

  return (
    <div 
      ref={containerWrapperRef}
      className="floating-glass-video-container"
      style={{ 
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      {/* Gradient glow effect */}
      <div className="glass-video-glow" />
      
      {/* Main glass panel */}
      <div
        ref={containerRef}
        className="glass-video-panel"
        style={{ 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
      >
        <video
          ref={videoRef}
          className="glass-video"
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

