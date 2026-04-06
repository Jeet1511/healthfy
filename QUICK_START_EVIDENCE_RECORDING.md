# 🚀 Quick Start: Integrate Evidence Recording into Your App

## 5-Minute Setup

### Step 1: Import Components & Services

```javascript
import SOSRecordingPanel from './components/SOSRecordingPanel';
import EvidenceDashboard from './components/EvidenceDashboard';
import useEvidenceRecording from './hooks/useEvidenceRecording';
import { emergencyAlertService } from './services/emergencyAlertService';
import axios from 'axios';
```

### Step 2: Initialize Alert Service

```javascript
// In your App.jsx or main entry point
import axios from 'axios';
import { emergencyAlertService } from './services/emergencyAlertService';

// Initialize alert service
emergencyAlertService.initialize(axios);
```

### Step 3: Add to Your Safety Component

```javascript
// pages/Safety.jsx
import React, { useState } from 'react';
import SOSRecordingPanel from '../components/SOSRecordingPanel';
import EvidenceDashboard from '../components/EvidenceDashboard';

export function SafetyPage() {
  const [activeTab, setActiveTab] = useState('recording'); // 'recording' or 'dashboard'

  return (
    <div className="safety-page">
      <div className="tabs">
        <button 
          className={activeTab === 'recording' ? 'active' : ''}
          onClick={() => setActiveTab('recording')}
        >
          🚨 Emergency Recording
        </button>
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📹 Evidence Dashboard
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'recording' && <SOSRecordingPanel />}
        {activeTab === 'dashboard' && <EvidenceDashboard />}
      </div>
    </div>
  );
}
```

### Step 4: Using the Hook (Advanced)

```javascript
import useEvidenceRecording from '../hooks/useEvidenceRecording';

function CustomSOS() {
  const {
    isRecording,
    recordingTime,
    uploadStats,
    error,
    startRecording,
    stopRecording,
  } = useEvidenceRecording();

  const handleSOSClick = async () => {
    try {
      const sessionId = await startRecording('audio-video');
      console.log('Recording started:', sessionId);
      
      // Notify emergency contacts
      await emergencyAlertService.sendAlert(sessionId, ['contact@example.com']);
    } catch (err) {
      console.error('SOS failed:', err);
    }
  };

  return (
    <div>
      {isRecording ? (
        <>
          <div className="recording-status">
            🟴 Recording: {recordingTime}s
            <br />
            ✓ Uploaded: {uploadStats.uploadedChunks}
            <br />
            ⟳ Pending: {uploadStats.pendingChunks}
            <br />✗ Failed: {uploadStats.failedChunks}
          </div>
          <button onClick={stopRecording}>⏹ Stop</button>
        </>
      ) : (
        <button onClick={handleSOSClick} className="sos-button">
          🚨 SOS
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## Configuration

### Environment Variables

**`.env` (Client side - Vite)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_RECORDING=true
```

**`.env` (Server side)**
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/omina
FIREBASE_PROJECT_ID=your_project
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

---

## API Integration

### POST Request: Start Recording

```javascript
const response = await axios.post('/api/evidence/start', {
  recordingType: 'audio-video', // or 'audio-only'
  metadata: {
    deviceInfo: navigator.userAgent,
    appVersion: '1.0.0'
  }
});

const { sessionId } = response.data.data;
```

### POST Request: Upload Chunk (Real-time)

```javascript
const formData = new FormData();
formData.append('chunk', blob); // Blob from recorder
formData.append('sessionId', sessionId);
formData.append('chunkIndex', 0);
formData.append('duration', 2000);
formData.append('location', JSON.stringify({
  latitude: 40.7128,
  longitude: -74.0060
}));

const response = await axios.post(
  '/api/evidence/upload-chunk',
  formData,
  { headers: { 'Content-Type': 'multipart/form-data' } }
);
```

### POST Request: Complete Session

```javascript
const response = await axios.post(`/api/evidence/complete/${sessionId}`, {
  notes: 'Incident description...'
});
```

### GET Request: List Sessions

```javascript
const response = await axios.get('/api/evidence?status=completed&limit=20');
const { evidence, total } = response.data.data;
```

---

## Complete Example Component

```javascript
import React, { useState, useEffect } from 'react';
import useEvidenceRecording from '../hooks/useEvidenceRecording';
import { emergencyAlertService } from '../services/emergencyAlertService';
import axios from 'axios';

export function CompleteSOS() {
  const {
    isRecording,
    recordingTime,
    uploadStats,
    location,
    error,
    startRecording,
    stopRecording,
  } = useEvidenceRecording();

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    // Fetch user's emergency contacts
    const fetchContacts = async () => {
      try {
        const response = await axios.get('/api/users/emergency-contacts');
        setEmergencyContacts(response.data.data.contacts);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      }
    };
    fetchContacts();
  }, []);

  const handleSOS = async () => {
    try {
      // Start recording
      const sessionId = await startRecording('audio-video');

      // Send alerts to emergency contacts
      if (emergencyContacts.length > 0) {
        const emails = emergencyContacts
          .filter(c => c.email)
          .map(c => c.email);

        await emergencyAlertService.sendAlert(sessionId, emails, {
          location,
          timestamp: new Date(),
          userName: 'Current User',
        });
      }

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 Emergency Recording Started', {
          body: `Session ${sessionId.slice(0, 8)}... started. ${emergencyContacts.length} contacts notified.`,
        });
      }
    } catch (err) {
      console.error('SOS error:', err);
    }
  };

  if (!isRecording) {
    return (
      <div className="sos-container">
        <button className="sos-button" onClick={handleSOS}>
          🚨 SOS EMERGENCY
        </button>
        <p className="sos-help">
          Press to start recording and notify emergency contacts
        </p>
      </div>
    );
  }

  return (
    <div className="sos-recording">
      <div className="recording-header">
        <div className="pulse-indicator">
          <span className="pulse"></span>
          🔴 RECORDING
        </div>
        <div className="timer">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</div>
      </div>

      <div className="upload-status">
        <div className="stat">
          <span className="label">✓ Uploaded:</span>
          <span className="value">{uploadStats.uploadedChunks}</span>
        </div>
        <div className="stat">
          <span className="label">⟳ Pending:</span>
          <span className="value">{uploadStats.pendingChunks}</span>
        </div>
        <div className="stat">
          <span className="label">✗ Failed:</span>
          <span className="value">{uploadStats.failedChunks}</span>
        </div>
      </div>

      {location && (
        <div className="location">
          📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </div>
      )}

      <div className="contacts-notified">
        {emergencyContacts.length > 0 && (
          <>
            <button onClick={() => setShowContacts(!showContacts)}>
              {emergencyContacts.length} Contacts Notified
            </button>
            {showContacts && (
              <div className="contacts-list">
                {emergencyContacts.map((c) => (
                  <div key={c.id} className="contact">
                    {c.name} - {c.phone}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button className="stop-button" onClick={stopRecording}>
        ⏹ STOP RECORDING
      </button>
    </div>
  );
}
```

---

## TypeScript Support

```typescript
import { FC } from 'react';
import { useEvidenceRecording } from '../hooks/useEvidenceRecording';

interface EvidenceRecordingStats {
  uploadedChunks: number;
  pendingChunks: number;
  failedChunks: number;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const SOSButton: FC = () => {
  const {
    isRecording,
    recordingTime,
    uploadStats,
    location,
    error,
    startRecording,
    stopRecording,
  } = useEvidenceRecording();

  // ... component logic
};
```

---

## Testing

### Manual Testing Checklist

```
[ ] Permission Dialog appears on first use
[ ] Camera/Microphone permissions can be granted
[ ] Recording starts when SOS button clicked
[ ] Timer counts up every second
[ ] Chunks appear in real-time (every 2 seconds)
[ ] Location shown on UI
[ ] Offline mode: chunks queue in IndexedDB
[ ] Online mode: chunks upload immediately
[ ] Stop button completes the session
[ ] Evidence Dashboard shows new session
[ ] Download chunk link works
[ ] Delete session works
[ ] Emergency contacts notified
```

### Debug Mode

```javascript
// Enable debug logging
window.__DEBUG_RECORDING = true;

// Check offline storage
const info = await offlineStorageService.getInfo();
console.log('Offline storage:', info);

// Check IndexedDB directly
const dbs = await indexedDB.databases();
console.log('IndexedDB databases:', dbs);
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permissions dialog doesn't appear | Check permissions not already denied in browser settings |
| Chunks not uploading | Check network connection, Firebase credentials |
| IndexedDB not working | Check browser storage permissions, quota |
| Large video files | Reduce chunk duration, lower resolution |
| Memory issues | Clear old sessions, reduce chunk size |

---

## Production Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase project set up and credentials added
- [ ] MongoDB database created and connection tested
- [ ] Chunk upload limits configured
- [ ] Storage quotas set
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Permission prompts tested on real device
- [ ] Offline mode tested (disable network)
- [ ] Auto-sync verified
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security audit completed

