import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './styles.css'

export default function SwipeInstruction({ videoPlaying }) {
  const [show, setShow] = useState(true)
  const popupRef = useRef(null)
  const startTimeRef = useRef(null)
  const autoHideTimerRef = useRef(null)
  const hasStartedFade = useRef(false)

  // Handle manual close
  const handleClose = () => {
    if (popupRef.current) {
      hasStartedFade.current = true
      gsap.to(popupRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShow(false)
        }
      })
    }
  }

  useEffect(() => {
    if (!popupRef.current || !show) return

    // Record start time
    startTimeRef.current = Date.now()

    // Fade in with bounce
    gsap.fromTo(popupRef.current,
      {
        opacity: 0,
        y: 20,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }
    )

    // Auto-hide after 25 seconds
    autoHideTimerRef.current = setTimeout(() => {
      if (!hasStartedFade.current && popupRef.current) {
        hasStartedFade.current = true
        gsap.to(popupRef.current, {
          opacity: 0,
          y: -10,
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            setShow(false)
          }
        })
      }
    }, 25000) // 25 seconds

    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current)
      }
    }
  }, [show])

  if (!show) return null

  return (
    <div ref={popupRef} className="swipe-instruction">
      <div className="swipe-instruction-content">
        <span className="swipe-instruction-text">Swipe → to see the next video</span>
        <button 
          className="swipe-instruction-close"
          onClick={handleClose}
          aria-label="Close instruction"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}


