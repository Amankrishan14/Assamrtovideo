import { useRef, useEffect, useState, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useVideoTexture } from '@react-three/drei'
import { useVideoStore } from '../store'
import * as THREE from 'three'

// Simple Video Panel - just a flat plane
function VideoPanel({ videoSrc, position, width, height }) {
  const videoTexture = useVideoTexture(videoSrc, {
    autoplay: true,
    loop: true,
    muted: true,
    playsInline: true,
  })

  const material = useRef()

  useEffect(() => {
    if (videoTexture && material.current) {
      // Configure texture
      videoTexture.minFilter = THREE.LinearFilter
      videoTexture.magFilter = THREE.LinearFilter
      videoTexture.wrapS = THREE.ClampToEdgeWrapping
      videoTexture.wrapT = THREE.ClampToEdgeWrapping
      
      material.current.map = videoTexture
      material.current.needsUpdate = true
    }
  }, [videoTexture])

  // Update texture every frame
  useFrame(() => {
    if (videoTexture && videoTexture.image) {
      if (videoTexture.image.readyState >= 2) {
        videoTexture.needsUpdate = true
      }
    }
  })

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={material} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Simple Video Player - optimized for smartphone portrait mode
export default function CylinderVideoCarousel({ videos }) {
  const groupRef = useRef()
  const { camera, viewport } = useThree()
  const [scale, setScale] = useState(1)

  // Mobile-first camera setup for portrait
  useEffect(() => {
    // Wider FOV for portrait screens
    camera.fov = 60
    camera.position.set(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  // Mobile-responsive scaling for portrait smartphones
  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isPortrait = height > width
      
      let newScale = 1
      
      if (isPortrait) {
        // Portrait mode - optimize for vertical stacking
        if (width < 400) {
          // Small phones
          newScale = 0.5
        } else if (width < 480) {
          // Standard phones
          newScale = 0.65
        } else if (width < 600) {
          // Large phones
          newScale = 0.75
        } else {
          newScale = 0.85
        }
      } else {
        // Landscape mode
        if (width < 768) {
          newScale = 0.6
        } else {
          newScale = 0.8
        }
      }
      
      setScale(newScale)
      if (groupRef.current) {
        groupRef.current.scale.set(newScale, newScale, newScale)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    window.addEventListener('orientationchange', updateScale)
    return () => {
      window.removeEventListener('resize', updateScale)
      window.removeEventListener('orientationchange', updateScale)
    }
  }, [])

  // Portrait video dimensions (9:16 aspect ratio)
  // Width is smaller, height is taller for portrait
  const videoWidth = 1.2   // Narrow width for portrait
  const videoHeight = 2.1  // Tall height for portrait
  const gap = 0.3          // Gap between videos

  return (
    <>
      {/* Simple lighting */}
      <ambientLight intensity={1} />

      {/* Video group - vertically stacked for portrait */}
      <group ref={groupRef} position={[0, 0, -3]}>
        <Suspense fallback={null}>
          {/* Top video - SBMU */}
          <VideoPanel
            videoSrc={videos[0].videoSrc}
            position={[0, 1.2, 0]}  // Positioned above center
            width={videoWidth}
            height={videoHeight}
          />
          
          {/* Bottom video - GSRTC */}
          <VideoPanel
            videoSrc={videos[1].videoSrc}
            position={[0, -1.2, 0]}  // Positioned below center
            width={videoWidth}
            height={videoHeight}
          />
        </Suspense>
      </group>
    </>
  )
}
