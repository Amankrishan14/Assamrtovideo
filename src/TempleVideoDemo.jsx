import TempleVideoSwiper from './components/TempleVideoSwiper'

/**
 * Demo page for the Temple Video Swiper
 * 
 * This component demonstrates how to use the TempleVideoSwiper component
 * which automatically loads and displays 6 temple videos in a swipeable carousel.
 * 
 * Features:
 * - Horizontal swipe/slide functionality
 * - Snap to center
 * - Smooth GSAP animations
 * - Autoplay, muted, looping videos
 * - Touch and mouse support
 * - Responsive design
 */
export default function TempleVideoDemo() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 
        TempleVideoSwiper props:
        - autoplay: boolean (default: true) - Auto-play videos
        - showLabels: boolean (default: true) - Show video labels at bottom
      */}
      <TempleVideoSwiper 
        autoplay={true}
        showLabels={true}
      />
    </div>
  )
}

