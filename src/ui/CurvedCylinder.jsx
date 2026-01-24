import { useRef, useEffect } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function CurvedCylinder({ children, videos }) {
  const cylinderRef = useRef(null)
  const { activeVideoId } = useVideoStore()

  // Animate cylinder rotation when video changes
  useEffect(() => {
    if (!cylinderRef.current) return

    const activeIndex = videos.findIndex(v => v.id === activeVideoId)
    const rotationY = activeIndex === 0 ? 0 : -40 // Rotate -40deg for second video

    gsap.to(cylinderRef.current, {
      rotateY: rotationY,
      duration: 0.45,
      ease: 'power2.out',
    })
  }, [activeVideoId, videos])

  return (
    <div className="curved-cylinder-container">
      <div 
        ref={cylinderRef}
        className="curved-cylinder"
      >
        {children}
      </div>
    </div>
  )
}



