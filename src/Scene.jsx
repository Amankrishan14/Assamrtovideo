import { useState, useEffect } from 'react'
import ArVideoFrame from './ui/ArVideoFrame'
import './ui/styles.css'
import './ui/frame-wrapper.css'

export default function Scene() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* DOM-based UI Overlay */}
      <div 
        className="ar-ui-layer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 3,
          pointerEvents: "none",
          overflow: "visible"
        }}
      >
        {/* Frame Wrapper - contains canvas */}
        <div className="frame-wrapper">
          {/* Canvas Holder - contains the video card with banner and button */}
          <div className="canvas-holder">
            <ArVideoFrame onVideoPlaying={() => setVideoPlaying(true)} />
          </div>
        </div>
      </div>
    </>
  )
}

