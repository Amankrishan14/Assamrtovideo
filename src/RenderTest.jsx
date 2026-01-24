import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

// Simple rotating cube to test rendering
function TestCube() {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

// Test scene with lighting
function TestScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <TestCube />
      <gridHelper args={[10, 10]} />
    </>
  )
}

// Render test component
export default function RenderTest() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      zIndex: 99999
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        zIndex: 100000,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h3>3D Rendering Test</h3>
        <p>You should see a rotating pink cube</p>
        <p>If you see it, React Three Fiber is working!</p>
      </div>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
        style={{
          touchAction: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
        onCreated={(state) => {
          console.log('✅ Test Canvas created:', state)
          console.log('✅ WebGL Renderer:', state.gl)
          console.log('✅ WebGL Version:', state.gl.getParameter(state.gl.VERSION))
          console.log('✅ WebGL Vendor:', state.gl.getParameter(state.gl.VENDOR))
        }}
        onError={(error) => {
          console.error('❌ Canvas error:', error)
        }}
      >
        <TestScene />
      </Canvas>
    </div>
  )
}





