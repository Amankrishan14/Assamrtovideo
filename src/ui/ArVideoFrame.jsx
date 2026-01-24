import { useEffect, useRef } from 'react'
import TempleVideoCard from './TempleVideoCard'

// Temple video configuration - single video
const videoConfig = {
  id: 1, 
  videoSrc: '/videos/Portal to Pandora.mp4',
  templeName: 'Portal to Pandora'
}

export default function ArVideoFrame({ onVideoPlaying }) {
  const preloadedVideosRef = useRef(new Map())

  // Preload video upfront to prevent blank frames
  useEffect(() => {
    if (!preloadedVideosRef.current.has(videoConfig.id)) {
      const preloadVideo = document.createElement('video')
      preloadVideo.src = videoConfig.videoSrc
      preloadVideo.preload = 'auto'
      preloadVideo.muted = true
      preloadVideo.playsInline = true
      preloadVideo.load()
      preloadedVideosRef.current.set(videoConfig.id, preloadVideo)
    }
  }, [])

  return (
    <TempleVideoCard 
      videoSrc={videoConfig.videoSrc}
      templeName={videoConfig.templeName}
      onVideoPlaying={onVideoPlaying}
    />
  )
}

