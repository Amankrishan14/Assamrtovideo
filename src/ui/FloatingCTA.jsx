import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function FloatingCTA({ url, text = 'Learn More', videoLoaded }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (videoLoaded && buttonRef.current) {
      // Responsive animation using scale instead of fixed pixels
      gsap.fromTo(buttonRef.current, 
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.3,
        }
      )
    }
  }, [videoLoaded])

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      ref={buttonRef}
      className={`floating-cta ${videoLoaded ? 'visible' : ''}`}
      onClick={handleClick}
      aria-label={text}
    >
      {text}
    </button>
  )
}
