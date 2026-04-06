# Advanced Multimedia Recording & Tracking System
## Complete Implementation Guide for OMINA Platform

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Services](#services)
5. [Integration Guide](#integration-guide)
6. [API Reference](#api-reference)
7. [Browser Compatibility](#browser-compatibility)
8. [Security & Privacy](#security--privacy)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Features

✅ **Multi-Camera Support**
- Front and rear camera access where hardware permits
- Concurrent recording from multiple cameras
- Seamless camera switching during recording
- Device-aware quality adaptation

✅ **Real-Time Geolocation Tracking**
- GPS positioning with high accuracy
- WiFi and network-based positioning fallbacks
- Location history tracking and analytics
- Distance calculation and route mapping

✅ **Advanced Permission Management**
- Transparent, user-friendly permission requests
- Dynamic permission state handling
- Graceful fallbacks for denied permissions
- Browser-specific handling

✅ **Live Streaming & Encoding**
- Real-time MediaRecorder with chunking
- Adaptive bitrate based on network conditions
- Multiple quality levels (360p-1080p)
- Sub-second chunk transmission

✅ **Responsive Live Dashboard**
- Live video feed display
- Real-time location map integration
- Stream health monitoring
- Recording status indicators

✅ **Cross-Browser Support**
- Chrome/Chromium ✅
- Firefox ✅
- Edge ✅
- Safari (limited)
- Mobile browsers ✅

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Dashboard                    │
│         (MediaDashboard, RecordingIndicator)        │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────┐
    │                         │              │
┌───▼──────────────┐  ┌──────▼──────────┐   │
│ Media Streams    │  │ Geolocation     │   │
│ Manager          │  │ Tracker         │   │
└───┬──────────────┘  └──────┬──────────┘   │
    │                        │              │
┌───▼────────────────────────▼──────────┐   │
│    Permission Orchestrator            │   │
└───┬────────────────────────────────────┘   │
    │                                        │
┌───▼────────────┬───────────────────────┐  │
│ Live Streaming │ Offline Storage       │  │
│ Service        │ (IndexedDB)           │  │
└───┬────────────┴───────────────────────┘  │
    │                                       │
┌───▼────────────────────────────────────┐  │
│ API Client & Cloud Transmission        │  │
└────────────────────────────────────────┘  │
```

### Data Flow

1. **Initialization**
   - User opens MediaDashboard
   - System initializes all services
   - Permissions are checked/requested
   - Device capabilities are detected

2. **Recording Started**
   - Media streams are requested
   - MediaRecorder begins capturing
   - Geolocation tracking activates
   - Live streaming begins

3. **Real-Time Processing**
   - Streams generate 1-second chunks
   - Chunks are processed and encoded
   - Stats are collected and displayed
   - Location updates are tracked

4. **Upload & Sync**
   - Chunks are uploaded to server
   - Offline chunks queued in IndexedDB
   - Auto-sync when connection restored
   - Metadata is collected and stored

---

## Components

### MediaDashboard.jsx

**Main orchestration component for the entire recording system.**

```jsx
<MediaDashboard 
  onSessionStart={(sessionId) => {}}
  onSessionEnd={(sessionId, metadata) => {}}
  onError={(error) => {}}
/>
```

**Features:**
- Manages all service initialization
- Coordinates permission requests
- Displays live video feeds
- Shows location map
- Monitors streaming health
- Provides control buttons

**Props:**
```typescript
interface MediaDashboardProps {
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string, metadata: any) => void;
  onError?: (error: Error) => void;
}
```

### LiveVideoFeed.jsx

**Renders live video stream from a specific media stream.**

```jsx
<LiveVideoFeed 
  streamId="camera-front-123456"
  label="Front Camera"
  onError={(error) => console.error(error)}
  autoplay
/>
```

**Features:**
- Fullscreen mode
- Screenshot capture
- Playback controls
- Error handling
- Accessibility compliance

### PermissionDialog.jsx

**Clear permission request UI with explanation.**

```jsx
<PermissionDialog
  isOpen={true}
  permissionType={PERMISSION_TYPES.CAMERA}
  onGranted={() => startRecording()}
  onDenied={() => {}}
/>
```

**Permission Types:**
- `PERMISSION_TYPES.CAMERA`
- `PERMISSION_TYPES.MICROPHONE`
- `PERMISSION_TYPES.LOCATION`
- `PERMISSION_TYPES.NOTIFICATIONS`

### RecordingIndicator.jsx

**Persistent recording status indicator.**

```jsx
<RecordingIndicator
  isRecording={true}
  recordingTime={150}
  formatTime={(s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`}
  sessionId="session-1234567890"
/>
```

### LiveMapIntegration.jsx

**Real-time location map with tracking visualization.**

```jsx
<LiveMapIntegration
  currentLocation={{latitude: 40.7128, longitude: -74.0060, accuracy: 5}}
  locationHistory={[...]}
  onClose={() => setShowMap(false)}
  zoom={16}
/>
```

**Supports:**
- Leaflet maps (with OpenStreetMap)
- Canvas-based fallback maps
- Location trail visualization
- Distance calculations

### StreamHealth.jsx

**Real-time monitoring of stream quality and network conditions.**

```jsx
<StreamHealth
  stats={{
    averageBitrate: 2.5,
    chunks: 150,
    totalBytes: 46875000,
    elapsed: 60,
    quality: 'medium'
  }}
/>
```

---

## Services

### mediaStreamManager.js

**Manages all media stream acquisition and control.**

#### Key Functions

```javascript
// Initialize and detect capabilities
await mediaStreamManager.initialize();

// Request single camera stream
const streamData = await mediaStreamManager.requestStream('camera-1', {
  audio: true,
  video: true,
  facing: CAMERA_FACING.USER,
  quality: 'medium'
});

// Request concurrent cameras (front and rear)
const streams = await mediaStreamManager.requestConcurrentCameras();

// Switch camera mid-stream
await mediaStreamManager.switchCamera('camera-1', CAMERA_FACING.ENVIRONMENT);

// Pause stream
await mediaStreamManager.pauseStream('camera-1');

// Resume stream
await mediaStreamManager.resumeStream('camera-1');

// Stop stream
await mediaStreamManager.stopStream('camera-1');

// Stop all streams
await mediaStreamManager.stopAllStreams();

// Get stream data
const streamData = mediaStreamManager.getStream('camera-1');

// Get all active streams
const streams = mediaStreamManager.getAllStreams();

// Get stream statistics
const stats = mediaStreamManager.getStreamStats('camera-1');
// Returns: {streamId, status, audioTracks, videoTracks, quality, facing, uptime, resolution}

// Get browser capabilities
const capabilities = mediaStreamManager.browserCapabilities;
// Returns: {browser, supportsWebCodecs, supportsWebRTC, maxVideoStreams, ...}
```

#### Event Handlers

```javascript
// Listen to stream status changes
mediaStreamManager.onStatusChange(({streamId, status, timestamp}) => {
  console.log(`Stream ${streamId} is now ${status}`);
});

// Listen to errors
mediaStreamManager.onError(({message, error, timestamp}) => {
  console.error(message, error);
});
```

### geolocationTracker.js

**Continuous location tracking with history and analytics.**

#### Key Functions

```javascript
// Start tracking
await geolocationTracker.startTracking({
  enableHigh: true,
  timeout: 10000,
  maximumAge: 0,
  updateInterval: 2000
});

// Get current location
const location = geolocationTracker.getCurrentLocation();
// Returns: {latitude, longitude, accuracy, altitude, heading, speed, method, timestamp}

// Get location history
const history = geolocationTracker.getLocationHistory(limit = 100);

// Get history for specific time range
const filtered = geolocationTracker.getLocationHistoryByTimeRange(startTime, endTime);

// Pause tracking
geolocationTracker.pauseTracking();

// Resume tracking
await geolocationTracker.resumeTracking();

// Stop tracking
geolocationTracker.stopTracking();

// Calculate distance between two points
const distance = geolocationTracker.calculateDistance(loc1, loc2); // Returns km

// Get statistics
const stats = geolocationTracker.getLocationStats();
// Returns: {totalDistance, averageAccuracy, averageSpeed, pointsRecorded, ...}

// Export data
const geojson = geolocationTracker.exportLocationData('geojson');
const csv = geolocationTracker.exportLocationData('csv');
const raw = geolocationTracker.exportLocationData('raw');

// Clear history
geolocationTracker.clearHistory();

// Get tracking status
const status = geolocationTracker.getStatus();
```

#### Event Handlers

```javascript
// Location update
geolocationTracker.onLocationUpdate((location) => {
  console.log(`New location: ${location.latitude}, ${location.longitude}`);
});

// Status change
geolocationTracker.onStatusChange(({status, timestamp}) => {
  console.log(`Tracking status: ${status}`);
});

// Error
geolocationTracker.onError(({message, error, timestamp}) => {
  console.error(message);
});
```

### permissionOrchestrator.js

**Unified permission management for all device resources.**

#### Key Functions

```javascript
// Initialize
await permissionOrchestrator.initialize();

// Request specific permissions
const status = await permissionOrchestrator.requestCamera();
const status = await permissionOrchestrator.requestMicrophone();
const status = await permissionOrchestrator.requestLocation();
const status = await permissionOrchestrator.requestNotifications();

// Request all at once
const all = await permissionOrchestrator.requestAllPermissions();
// Returns: {camera: status, microphone: status, location: status, notifications: status}

// Get permission status
const cameraStatus = permissionOrchestrator.getPermissionStatus(PERMISSION_TYPES.CAMERA);
const all = permissionOrchestrator.getPermissionStatus();

// Check if all required permissions granted
const ready = permissionOrchestrator.areAllPermissionsGranted();

// Get recording permissions
const recordingPerms = permissionOrchestrator.getRecordingPermissionsStatus();

// Get permission explanation
const explanation = permissionOrchestrator.getPermissionExplanation(PERMISSION_TYPES.CAMERA);

// Check if can re-request
const canRequest = permissionOrchestrator.canRequestPermission(PERMISSION_TYPES.CAMERA);

// Get denial history
const denial = permissionOrchestrator.getDenialHistory(PERMISSION_TYPES.CAMERA);

// Get fallback options
const fallbacks = permissionOrchestrator.getFallbackOptions(PERMISSION_TYPES.CAMERA);
```

#### Permission Status Constants

```javascript
PERMISSION_STATUS.GRANTED    // 'granted'
PERMISSION_STATUS.DENIED     // 'denied'
PERMISSION_STATUS.PROMPT     // 'prompt'
PERMISSION_STATUS.UNAVAILABLE // 'unavailable'
```

### liveStreamingService.js

**Real-time encoding and streaming of multimedia data.**

#### Key Functions

```javascript
// Start streaming
await liveStreamingService.startStreaming(mediaStream, {
  quality: STREAM_QUALITY.MEDIUM,
  mimeType: 'video/webm;codecs=vp9,opus',
  onChunk: (chunk) => {
    // Handle each chunk
    console.log(`Received chunk: ${chunk.size} bytes`);
  },
  onStats: (stats) => {
    // Handle stats update
    console.log(`Bitrate: ${stats.averageBitrate} Mbps`);
  }
});

// Change quality mid-stream
await liveStreamingService.changeQuality(STREAM_QUALITY.HIGH);

// Pause streaming
liveStreamingService.pauseStreaming();

// Resume streaming
liveStreamingService.resumeStreaming();

// Stop streaming and get result
const result = liveStreamingService.stopStreaming();
// Returns: {success, data, chunks, size, duration, quality}

// Get current stats
const stats = liveStreamingService.getStreamingStats();

// Get browser capabilities
const capabilities = liveStreamingService.getCapabilities();

// Export data
const blob = liveStreamingService.exportData('blob');
const url = liveStreamingService.exportData('url');
const dataUrl = await liveStreamingService.exportData('dataurl');

// Get chunks
const chunks = liveStreamingService.getChunks();

// Clear chunks
liveStreamingService.clearChunks();
```

#### Quality Constants

```javascript
STREAM_QUALITY.LOW      // 360p, 500 kbps video, 64 kbps audio
STREAM_QUALITY.MEDIUM   // 720p, 2.5 Mbps video, 128 kbps audio
STREAM_QUALITY.HIGH     // 1080p, 5 Mbps video, 256 kbps audio
STREAM_QUALITY.ADAPTIVE // Auto-adjust based on bandwidth
```

---

## Integration Guide

### Step 1: Add Routes

Update your router configuration:

```jsx
// client/src/App.jsx
import MediaDashboard from './components/MediaDashboard';

function App() {
  return (
    <Routes>
      {/* ...existing routes... */}
      <Route path="/media" element={<MediaDashboard />} />
    </Routes>
  );
}
```

### Step 2: Add to Navigation

Update your navigation component:

```jsx
// client/src/components/AppShell.jsx
const links = [
  { to: "/", label: "Home", eLabel: "HQ" },
  { to: "/emergency", label: "Emergency", eLabel: "ALERT" },
  { to: "/media", label: "Media", eLabel: "REC" },  // Add this
  // ...existing links...
];
```

### Step 3: Backend Integration

Create API endpoints to receive chunks:

```javascript
// server/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();

// Receive video chunk
router.post('/chunks', async (req, res) => {
  try {
    const { sessionId, chunkIndex, data } = req.body;
    
    // Store chunk (Firebase, S3, or local storage)
    await storeChunk(sessionId, chunkIndex, Buffer.from(data, 'base64'));
    
    res.json({ 
      success: true, 
      message: 'Chunk stored',
      chunkIndex 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session metadata
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await getSessionMetadata(req.params.sessionId);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Step 4: Service Worker for Offline Support

Create a service worker for offline caching:

```javascript
// client/public/sw.js
self.addEventListener('sync', event => {
  if (event.tag === 'sync-media-chunks') {
    event.waitUntil(syncPendingChunks());
  }
});

async function syncPendingChunks() {
  // Retrieve pending chunks from IndexedDB
  // Upload to server when connection restored
}
```

---

## API Reference

### MediaStreamManager

**Enum: CAMERA_FACING**
```javascript
CAMERA_FACING.USER        // 'user' - Front camera
CAMERA_FACING.ENVIRONMENT // 'environment' - Rear camera
CAMERA_FACING.ALL         // 'all' - Both cameras
```

**Enum: STREAM_STATUS**
```javascript
STREAM_STATUS.INITIALIZED
STREAM_STATUS.ACTIVE
STREAM_STATUS.PAUSED
STREAM_STATUS.ERROR
STREAM_STATUS.STOPPED
```

**Enum: MEDIA_CONSTRAINTS**
```javascript
MEDIA_CONSTRAINTS.audio         // Audio constraints
MEDIA_CONSTRAINTS.videoHigh     // 1920x1080@30fps
MEDIA_CONSTRAINTS.videoMedium   // 1280x720@24fps
MEDIA_CONSTRAINTS.videoLow      // 640x480@15fps
```

### GeolocationTracker

**Enum: LOCATION_METHOD**
```javascript
LOCATION_METHOD.GPS      // GPS positioning
LOCATION_METHOD.WIFI     // WiFi-based positioning
LOCATION_METHOD.NETWORK  // Network-based positioning
LOCATION_METHOD.COMBINED // Combined methods
```

**Enum: LOCATION_ACCURACY**
```javascript
LOCATION_ACCURACY.HIGH   // < 5m
LOCATION_ACCURACY.MEDIUM // 5-50m
LOCATION_ACCURACY.LOW    // > 50m
```

**Enum: TRACKING_STATUS**
```javascript
TRACKING_STATUS.INITIALIZING
TRACKING_STATUS.TRACKING
TRACKING_STATUS.PAUSED
TRACKING_STATUS.ERROR
TRACKING_STATUS.STOPPED
```

### PermissionOrchestrator

**Enum: PERMISSION_STATUS**
```javascript
PERMISSION_STATUS.PROMPT      // 'prompt' - Not yet requested
PERMISSION_STATUS.GRANTED     // 'granted' - User approved
PERMISSION_STATUS.DENIED      // 'denied' - User rejected
PERMISSION_STATUS.UNAVAILABLE // 'unavailable' - Not supported
```

**Enum: PERMISSION_TYPES**
```javascript
PERMISSION_TYPES.CAMERA
PERMISSION_TYPES.MICROPHONE
PERMISSION_TYPES.LOCATION
PERMISSION_TYPES.NOTIFICATIONS
```

---

## Browser Compatibility

### Desktop Browsers

| Feature | Chrome | Firefox | Edge | Safari |
|---------|--------|---------|------|--------|
| getUserMedia | ✅ | ✅ | ✅ | ⚠️ |
| Geolocation API | ✅ | ✅ | ✅ | ✅ |
| Permissions API | ✅ | ⚠️ | ✅ | ❌ |
| MediaRecorder | ✅ | ✅ | ✅ | ❌ |
| Canvas | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Service Workers | ✅ | ✅ | ✅ | ⚠️ |

### Mobile Browsers

| Feature | Chrome | Firefox | Safari | Samsung |
|---------|--------|---------|--------|---------|
| getUserMedia | ✅ | ✅ | ⚠️ | ✅ |
| Geolocation API | ✅ | ✅ | ✅ | ✅ |
| Concurrent Cameras | ❌ | ❌ | ❌ | ❌ |
| Canvas | ✅ | ✅ | ✅ | ✅ |

### Recommended Versions

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14.1+ (limited)

---

## Security & Privacy

### Best Practices

1. **Permission Transparency**
   - Always show why permissions are needed
   - Request only what's necessary
   - Never request permissions on load

2. **Data Protection**
   - Encrypt data in transit (HTTPS/WSS)
   - Encrypt data at rest
   - Implement secure chunk transmission
   - Use signed URLs for upload

3. **User Control**
   - Provide clear stop button
   - Show persistent recording indicator
   - Allow instant permission revocation
   - Implement timeout for long recordings

4. **Compliance**
   - GDPR compliant consent
   - CCPA data handling
   - Clear terms of service
   - Data retention policies

### Privacy Features Built-In

✅ **No Background Recording**
- Recording stops when user navigates away
- Requires explicit user action to record
- Visual indicators when recording active

✅ **Granular Permissions**
- Request camera, microphone, location separately
- User can deny individual permissions
- Fallback options provided

✅ **Local Storage**
- Chunks stored in IndexedDB (user-controlled)
- No automatic cloud upload until user confirms
- Clear data retention in browser

✅ **Audit Trail**
- Session metadata with timestamps
- User action logs
- Permission grant/deny history

---

## Performance Optimization

### Chunking Strategy

- **2-3 second chunks** = Low latency + manageable sizes
- **Concurrent access** = No blocking streams
- **Adaptive quality** = Responsive to bandwidth

### Network Optimization

```javascript
// Monitor connection
const connection = navigator.connection;
const effectiveType = connection.effectiveType;
// 'slow-2g', '2g', '3g', '4g'

// Auto-adjust bitrate
if (effectiveType === '4g') {
  quality = STREAM_QUALITY.HIGH;
} else if (effectiveType === '3g') {
  quality = STREAM_QUALITY.MEDIUM;
} else {
  quality = STREAM_QUALITY.LOW;
}
```

### Memory Management

- Clear completed chunks from memory
- Limit location history size (max 1000 points)
- Clean up streams on page unload
- Use WeakMaps for stream references

### Optimized Rendering

- Use Canvas for maps instead of heavy libraries
- Debounce stats updates (every 2 seconds)
- Lazy load Leaflet when needed
- Memoize component renders

---

## Troubleshooting

### Common Issues

#### "Permission Denied" Errors

**Problem:** User sees permission denied immediately

**Solutions:**
1. Check browser permissions in settings
2. Ensure HTTPS connection (required for getUserMedia)
3. Check if permissions were previously denied
4. Try incognito mode to reset permissions

#### "Camera Not Found"

**Problem:** No camera devices available

**Solutions:**
1. Verify device has camera hardware
2. Check if another app is using camera
3. Try refreshing the page
4. Restart browser

#### "Low Bitrate / Poor Quality"

**Problem:** Stream quality is degraded

**Solutions:**
1. Check network connection speed
2. Reduce streaming quality manually
3. Enable adaptive quality mode
4. Close other bandwidth-heavy apps
5. Check if background apps are recording

#### "Location Not Available"

**Problem:** Geolocation not working

**Solutions:**
1. Enable location permission for browser
2. Check if location is disabled globally
3. Verify GPS is turned on (mobile)
4. Try moving to open area (more satellites)
5. Use WiFi positioning as fallback

#### "IndexedDB Error"

**Problem:** Offline storage not working

**Solutions:**
1. Check if storage is full
2. Clear browser cache
3. Disable private browsing mode
4. Check browser storage settings
5. Verify IndexedDB quota

### Debug Mode

Enable debug logging:

```javascript
// Enable all debug messages
localStorage.setItem('DEBUG_MEDIA', '*');

// Then reload page
// Check console for detailed messages
```

### Performance Monitoring

```javascript
// Monitor recording performance
const stats = liveStreamingService.getStreamingStats();
console.log(`
  Bitrate: ${stats.averageBitrate} Mbps
  Chunks: ${stats.chunksRecorded}
  Size: ${stats.estimatedSize} MB
  Duration: ${stats.elapsed}s
`);
```

---

## Advanced Configuration

### Custom Stream Quality

```javascript
const streamData = await mediaStreamManager.requestStream('camera-1', {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000
  },
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 }
  }
});
```

### Location Tracking Options

```javascript
geolocationTracker.startTracking({
  enableHigh: true,      // Maximum accuracy
  timeout: 10000,        // 10 second timeout
  maximumAge: 0,         // Always get fresh data
  updateInterval: 2000   // Update every 2 seconds
});
```

### Custom Permission Messages

Edit `PERMISSION_EXPLANATIONS` in permissionOrchestrator.js to customize messages for your organization.

---

## Support & Updates

- **Documentation:** See individual service files for JSDoc comments
- **Issues:** Report bugs on GitHub
- **Updates:** Check for updates regularly
- **Community:** Contribute improvements

---

**Last Updated:** April 2, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
