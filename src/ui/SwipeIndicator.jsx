import { useVideoStore } from '../store'

// Video configurations - must match ArVideoFrame.jsx
const videoConfigs = [
  { 
    id: 1, 
    videoSrc: '/videos/Portal to Pandora.mp4',
    templeName: 'Portal to Pandora'
  },
  { 
    id: 2, 
    videoSrc: '/videos/Through the Valley of Mahadev.mp4',
    templeName: 'Through the Valley of Mahadev'
  }
]

export default function SwipeIndicator() {
  const { activeVideoId } = useVideoStore()
  
  const totalVideos = videoConfigs.length
  const currentIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < totalVideos - 1

  // A video is "visited" if its index is <= currentIndex
  // This means filled dots = current or past videos
  const isVisited = (index) => index <= currentIndex

  // Calculate dots to display
  const getDotsToDisplay = () => {
    if (totalVideos <= 6) {
      // Show all dots
      return videoConfigs.map((video, index) => ({
        id: video.id,
        index,
        isVisited: isVisited(index),
        isCurrent: index === currentIndex
      }))
    } else {
      // Show max 5 dots with adaptive behavior
      const dots = []
      const maxDots = 5
      const centerIndex = Math.floor(maxDots / 2) // 2 (0-indexed)
      
      // Calculate start index to center current video
      let startIndex = Math.max(0, currentIndex - centerIndex)
      let endIndex = Math.min(totalVideos - 1, startIndex + maxDots - 1)
      
      // Adjust if we're near the end
      if (endIndex - startIndex < maxDots - 1) {
        startIndex = Math.max(0, endIndex - maxDots + 1)
      }
      
      // Add ellipsis at start if needed
      if (startIndex > 0) {
        dots.push({ id: 'ellipsis-start', isEllipsis: true })
      }
      
      // Add visible dots
      for (let i = startIndex; i <= endIndex; i++) {
        dots.push({
          id: videoConfigs[i].id,
          index: i,
          isVisited: isVisited(i),
          isCurrent: i === currentIndex
        })
      }
      
      // Add ellipsis at end if needed
      if (endIndex < totalVideos - 1) {
        dots.push({ id: 'ellipsis-end', isEllipsis: true })
      }
      
      return dots
    }
  }

  const dots = getDotsToDisplay()

  return (
    <div className="swipe-indicator">
      {/* Left Arrow */}
      <span 
        className="swipe-arrow swipe-arrow-left"
        style={{ opacity: hasPrevious ? 0.7 : 0.3 }}
      >
        ←
      </span>
      
      {/* Dots */}
      <div className="swipe-dots">
        {dots.map((dot) => {
          if (dot.isEllipsis) {
            return (
              <span key={dot.id} className="swipe-dot-ellipsis">…</span>
            )
          }
          return (
            <span
              key={dot.id}
              className={`swipe-dot ${dot.isCurrent ? 'swipe-dot-current' : ''} ${dot.isVisited ? 'swipe-dot-filled' : 'swipe-dot-unfilled'}`}
            />
          )
        })}
      </div>
      
      {/* Right Arrow */}
      <span 
        className="swipe-arrow swipe-arrow-right"
        style={{ opacity: hasNext ? 0.7 : 0.3 }}
      >
        →
      </span>
      
      <style>{`
        .swipe-indicator {
          position: absolute;
          bottom: calc(10px + 44px + 10px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          z-index: 15;
          pointer-events: none;
          width: 100%;
        }

        .swipe-arrow {
          font-size: 15px;
          color: white;
          opacity: 0.7;
          transition: opacity 150ms linear;
          user-select: none;
          line-height: 1;
        }

        .swipe-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .swipe-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.7);
          transition: all 200ms ease-out;
          flex-shrink: 0;
        }

        .swipe-dot-filled {
          background: white;
          border-color: white;
          opacity: 1;
        }

        .swipe-dot-unfilled {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.7);
          opacity: 0.7;
        }

        .swipe-dot-current {
          width: 8.4px;
          height: 8.4px;
          transform: scale(1.2);
        }

        .swipe-dot-ellipsis {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          line-height: 1;
          padding: 0 2px;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .swipe-indicator {
            bottom: calc(10px + 42px + 10px);
          }
          
          .swipe-arrow {
            font-size: 14px;
          }
          
          .swipe-dot {
            width: 6px;
            height: 6px;
          }
          
          .swipe-dot-current {
            width: 7.2px;
            height: 7.2px;
          }
        }
      `}</style>
    </div>
  )
}

