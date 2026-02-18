import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const KNOW_MORE_URL = 'https://megacorp-seven.vercel.app/'

export default function TempleVideoCard({ videoSrc, templeName, onVideoPlaying }) {
  const videoRef = useRef(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const previousVideoRef = useRef(null)

  const handleLearnMoreClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Feedback button clicked, opening:', KNOW_MORE_URL)
    if (KNOW_MORE_URL) {
      try {
        window.open(KNOW_MORE_URL, '_blank', 'noopener,noreferrer')
      } catch (error) {
        console.error('Error opening link:', error)
        // Fallback: try direct navigation
        window.location.href = KNOW_MORE_URL
      }
    }
  }

  // Enable audio on user interaction
  useEffect(() => {
    if (audioEnabled) return

    const videoEl = videoRef.current
    if (!videoEl) return

    const enableAudioOnReady = async () => {
      if (videoEl.readyState >= 3 && videoEl.paused === false) {
        try {
          videoEl.muted = false
          videoEl.volume = 1.0
          setAudioEnabled(true)
        } catch (err) {
          const enableOnInteraction = async () => {
            try {
              if (videoEl) {
                videoEl.muted = false
                videoEl.volume = 1.0
                await videoEl.play()
                setAudioEnabled(true)
              }
            } catch (e) {
              // Still blocked
            }
          }
          const events = ['touchstart', 'touchend', 'mousedown', 'click']
          events.forEach(event => {
            document.addEventListener(event, enableOnInteraction, { once: true, passive: true })
          })
        }
      }
    }

    if (videoEl.readyState >= 3 && !videoEl.paused) {
      enableAudioOnReady()
    } else {
      const handlePlaying = () => {
        enableAudioOnReady()
      }
      videoEl.addEventListener('playing', handlePlaying, { once: true })
      return () => {
        videoEl.removeEventListener('playing', handlePlaying)
      }
    }
  }, [audioEnabled])

  // Update video source when videoSrc changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return

    const videoEl = videoRef.current
    
    if (videoEl.src && videoEl.src !== videoSrc) {
      previousVideoRef.current = videoEl.src
    }

    setVideoReady(false)
    
    if (videoEl.src && videoEl.src !== videoSrc) {
      videoEl.style.opacity = '0.98'
    }
    
    videoEl.src = videoSrc
    videoEl.muted = !audioEnabled
    videoEl.load()
    
    const playVideo = () => {
      if (videoEl.readyState >= 3) {
        requestAnimationFrame(() => {
          videoEl.style.opacity = '1'
        })
        setVideoReady(true)
        
        const playPromise = videoEl.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!audioEnabled) {
                try {
                  videoEl.muted = false
                  videoEl.volume = 1.0
                  setAudioEnabled(true)
                } catch (err) {
                  videoEl.muted = true
                }
              } else {
                videoEl.muted = false
              }
              if (onVideoPlaying) onVideoPlaying()
            })
            .catch(() => {
              videoEl.muted = true
              videoEl.play().then(() => {
                if (onVideoPlaying) onVideoPlaying()
              })
            })
        }
      }
    }

    if (videoEl.readyState >= 3) {
      playVideo()
    } else {
      const handleReady = () => {
        if (videoEl.readyState >= 3) {
          playVideo()
        }
      }
      
      videoEl.addEventListener('canplaythrough', handleReady, { once: true })
      videoEl.addEventListener('loadeddata', handleReady, { once: true })
      videoEl.addEventListener('canplay', handleReady, { once: true })
    }
  }, [videoSrc, audioEnabled, onVideoPlaying])

  return (
    <div className="temple-video-card">
      {/* Video frame */}
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="temple-video-player"
          autoPlay
          loop
          muted={!audioEnabled}
          playsInline
          preload="auto"
          volume={1}
        />
        
        {!videoReady && (
          <div className="video-loader">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {/* Feedback Button */}
      <button
        className="learn-more-button"
        onClick={handleLearnMoreClick}
        aria-label="Feedback"
        type="button"
      >
        Feedback
      </button>

      <style>{`
        .temple-video-card {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          gap: 16px;
          pointer-events: auto;
        }

        .video-wrapper {
          width: 100%;
          flex: 1;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.9);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .temple-video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .learn-more-button {
          padding: 12px 32px;
          background: rgba(255, 255, 255, 0.95);
          color: #000;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
          position: relative;
          z-index: 100;
          pointer-events: auto !important;
        }

        .learn-more-button:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .learn-more-button:active {
          transform: scale(0.98);
        }

        @media (max-width: 768px) {
          .learn-more-button {
            padding: 10px 24px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}

TempleVideoCard.propTypes = {
  videoSrc: PropTypes.string.isRequired,
  templeName: PropTypes.string.isRequired,
  onVideoPlaying: PropTypes.func
}

