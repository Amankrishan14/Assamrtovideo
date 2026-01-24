# WebAR Interactive Experience - React Three Fiber

A cinematic WebAR-like interactive scene with floating video panels that runs in the browser. Built with React Three Fiber, Drei, and postprocessing effects.

## Features

- 🎥 **Live Camera Background**: Real-time camera feed as the background
- 🎬 **Four Floating Video Panels**: Interactive 3D video panels with smooth animations
- 🎯 **Click to Play**: Only one video plays at a time with smooth transitions
- ✨ **Glassmorphic Design**: Beautiful glass-like panels with neon accents
- 🌈 **Bloom & Glow Effects**: Post-processing effects for a cinematic feel
- 📱 **Mobile Optimized**: Responsive design that works on all devices
- 🎨 **Smooth Animations**: GSAP-powered transitions and floating motion

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Video Files

Place your video files in the `public` directory:
- `public/video1.mp4` - Brand Story
- `public/video2.mp4` - Future Forward
- `public/video3.mp4` - Creative Moment
- `public/video4.mp4` - Campaign Vision

**Note**: Currently using `/video.mp4` for all panels. Update `src/Scene.jsx` to use individual videos.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `https://localhost:3000`

**Important**: HTTPS is required for camera access. The Vite dev server is configured with HTTPS.

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
webar/
├── src/
│   ├── App.jsx              # Main app component with camera setup
│   ├── App.css              # App styles
│   ├── Scene.jsx            # 3D scene with video panels
│   ├── VideoPanel.jsx       # Individual video panel component
│   ├── store.js             # Zustand state management
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/
│   └── videos/              # Video files directory
├── index-react.html         # HTML entry point
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## Key Components

### App.jsx
- Handles camera initialization
- Manages loading states and errors
- Sets up the camera video background

### Scene.jsx
- Creates the 3D scene with React Three Fiber
- Configures lighting and post-processing effects
- Positions four video panels in 3D space

### VideoPanel.jsx
- Individual video panel with:
  - Video texture mapping
  - Floating animations (sin/cos based)
  - Click interaction
  - GSAP-powered scale/opacity transitions
  - Neon border effects
  - Glassmorphic background

### Store.js
- Zustand store for managing active video state
- Simple state management for video playback control

## Customization

### Video Panel Positions

Edit `src/Scene.jsx` to change panel positions:

```javascript
const videoConfigs = [
  {
    id: 1,
    position: [-1.2, 0.6, 0],  // x, y, z coordinates
    videoSrc: '/videos/video1.mp4',
    label: 'Brand Story',
  },
  // ...
]
```

### Panel Labels

Update the `label` property in `videoConfigs` array.

### Colors & Effects

Edit `src/VideoPanel.jsx`:
- Active border color: `#00ffff` (cyan)
- Inactive border color: `#8b5cf6` (violet)
- Emissive intensity values control glow strength

### Animation Speed

In `src/VideoPanel.jsx`, adjust the floating animation:

```javascript
groupRef.current.position.y = position[1] + Math.sin(time * 0.5 + id) * 0.1
// Change 0.5 for speed, 0.1 for amplitude
```

### Bloom Effect

In `src/Scene.jsx`, adjust bloom parameters:

```javascript
<Bloom
  intensity={1.2}              // Glow intensity
  luminanceThreshold={0.6}     // Brightness threshold
  luminanceSmoothing={0.9}     // Smoothness
/>
```

## Browser Requirements

- **Chrome**: Version 90+ (recommended)
- **Safari**: Version 14+ (iOS 14+)
- **Firefox**: Version 88+
- **HTTPS**: Required for camera access
- **WebGL**: Required for 3D rendering

## Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS
- Check browser permissions
- Try refreshing the page

### Videos Not Loading
- Verify video files exist in `public` directory
- Check browser console for CORS errors
- Ensure video format is MP4

### Performance Issues
- Close other browser tabs
- Reduce bloom intensity
- Lower video resolution

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ recommended)

## Technologies Used

- **React 18**: UI framework
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for R3F
- **@react-three/postprocessing**: Post-processing effects
- **Three.js**: 3D graphics library
- **GSAP**: Animation library
- **Zustand**: State management
- **Vite**: Build tool and dev server

## License

This project is open source and available for use.

---

**Note**: This application requires HTTPS to function properly due to camera access requirements. Always test on a secure connection before deployment.

