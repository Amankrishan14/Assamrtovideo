import { useRef, useEffect } from 'react'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import '../ui/styles.css'

export default function SidePanel({ videos }) {
  const panelRef = useRef(null)
  const { activeVideoId, setActiveVideo } = useVideoStore()

  // Find inactive video (the one not currently active)
  const activeVideo = videos.find(v => v.id === activeVideoId)
  const inactiveVideo = videos.find(v => v.id !== activeVideoId)

  // Animate panel scale and opacity based on active state
  useEffect(() => {
    if (!panelRef.current) return

    const isActive = activeVideoId === inactiveVideo?.id

    gsap.to(panelRef.current, {
      scale: isActive ? 1.0 : 0.85,
      opacity: isActive ? 1 : 0.3,
      duration: 0.45,
      ease: 'power2.out',
    })
  }, [activeVideoId, inactiveVideo])

  const handleClick = () => {
    if (inactiveVideo) {
      setActiveVideo(inactiveVideo.id)
    }
  }

  if (!inactiveVideo) return null

  return (
    <div 
      ref={panelRef}
      className="curved-side-panel"
      onClick={handleClick}
    >
      <video
        src={inactiveVideo.videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="side-panel-video"
      />
      <div className="side-panel-label">{inactiveVideo.label}</div>
    </div>
  )
}
