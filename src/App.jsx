import { useState, useEffect, useRef, useCallback } from 'react'
import Scene from './Scene'
import RenderTest from './RenderTest'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showRenderTest, setShowRenderTest] = useState(false)
  const videoRef = useRef(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('App component mounted')
  }, [])

  const initializeCamera = useCallback(async () => {
    try {
      // Check for secure context
      if (!window.isSecureContext && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('This app requires HTTPS to access the camera.')
        setLoading(false)
        return
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      setCameraStream(stream)

      // Set video source
      if (videoRef.current) {
        console.log('Connecting stream to video element')
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true
        videoRef.current.muted = true
        videoRef.current.style.display = 'block'
        videoRef.current.style.visibility = 'visible'
        videoRef.current.style.opacity = '1'
        
        try {
          await videoRef.current.play()
          console.log('Camera video playing successfully')
        } catch (playErr) {
          console.error('Error playing camera video:', playErr)
        }
      } else {
        console.error('Video ref is null!')
      }

      setLoading(false)
      console.log('Camera initialization complete, loading set to false')
    } catch (err) {
      console.error('Camera initialization error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera access and refresh the page.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and refresh.')
      } else {
        setError(`Camera access failed: ${err.message}. Please refresh and try again.`)
      }
      setLoading(false)
    }
  }, [])

  // Wait for user interaction before requesting camera
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true)
        initializeCamera()
      }
    }

    // Listen for any user interaction
    window.addEventListener('click', handleUserInteraction, { once: true })
    window.addEventListener('touchstart', handleUserInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [userInteracted, initializeCamera])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Toggle render test with '?' key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?') {
        setShowRenderTest(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Ensure video element is visible and connected to stream
  useEffect(() => {
    if (videoRef.current) {
      if (cameraStream) {
        console.log('Setting camera stream to video element')
        videoRef.current.srcObject = cameraStream
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err)
        })
      } else {
        console.log('No camera stream yet, video element ready')
      }
    }
  }, [cameraStream])

  // Force scene container to stay small - override any SDK sizing
  useEffect(() => {
    const enforceSceneSize = () => {
      // Target the scene container div (the one wrapping Scene component)
      const sceneContainer = document.querySelector('.scene-container')
      const canvasOverlay = document.querySelector('.canvas-overlay')
      const canvasElements = document.querySelectorAll('canvas')
      
      // Calculate size based on viewport
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isPortrait = vh > vw
      const isSmall = vw < 480
      
      let targetWidth = '70%'
      let targetHeight = '70%'
      let maxW = '500px'
      let maxH = '750px'
      
      if (!isPortrait) {
        targetWidth = '65%'
        targetHeight = '65%'
        maxW = '700px'
        maxH = '450px'
      } else if (isSmall) {
        targetWidth = '75%'
        targetHeight = '75%'
      }
      
      // Force the scene container size with adjusted vertical centering
      if (sceneContainer) {
        sceneContainer.style.setProperty('width', targetWidth, 'important')
        sceneContainer.style.setProperty('height', targetHeight, 'important')
        sceneContainer.style.setProperty('max-width', maxW, 'important')
        sceneContainer.style.setProperty('max-height', maxH, 'important')
        sceneContainer.style.setProperty('position', 'absolute', 'important')
        sceneContainer.style.setProperty('top', '45%', 'important')
        sceneContainer.style.setProperty('left', '50%', 'important')
        sceneContainer.style.setProperty('transform', 'translate(-50%, -50%)', 'important')
        sceneContainer.style.setProperty('margin', '0', 'important')
        sceneContainer.style.setProperty('padding', '0', 'important')
        sceneContainer.style.setProperty('box-sizing', 'border-box', 'important')
      }
      
      // Also enforce canvas-overlay if it exists
      if (canvasOverlay) {
        canvasOverlay.style.setProperty('width', targetWidth, 'important')
        canvasOverlay.style.setProperty('height', targetHeight, 'important')
        canvasOverlay.style.setProperty('max-width', maxW, 'important')
        canvasOverlay.style.setProperty('max-height', maxH, 'important')
        canvasOverlay.style.setProperty('position', 'absolute', 'important')
        canvasOverlay.style.setProperty('top', '50%', 'important')
        canvasOverlay.style.setProperty('left', '50%', 'important')
        canvasOverlay.style.setProperty('transform', 'translate(-50%, -50%)', 'important')
      }
      
      // Ensure canvas elements don't exceed container
      canvasElements.forEach(canvas => {
        if (canvas.style.width === '100vw' || canvas.style.height === '100vh' || 
            canvas.width === window.innerWidth || canvas.height === window.innerHeight) {
          canvas.style.setProperty('width', '100%', 'important')
          canvas.style.setProperty('height', '100%', 'important')
          canvas.style.setProperty('max-width', '100%', 'important')
          canvas.style.setProperty('max-height', '100%', 'important')
        }
      })
    }

    // Run immediately and on resize
    enforceSceneSize()
    window.addEventListener('resize', enforceSceneSize)
    
    // Use MutationObserver to catch any dynamic changes
    const observer = new MutationObserver(() => {
      enforceSceneSize()
    })
    
    // Observe the document for scene container changes
    const checkAndObserve = () => {
      const sceneContainer = document.querySelector('.scene-container')
      if (sceneContainer) {
        observer.observe(sceneContainer, {
          attributes: true,
          attributeFilter: ['style', 'width', 'height', 'class']
        })
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })
      } else {
        // Retry if container not found yet
        setTimeout(checkAndObserve, 100)
      }
    }
    
    checkAndObserve()
    
    // Also enforce periodically as backup
    const interval = setInterval(enforceSceneSize, 500)
    
    return () => {
      window.removeEventListener('resize', enforceSceneSize)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Show loading screen immediately
  if (loading) {
    return (
      <div style={{ 
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          {!userInteracted ? 'Click anywhere to start' : 'Initializing Camera...'}
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          {!userInteracted 
            ? 'Camera access will be requested on interaction' 
            : 'Please allow camera access to continue'}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  console.log('App render - loading:', loading, 'error:', error, 'hasStream:', !!cameraStream)
  console.log('Scene container should render:', !loading && !error && !showRenderTest)

  return (
    <div className="app-container" style={{ 
      background: '#000',
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      zIndex: 0
    }}>
      {/* Camera background - always render, even if no stream yet */}
      <video
        ref={videoRef}
        className="camera-background"
        autoPlay
        playsInline
        muted
        style={{ 
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          backgroundColor: '#000',
          minWidth: '100%',
          minHeight: '100%'
        }}
        onLoadedMetadata={() => {
          console.log('Camera video metadata loaded')
        }}
        onPlay={() => {
          console.log('Camera video started playing')
        }}
        onError={(e) => {
          console.error('Camera video error:', e)
        }}
      />
      
      {/* Fallback background if camera not ready */}
      {!cameraStream && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          zIndex: -1
        }}></div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-overlay">
          <div className="error-content">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Render Test Mode - toggle with ? key */}
      {showRenderTest && <RenderTest />}

      {/* 3D Scene - render even if camera not ready */}
      {!loading && !error && !showRenderTest && (
        <div 
          className="scene-container"
          style={{ 
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            maxWidth: '500px',
            maxHeight: '750px',
            zIndex: 10,
            pointerEvents: 'auto',
            overflow: 'visible',
            minWidth: '250px',
            minHeight: '400px',
            margin: '0',
            padding: '0'
          }}>
          <Scene />
        </div>
      )}
      
      {/* Debug overlay - hidden for premium look */}
      {false && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          color: 'black',
          padding: '10px',
          zIndex: 10000,
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '5px',
          border: '2px solid #000'
        }}>
          <div>Loading: {loading.toString()}</div>
          <div>Error: {error ? 'Yes' : 'No'}</div>
          <div>Stream: {cameraStream ? 'Yes' : 'No'}</div>
          <div>User Interacted: {userInteracted.toString()}</div>
          <div>Render Test: {showRenderTest ? 'ON' : 'OFF'} (Press '?' to toggle)</div>
          {videoRef.current && (
            <div>Video Ready: {videoRef.current.readyState}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default App

