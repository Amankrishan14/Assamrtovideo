# WebAR Video Experience

A complete WebAR experience built with the Blippar WebAR SDK that displays a floating video plane in the camera feed. Optimized for mobile browsers with HTTPS support.

## Features

- 🎥 **Floating Video Plane**: Your video.mp4 plays as a floating AR plane in the camera feed
- 📱 **Mobile Optimized**: Works smoothly on Chrome and Safari mobile browsers
- 🔒 **HTTPS Required**: Secure camera access with automatic permission requests
- 🎬 **Auto-play Video**: Video starts automatically and loops continuously
- 📐 **Responsive Design**: Adapts to different screen orientations and sizes
- ⚡ **Performance Optimized**: 30 FPS limit and mobile-specific optimizations

## Quick Start

### 1. Local Development

1. **Start a local HTTPS server** (required for camera access):
   ```bash
   # Using Python 3
   python -m http.server 8000 --bind 127.0.0.1
   
   # Or using Node.js (if you have http-server installed)
   npx http-server -S -C cert.pem -K key.pem -p 8000
   
   # Or using PHP
   php -S 127.0.0.1:8000
   ```

2. **Access the application**:
   - Open your browser and go to `https://localhost:8000`
   - Accept the security warning (self-signed certificate)
   - Allow camera access when prompted

### 2. Production Deployment

1. **Deploy to HTTPS server**:
   - Upload all files to your HTTPS-enabled web server
   - Ensure `video.mp4` is accessible
   - Test camera permissions work correctly

2. **Generate QR Code** (optional):
   - Use any QR code generator to create a QR code pointing to your HTTPS URL
   - Users can scan the QR code to access the AR experience

## File Structure

```
webar/
├── index.html              # Main HTML file with UI and styling
├── app.js                  # JavaScript application logic
├── video.mp4               # Your video file (replace with your own)
├── webar-sdk/              # Blippar WebAR SDK files
│   ├── webar-sdk-v2.0.8.min.js
│   └── libs/
└── README.md               # This file
```

## Code Structure

### HTML (index.html)
- **Loading Overlay**: Shows "Initializing AR..." with spinner
- **Permission Prompt**: Requests camera access with user-friendly UI
- **Error Handling**: Displays error messages with clear instructions
- **Mobile Optimizations**: Viewport meta tags and mobile-specific styling

### JavaScript (app.js)
- **WebARVideoApp Class**: Main application controller
- **SDK Initialization**: Sets up Blippar WebAR SDK with proper configuration
- **Camera Setup**: Handles camera permissions and rear camera selection
- **Video Texture Rendering**: Creates floating video plane in AR space
- **Performance Optimizations**: Mobile-specific optimizations and error handling

## Key Components

### 1. SDK Initialization
```javascript
// Configure WebAR SDK options
const sdkOptions = {
    camera: {
        enable: true,
        facingMode: 'environment' // Use rear camera
    },
    performance: {
        enableStats: false,
        maxFPS: 30 // Mobile optimization
    },
    tracking: {
        enable: true,
        type: 'world' // World tracking for floating video
    }
};
```

### 2. Camera Setup
```javascript
// Request camera access with rear camera preference
const stream = await navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment', // Rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }
});
```

### 3. AR Scene Creation
```javascript
// Create plane geometry for video (16:9 aspect ratio)
const planeGeometry = new WEBARSDK.PlaneGeometry(2, 1.125);

// Create material with video texture
const planeMaterial = new WEBARSDK.MeshBasicMaterial({
    map: this.videoTexture,
    transparent: true,
    side: WEBARSDK.DoubleSide
});

// Create and position mesh
this.videoPlane = new WEBARSDK.Mesh(planeGeometry, planeMaterial);
this.videoPlane.position.set(0, 0, -2); // 2 units in front of camera
```

### 4. Video Texture Rendering
```javascript
// Create video element with mobile optimizations
this.videoElement = document.createElement('video');
this.videoElement.src = 'video.mp4';
this.videoElement.loop = true;
this.videoElement.muted = true; // Required for autoplay
this.videoElement.playsInline = true; // Prevent fullscreen on mobile

// Create video texture
this.videoTexture = new WEBARSDK.VideoTexture(this.videoElement);
```

## Mobile Optimizations

### Performance
- **30 FPS Limit**: Prevents battery drain on mobile devices
- **Stats Disabled**: Removes performance monitoring overhead
- **Video Optimization**: Muted autoplay with inline playback

### User Experience
- **Loading States**: Clear feedback during initialization
- **Permission Handling**: User-friendly camera permission requests
- **Orientation Support**: Handles device rotation gracefully
- **Background Handling**: Pauses video when app goes to background

### Browser Compatibility
- **Chrome Mobile**: Full support with camera access
- **Safari Mobile**: Full support with camera access
- **HTTPS Required**: Secure context for camera permissions

## Troubleshooting

### Common Issues

1. **"Camera access denied"**
   - Ensure you're using HTTPS
   - Check browser permissions in settings
   - Try refreshing the page

2. **"Video not playing"**
   - Ensure video.mp4 exists and is accessible
   - Check video format compatibility (MP4 recommended)
   - Verify video is not corrupted

3. **"AR not working"**
   - Check browser console for errors
   - Ensure WebAR SDK loaded correctly
   - Verify camera permissions are granted

4. **"Poor performance"**
   - Close other browser tabs
   - Ensure good lighting conditions
   - Check device compatibility

### Browser Requirements
- **Chrome**: Version 80+ (recommended)
- **Safari**: Version 13+ (iOS 13+)
- **HTTPS**: Required for camera access
- **WebGL**: Required for 3D rendering

## Customization

### Video Replacement
1. Replace `video.mp4` with your own video file
2. Ensure video is MP4 format for best compatibility
3. Recommended resolution: 1280x720 or 1920x1080

### Styling Changes
- Modify CSS in `index.html` for different colors/themes
- Adjust loading overlay text and styling
- Customize permission prompt appearance

### AR Plane Adjustments
- Change plane size: `new WEBARSDK.PlaneGeometry(width, height)`
- Adjust position: `this.videoPlane.position.set(x, y, z)`
- Modify material properties for different effects

## License

This project uses the Blippar WebAR SDK v2.0.8 under commercial license. Please refer to the SDK license terms for usage restrictions.

## Support

For issues related to:
- **WebAR SDK**: Contact Blippar support
- **Browser compatibility**: Check browser documentation
- **HTTPS setup**: Refer to your hosting provider's documentation

---

**Note**: This application requires HTTPS to function properly due to camera access requirements. Always test on a secure connection before deployment.
