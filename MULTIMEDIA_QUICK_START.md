# Quick Start Guide - Advanced Multimedia Recording System

## 🚀 Getting Started in 5 Minutes

### Prerequisites

- React application with modern browser support
- Node.js 14+
- HTTPS enabled (required for getUserMedia API)
- Framer Motion library installed

### Installation

1. **Copy Services**

```bash
# Already included in client/src/services/:
# - mediaStreamManager.js
# - geolocationTracker.js
# - permissionOrchestrator.js
# - liveStreamingService.js
```

2. **Copy Components**

```bash
# Already included in client/src/components/:
# - MediaDashboard.jsx
# - LiveVideoFeed.jsx
# - PermissionDialog.jsx
# - RecordingIndicator.jsx
# - LiveMapIntegration.jsx
# - StreamHealth.jsx

# With CSS files:
# - MediaDashboard.css
# - LiveVideoFeed.css
# - PermissionDialog.css
# - RecordingIndicator.css
# - LiveMapIntegration.css
# - StreamHealth.css
```

### Basic Usage

#### 1. Add to Your Router

```jsx
import MediaDashboard from './components/MediaDashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/media" element={<MediaDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 2. Add Navigation Link

```jsx
<Link to="/media">
  <span>🎬</span>
  Media Recording
</Link>
```

#### 3. Use in Your App

Simply navigate to `/media` and start recording!

### First Recording

1. **Open Media Dashboard**
   - Navigate to `/media` route
   - System initializes all services
   - Permissions dialog appears

2. **Request Permissions**
   - Click "Allow" on permission dialog
   - Camera and microphone access granted
   - Location tracking starts

3. **Start Recording**
   - Click red "Start Recording" button
   - Video feed appears
   - Recording timer starts
   - Location tracking begins

4. **Control Recording**
   - Use "Switch Camera" to toggle front/rear
   - Adjust "Streaming Quality" dropdown
   - View live location on map
   - Monitor stream health

5. **Stop Recording**
   - Click green "Stop Recording" button
   - Data is saved locally
   - Location history is preserved
   - Stats are displayed

---

## 🎯 Common Use Cases

### Emergency Response Recording

```jsx
import MediaDashboard from './components/MediaDashboard';

function EmergencyResponse() {
  const [sessionId, setSessionId] = useState(null);

  const handleSessionStart = (id) => {
    setSessionId(id);
    // Alert emergency contacts
    // Send notification to nearby responders
  };

  return (
    <div>
      <h2>Emergency Response - Live Recording</h2>
      <MediaDashboard 
        onSessionStart={handleSessionStart}
        onSessionEnd={(id, metadata) => {
          // Process recorded session
          // Upload to evidence system
        }}
      />
      {sessionId && (
        <div>Recording Session: {sessionId}</div>
      )}
    </div>
  );
}
```

### Incident Documentation

```jsx
function IncidentReport() {
  const handleError = (error) => {
    // Log error to incident report
    console.error('Recording error:', error);
  };

  return (
    <div className="incident-documentation">
      <h2>Incident Documentation</h2>
      <MediaDashboard onError={handleError} />
    </div>
  );
}
```

### Compliance Recording

```jsx
function ComplianceRecording() {
  const [recordingMetadata, setRecordingMetadata] = useState({
    purpose: 'compliance',
    authority: 'emergency_response',
    timestamp: new Date()
  });

  return (
    <div className="compliance-recording">
      <h2>Compliance Recording - For Official Use</h2>
      <MediaDashboard />
    </div>
  );
}
```

---

## 🎨 Customization

### Custom Permissions Message

```javascript
// In permissionOrchestrator.js
const PERMISSION_EXPLANATIONS = {
  camera: "Your custom message about camera access",
  microphone: "Your custom message about microphone access",
  location: "Your custom message about location access",
  notifications: "Your custom message about notifications"
};
```

### Custom Styling

```css
/* Override in your CSS */
:root {
  --omina-primary: #dc2626;      /* Red */
  --omina-secondary: #2563eb;    /* Blue */
  --omina-success: #16a34a;      /* Green */
  --omina-warning: #ea580c;      /* Orange */
}

.media-dashboard {
  background: linear-gradient(135deg, var(--omina-primary) 0%, var(--omina-secondary) 100%);
}
```

### Custom Recording Options

```javascript
// In MediaDashboard.jsx
const startRecording = async () => {
  const cameraStream = await mediaStreamManager.requestStream(
    `camera-${newSessionId}`,
    {
      audio: true,
      video: true,
      facing: CAMERA_FACING.USER,
      quality: 'high'  // Change default quality
    }
  );
};
```

---

## 🔧 API Examples

### Direct Service Usage

```javascript
import { mediaStreamManager } from './services/mediaStreamManager';
import { geolocationTracker } from './services/geolocationTracker';

// Get available cameras
const cameras = mediaStreamManager.getAvailableCameras();

// Start custom recording
const stream = await mediaStreamManager.requestStream('my-stream', {
  audio: true,
  video: { width: { ideal: 1920 }, height: { ideal: 1080 } }
});

// Track location
await geolocationTracker.startTracking({ enableHigh: true });

// Get current location
const location = geolocationTracker.getCurrentLocation();
console.log(`User at: ${location.latitude}, ${location.longitude}`);

// Export location data
const geojson = geolocationTracker.exportLocationData('geojson');
```

### Permission Management

```javascript
import { permissionOrchestrator, PERMISSION_STATUS } from './services/permissionOrchestrator';

// Check specific permission
const cameraStatus = permissionOrchestrator.getPermissionStatus('camera');

if (cameraStatus === PERMISSION_STATUS.GRANTED) {
  // Camera available
} else if (cameraStatus === PERMISSION_STATUS.DENIED) {
  // Show instructions for enabling
} else {
  // Prompt user
}

// Request multiple permissions
const perms = await permissionOrchestrator.requestAllPermissions();
```

### Stream Health Monitoring

```javascript
import { liveStreamingService } from './services/liveStreamingService';

liveStreamingService.onStatsUpdate((stats) => {
  console.log(`Bitrate: ${stats.averageBitrate} Mbps`);
  console.log(`Chunks: ${stats.chunks}`);
  console.log(`Quality: ${stats.quality}`);
});
```

---

## 🌐 Browser Testing

### Enable in Different Browsers

**Chrome/Edge:**
1. Navigate to `chrome://flags` or `edge://flags`
2. Search for "insecure origins"
3. Enable for localhost testing

**Firefox:**
1. Navigate to `about:config`
2. Set `media.getusermedia.insecure.enabled` to `true`
3. For localhost URLs

**Safari (macOS):**
1. Develop → Experimental Features → getUserMedia over HTTP
2. Only works on secure contexts in production

### Test with HTTPS

```bash
# Local development with self-signed cert
npm run dev -- --host --ssl

# Or use: https://localhost:5173
```

---

## 📊 Monitoring & Debugging

### Enable Debug Logging

```javascript
// In browser console
localStorage.setItem('DEBUG_MEDIA', '*');
// Reload page to see detailed logs
```

### Check Browser Support

```javascript
// In console
console.log({
  webCodecs: !!window.VideoEncoder,
  webRTC: !!navigator.mediaDevices,
  geolocation: !!navigator.geolocation,
  indexed DB: !!window.indexedDB,
  serviceWorkers: !!navigator.serviceWorker
});
```

### Monitor Performance

```javascript
// Stream stats
const stats = liveStreamingService.getStreamingStats();
console.table(stats);

// Media stream info
const streams = mediaStreamManager.getAllStreams();
console.table(streams.map(s => ({
  id: s.id,
  status: s.status,
  videos: s.tracks.video.length,
  audios: s.tracks.audio.length
})));

// Location tracking
const locStats = geolocationTracker.getLocationStats();
console.table(locStats);
```

---

## 🚨 Error Handling

### Try Catch Pattern

```jsx
try {
  const stream = await mediaStreamManager.requestStream('camera-1', {
    audio: true,
    video: true
  });
  
  // Use stream...
  
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User denied permission
    showPermissionError();
  } else if (error.name === 'NotFoundError') {
    // No camera found
    showNoCameraError();
  } else if (error.name === 'NotReadableError') {
    // Camera in use
    showCameraInUseError();
  } else {
    // Other error
    showUnknownError(error);
  }
}
```

### Error Event Handlers

```javascript
mediaStreamManager.onError(({message, error, timestamp}) => {
  console.error(`[${timestamp}] ${message}:`, error);
  // Update UI with error state
});

geolocationTracker.onError(({message, error, timestamp}) => {
  console.error(`[${timestamp}] ${message}:`, error);
  // Fallback to IP-based location
});

liveStreamingService.onError(({message, error, timestamp}) => {
  console.error(`[${timestamp}] ${message}:`, error);
  // Attempt retry or quality reduction
});
```

---

## 📱 Mobile Considerations

### Mobile Permissions

**iOS:**
- Permissions requested on first use
- Settings > Privacy for manual changes
- Limited concurrent camera access

**Android:**
- Permissions requested on first use
- Settings > Apps > Permissions
- Better multi-camera support

### Responsive Design

Component automatically responsive:
- Optimized for screens 320px+
- Touch-friendly buttons (48px minimum)
- Adaptive video sizing
- Mobile-first CSS breakpoints

### Low Bandwidth Mode

```javascript
// Auto-detect and adapt
if (navigator.connection?.effectiveType === '2g') {
  setStreamQuality(STREAM_QUALITY.LOW);
}
```

---

## 🔒 Security Checklist

- [ ] HTTPS enabled (required)
- [ ] Permissions clearly explained
- [ ] User can see recording indicator
- [ ] User can stop recording anytime
- [ ] Data encrypted in transit
- [ ] Data stored securely
- [ ] No background recording
- [ ] Session timeout implemented
- [ ] Audit logs enabled
- [ ] GDPR/CCPA compliant

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Something went wrong" on load | Check browser console for errors, enable debug mode |
| Camera permission keeps failing | Try incognito mode, check HTTPS, restart browser |
| No location tracking | Enable location permission, check GPS hardware |
| Poor video quality | Check network speed, reduce quality setting, close other apps |
| Recording won't start | Check all permissions granted, verify camera not in use |
| Map not loading | Enable JavaScript, check internet connection, try refreshing |

---

## 📚 Learn More

- [Full API Reference](./ADVANCED_MULTIMEDIA_SYSTEM.md)
- [Architecture & Design](./ADVANCED_MULTIMEDIA_SYSTEM.md#architecture)
- [Browser Compatibility](./ADVANCED_MULTIMEDIA_SYSTEM.md#browser-compatibility)
- [Security & Privacy](./ADVANCED_MULTIMEDIA_SYSTEM.md#security--privacy)

---

## 🎉 Ready to Go!

You now have a production-ready multimedia recording system. Start building amazing emergency response features!

**Questions?** Check the full documentation or enable debug mode.

**Ready to deploy?** Ensure HTTPS, test on target devices, and configure backend API endpoints.

---

**Happy recording!** 🎬📍🔴
