import { useRef, useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useVideoTexture, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useVideoStore } from '../store'
import { gsap } from 'gsap'
import * as THREE from 'three'

// ============================================================================
// 1. CREATE GLASS CYLINDER FRAME (Container only, no content)
// ============================================================================
function GlassCylinderFrame({ radius, height }) {
  // Create hollow cylinder frame (just the rim/edges)
  const outerRadius = radius + 0.05
  const innerRadius = radius - 0.05
  
  // Top and bottom rings
  const topRingGeometry = useMemo(() => {
    return new THREE.RingGeometry(innerRadius, outerRadius, 64)
  }, [innerRadius, outerRadius])
  
  const bottomRingGeometry = useMemo(() => {
    return new THREE.RingGeometry(innerRadius, outerRadius, 64)
  }, [innerRadius, outerRadius])
  
  // Side walls (curved segments)
  const sideGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(outerRadius, outerRadius, height, 64, 1, true)
  }, [outerRadius, height])
  
  const innerSideGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(innerRadius, innerRadius, height, 64, 1, true)
  }, [innerRadius, height])

  // Frosted glass material
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.3,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  return (
    <group>
      {/* Top ring */}
      <mesh geometry={topRingGeometry} material={glassMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, height / 2, 0]} />
      
      {/* Bottom ring */}
      <mesh geometry={bottomRingGeometry} material={glassMaterial} rotation={[Math.PI / 2, 0, 0]} position={[0, -height / 2, 0]} />
      
      {/* Outer side wall */}
      <mesh geometry={sideGeometry} material={glassMaterial} rotation={[Math.PI / 2, 0, 0]} />
      
      {/* Inner side wall (inverted) */}
      <mesh geometry={innerSideGeometry} material={glassMaterial} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, -1]} />
    </group>
  )
}

// ============================================================================
// 2. CREATE CURVED VIDEO PANEL (Individual panel with rounded corners)
// ============================================================================
function createCurvedVideoPanel(width, height, radius, cornerRadius, segments = 32) {
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const uvs = []
  const indices = []
  const normals = []

  // Create a curved rectangular panel with rounded corners
  // The panel curves around a cylinder axis
  const halfWidth = width / 2
  const halfHeight = height / 2
  const arcLength = width / radius // Arc length in radians

  // Generate vertices with rounded corners
  for (let y = 0; y <= segments; y++) {
    const v = y / segments
    const yPos = (v - 0.5) * height

    for (let x = 0; x <= segments; x++) {
      const u = x / segments
      
      // Calculate position along curved surface
      const angle = (u - 0.5) * arcLength
      const xPos = Math.sin(angle) * radius
      const zPos = (Math.cos(angle) - 1) * radius
      
      // Apply rounded corners using smoothstep
      const cornerX = Math.abs(u - 0.5) * 2
      const cornerY = Math.abs(v - 0.5) * 2
      const cornerDist = Math.sqrt(cornerX * cornerX + cornerY * cornerY)
      const cornerFactor = Math.max(0, 1 - (cornerDist - 0.7) / 0.3)
      const roundedFactor = 1 - Math.pow(cornerFactor, 2) * 0.1

      vertices.push(xPos * roundedFactor, yPos * roundedFactor, zPos)
      
      // UV mapping (no distortion)
      uvs.push(u, 1 - v)
      
      // Normal points outward
      const normal = new THREE.Vector3(xPos, 0, zPos + radius).normalize()
      normals.push(normal.x, normal.y, normal.z)
    }
  }

  // Create faces
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      const a = y * (segments + 1) + x
      const b = a + 1
      const c = a + (segments + 1)
      const d = c + 1

      indices.push(a, b, c)
      indices.push(b, d, c)
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

function CurvedVideoPanel({ videoTexture, isActive, position, rotation, panelWidth, panelHeight, cylinderRadius }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const materialRef = useRef()

  // Create curved panel geometry
  const geometry = useMemo(() => {
    return createCurvedVideoPanel(panelWidth, panelHeight, cylinderRadius, 0.1, 32)
  }, [panelWidth, panelHeight, cylinderRadius])

  // Glass material with video texture (with blur shader for inactive)
  const material = useMemo(() => {
    if (!videoTexture) return null

    // Use shader material for blur effect on inactive panels
    if (!isActive) {
      return new THREE.ShaderMaterial({
        uniforms: {
          videoTexture: { value: videoTexture },
          blurAmount: { value: 0.02 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D videoTexture;
          uniform float blurAmount;
          
          varying vec2 vUv;
          varying vec3 vNormal;
          
          void main() {
            // Simple blur by sampling multiple points
            vec4 color = vec4(0.0);
            float total = 0.0;
            
            for (int x = -2; x <= 2; x++) {
              for (int y = -2; y <= 2; y++) {
                vec2 offset = vec2(float(x), float(y)) * blurAmount;
                color += texture2D(videoTexture, vUv + offset);
                total += 1.0;
              }
            }
            
            color /= total;
            
            // Dim the color
            color.rgb *= 0.6;
            
            // Glass effect
            vec3 glassColor = mix(color.rgb, vec3(1.0), 0.1);
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            vec3 finalColor = mix(glassColor, vec3(1.0), fresnel * 0.15);
            
            gl_FragColor = vec4(finalColor, 0.5);
          }
        `,
        side: THREE.BackSide,
        transparent: true,
      })
    }

    // Active panel: sharp, full brightness
    return new THREE.MeshPhysicalMaterial({
      map: videoTexture,
      transmission: 0.95,
      thickness: 0.5,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.98,
    })
  }, [videoTexture, isActive])

  // Edge glow material
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isActive ? 0x6a5af9 : 0x4a5568,
      transparent: true,
      opacity: isActive ? 0.3 : 0.1,
      side: THREE.BackSide,
    })
  }, [isActive])

  // Store material reference
  useEffect(() => {
    materialRef.current = material
  }, [material])

  // Update texture and control playback
  useFrame(() => {
    if (videoTexture && videoTexture.image) {
      if (videoTexture.image.readyState >= 2) {
        videoTexture.needsUpdate = true
        
        // Update shader uniform if using shader material
        if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.videoTexture) {
          materialRef.current.uniforms.videoTexture.value = videoTexture
        }
      }
    }
  })

  useEffect(() => {
    if (videoTexture && videoTexture.image) {
      if (isActive && videoTexture.image.paused) {
        videoTexture.image.play().catch(console.warn)
      } else if (!isActive && !videoTexture.image.paused) {
        videoTexture.image.pause()
      }
    }
  }, [isActive, videoTexture])

  if (!material) return null

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main video panel */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[Math.PI / 2, 0, 0]}
      />
      
      {/* Edge glow */}
      <mesh
        ref={glowRef}
        geometry={geometry}
        material={glowMaterial}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.02, 1.02, 1.02]}
      />
    </group>
  )
}

// ============================================================================
// 3. MAIN CYLINDER COMPONENT WITH CAROUSEL LOGIC
// ============================================================================
export default function CurvedVideoCylinder({ videos }) {
  const panelGroupRef = useRef() // Group that rotates (carousel)
  const frameGroupRef = useRef() // Frame stays fixed
  const { activeVideoId, setActiveVideo } = useVideoStore()
  const { viewport, camera, size } = useThree()
  
  const [rotationY, setRotationY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [videoTexture1, setVideoTexture1] = useState(null)
  const [videoTexture2, setVideoTexture2] = useState(null)

  // Find active index
  const activeIndex = videos.findIndex(v => v.id === activeVideoId)
  // Rotate so active video is centered
  const targetRotation = activeIndex === 0 ? 0 : -Math.PI / 2 // -90 degrees for second video

  // ============================================================================
  // 4. MOBILE RESPONSIVENESS SCALING
  // ============================================================================
  const scale = useMemo(() => {
    const maxWidth = viewport.width * 0.90 // 90% of viewport width
    const maxHeight = viewport.height * 0.83 // 83% of viewport height
    
    // Cylinder dimensions
    const cylinderRadius = 1.5
    const cylinderHeight = 2.8
    
    // Calculate scale based on cylinder dimensions
    const widthScale = maxWidth / (cylinderRadius * 2) // Diameter
    const heightScale = maxHeight / cylinderHeight
    
    // Use the smaller scale to fit both dimensions
    let finalScale = Math.min(widthScale, heightScale)
    
    // Scale down further if screen height < 700px
    if (size.height < 700) {
      finalScale *= 0.85
    }
    
    return Math.min(finalScale, 1.2) // Cap at 1.2
  }, [viewport.width, viewport.height, size.height])

  // Panel dimensions (scaled appropriately)
  const panelWidth = 1.2
  const panelHeight = 2.4
  const cylinderRadius = 1.5

  // Mobile-first camera setup
  useEffect(() => {
    camera.fov = 55
    camera.position.set(0, 0, 4.2)
    camera.updateProjectionMatrix()
  }, [camera])

  // ============================================================================
  // 5. CAROUSEL LOGIC (Swipe to rotate)
  // ============================================================================
  // Animate rotation with GSAP
  useEffect(() => {
    if (!panelGroupRef.current) return

    gsap.to(panelGroupRef.current.rotation, {
      y: targetRotation,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        setRotationY(panelGroupRef.current.rotation.y)
      }
    })
  }, [targetRotation, activeIndex])

  // Touch/Mouse handlers
  const handleStart = useCallback((clientX) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
  }, [])

  const handleMove = useCallback((clientX) => {
    if (!panelGroupRef.current) return
    setCurrentX(clientX)
    
    const deltaX = clientX - startX
    const sensitivity = 0.006 // Mobile-optimized
    const dragRotation = targetRotation - (deltaX * sensitivity)
    
    panelGroupRef.current.rotation.y = dragRotation
    setRotationY(dragRotation)
  }, [startX, targetRotation])

  const handleEnd = useCallback(() => {
    if (!panelGroupRef.current) return
    
    const deltaX = currentX - startX
    const threshold = 30
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && activeIndex < videos.length - 1) {
        setActiveVideo(videos[activeIndex + 1].id)
      } else if (deltaX > 0 && activeIndex > 0) {
        setActiveVideo(videos[activeIndex - 1].id)
      } else {
        gsap.to(panelGroupRef.current.rotation, {
          y: targetRotation,
          duration: 0.4,
          ease: 'power2.out'
        })
      }
    } else {
      gsap.to(panelGroupRef.current.rotation, {
        y: targetRotation,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
    
    setIsDragging(false)
  }, [currentX, startX, activeIndex, videos, setActiveVideo, targetRotation])

  // Event listeners
  useEffect(() => {
    if (!isDragging) return

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault()
        handleMove(e.touches[0].clientX)
      }
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      handleEnd()
    }

    const handleMouseMove = (e) => {
      e.preventDefault()
      handleMove(e.clientX)
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      handleEnd()
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMove, handleEnd])

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault()
        handleStart(e.touches[0].clientX)
      }
    }

    const handleMouseDown = (e) => {
      e.preventDefault()
      handleStart(e.clientX)
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleStart])

  return (
    <>
      {/* Environment and lighting */}
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} />
      <pointLight position={[0, 3, 3]} intensity={0.5} color="#ffffff" />
      
      {/* Rim light behind cylinder */}
      <pointLight position={[0, 0, -3]} intensity={0.8} color="#6a5af9" />

      {/* Load video textures */}
      <Suspense fallback={null}>
        <VideoTextureLoader 
          videoSrc={videos[0].videoSrc} 
          onLoad={setVideoTexture1}
        />
        <VideoTextureLoader 
          videoSrc={videos[1].videoSrc} 
          onLoad={setVideoTexture2}
        />
      </Suspense>

      {/* Main group with scaling */}
      <group scale={[scale, scale, scale]}>
        {/* Glass cylinder frame (fixed, doesn't rotate) */}
        <group ref={frameGroupRef}>
          <GlassCylinderFrame radius={cylinderRadius} height={2.8} />
        </group>

        {/* Video panels group (rotates on swipe) */}
        <group ref={panelGroupRef}>
          <Suspense fallback={null}>
            {/* Panel 1: SBMU (centered at 0°) */}
            {videoTexture1 && (
              <CurvedVideoPanel
                videoTexture={videoTexture1}
                isActive={activeIndex === 0}
                position={[0, 0, 0]}
                rotation={0}
                panelWidth={panelWidth}
                panelHeight={panelHeight}
                cylinderRadius={cylinderRadius}
              />
            )}
            
            {/* Panel 2: GSRTC (at 90° to the right) */}
            {videoTexture2 && (
              <CurvedVideoPanel
                videoTexture={videoTexture2}
                isActive={activeIndex === 1}
                position={[0, 0, 0]}
                rotation={Math.PI / 2}
                panelWidth={panelWidth}
                panelHeight={panelHeight}
                cylinderRadius={cylinderRadius}
              />
            )}
          </Suspense>
        </group>

        {/* Floor glow under cylinder */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
          <circleGeometry args={[2.5, 64]} />
          <meshBasicMaterial
            color="#6a5af9"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Drop shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0.1]}>
          <circleGeometry args={[2.8, 64]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Bloom effect */}
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.9} />
      </EffectComposer>
    </>
  )
}

// ============================================================================
// VIDEO TEXTURE LOADER
// ============================================================================
function VideoTextureLoader({ videoSrc, onLoad }) {
  const texture = useVideoTexture(videoSrc, {
    autoplay: false,
    loop: true,
    muted: true,
    playsInline: true,
  })

  useEffect(() => {
    if (texture && onLoad) {
      onLoad(texture)
    }
  }, [texture, onLoad])

  return null
}
