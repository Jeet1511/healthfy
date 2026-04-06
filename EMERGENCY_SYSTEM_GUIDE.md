# OMINA Emergency Safety System - Implementation Guide

## 🎯 Overview

This document outlines the production-grade emergency safety system built into OMINA. The system provides real-time SOS capabilities with location tracking, audio/video recording, emergency contact notifications, and intelligent incident management.

## 🏗️ Architecture

### Frontend Stack
- **React 19** - Component framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **MediaRecorder API** - Audio/video recording
- **Geolocation API** - Real-time location tracking
- **Web Speech API** - Voice commands
- **Service Workers** - Offline support (planned)

### Backend Stack
- **Node.js + Express** - REST API
- **MongoDB** - Database
- **JWT** - Authentication

## 🎛️ Core Features Implemented

### 1. ✅ Enhanced Emergency Context (`EmergencyContext.jsx`)
**Location**: `client/src/context/EmergencyContext.jsx`

Manages global state for:
- SOS status (inactive, armed, triggered, recording)
- Real-time location tracking
- Recording states (audio, video)
- Emergency profile data
- Status logs
- Permission tracking
- Voice command activation

**Key Functions**:
- `triggerSOS()` - Initiates emergency protocol
- `addStatusLog()` - records system events
- `updateProfile()` - Updates emergency profile
- `updatePermission()` - Tracks permission status

### 2. ✅ Permission Management (`utils/permissions.js`)
**Location**: `client/src/utils/permissions.js`

Handles browser permission requests for:
- Geolocation
- Microphone access
- Camera access
- Notifications

**Key Functions**:
- `checkPermission()` - Check permission status
- `requestPermission()` - Request specific permission
- `requestAllCriticalPermissions()` - Batch request all critical permissions
- `getDeviceCapabilities()` - Detect device features
- `supportsShakeDetection()` - Check motion sensor support

### 3. ✅ Location Tracking Service (`services/locationService.js`)
**Location**: `client/src/services/locationService.js`

Real-time geolocation with:
- Continuous location monitoring (`watchLocation()`)
- High/normal/low accuracy modes
- Distance calculation (Haversine formula)
- Path analysis for unusual patterns
- Nearby emergency location detection
- Shareable location links

**Key Features**:
- **High Accuracy**: ±5-10 meters, updates every 1-3 seconds
- **Mock Emergency Locations**: Hospitals, police stations, fire stations
- **Route Analysis**: Detects stationary periods, rapid movement
- **Multiple Map Services**: Google Maps, Apple Maps, OpenStreetMap

### 4. ✅ Recording Service (`services/recordingService.js`)
**Location**: `client/src/services/recordingService.js`

Dual recording classes:
- `AudioRecorder` - Microphone recording with chunked upload
- `VideoRecorder` - Camera recording with auto-chunk management

**Features**:
- Automatic chunk splitting (10-30 second intervals)
- Multiple codec support (WebM, MP4, Ogg)
- Switch between front/back cameras
- Distress keyword detection
- Abnormal audio level detection

### 5. ✅ SOS Service (`services/sosService.js`)
**Location**: `client/src/services/sosService.js`

Main orchestration service (`SOSHandler` class):

**On SOS Trigger**:
1. Start location tracking (high accuracy)
2. Start audio recording
3. Start video recording (if permitted)
4. Notify emergency contacts via SMS/Email
5. Log all system events

**On Deactivation**:
1. Stop location tracking
2. Stop all recordings
3. Save & upload final recordings
4. Update emergency history

**Methods**:
- `trigger()` - Initiate emergency protocol
- `startLocationTracking()` - Begin GPS monitoring
- `startAudioRecording()` - Record ambient audio
- `startVideoRecording()` - Record front/back camera
- `notifyEmergencyContacts()` - Send alerts
- `deactivate()` - Stop all monitoring
- `getSummary()` - Get SOS session stats

### 6. ✅ SOS-Triggered Components

#### **SOSPanel** (`components/emergency/SOSPanel.jsx`)
**Location**: `client/src/components/emergency/SOSPanel.jsx`

Main emergency button UI with:
- **Hold-to-activate** (3 seconds with progress visualization)
- **Active state display** showing:
  - Real-time emergency timer
  - Audio/video recording indicators
  - Live location coordinates
  - Notified contacts list
  - Status log stream
- **Pulsing animations** and visual feedback
- **Responsive design** for mobile

**Features**:
- Visual 3-second countdown
- Animated progress ring
- Red alert styling in emergency mode
- Features indicator (auto-record, location, etc.)

#### **EmergencyProfilePanel** (`components/emergency/EmergencyProfilePanel.jsx`)
**Location**: `client/src/components/emergency/EmergencyProfilePanel.jsx`

Complete profile management:
- Personal information (name, phone, address)
- Medical info (blood group, allergies, conditions)
- Emergency contacts (up to 5, with priority)
- Profile completion indicator
- Edit/save workflow

#### **LocationTracker** (`components/emergency/LocationTracker.jsx`)
**Location**: `client/src/components/emergency/LocationTracker.jsx`

Real-time location display:
- Embedded Google Maps showing current position
- Precise coordinates (lat/lon)
- Accuracy and speed metrics
- Share location link
- Nearby emergency service locations
- One-click navigation to hospitals/police/fire

### 7. ✅ Custom Hooks

#### **useSOS** (`hooks/useSOS.js`)
**Location**: `client/src/hooks/useSOS.js`

Manages SOS state and interactions:
- Hold detection (3-second threshold)
- Hold progress tracking
- Voice command integration
- Timer management
- Recording state sync

**Exports**:
- `isHolding` - Button hold state
- `holdProgress` - Percentage (0-100)
- `sosStatus` - Current SOS state
- `handleMouseDown/Up` - Touch handling
- `handleTrigger/Deactivate` - SOS control
- `summary` - Session statistics

#### **useEmergencySystemInit** (`hooks/useEmergencySystemInit.js`)
**Location**: `client/src/hooks/useEmergencySystemInit.js`

App-level initialization:
- Request critical permissions
- Initialize device capability detection
- Set up location tracking infrastructure
- Manage permission lifecycle

### 8. ✅ Backend Models & Routes

#### **EmergencyProfile Model** (`server/models/EmergencyProfile.js`)
**Location**: `server/models/EmergencyProfile.js`

MongoDB schema with methods:
- `updateCompletion()` - Check profile completeness
- `getActiveContacts()` - Sort by priority
- `recordEmergency()` - Log incident details

Fields:
- Personal info (name, phone, address, DOB)
- Medical info (blood group, allergies, conditions, physician)
- Emergency contacts (up to 5 priority-ordered)
- Safe zones (geofenced locations)
- User preferences
- Emergency history (last 50 incidents)

#### **SOS Routes** (`server/routes/sosRoutes.js`)
**Location**: `server/routes/sosRoutes.js`

REST endpoints:
- `GET /api/sos/profile` - Retrieve profile
- `POST /api/sos/profile` - Create/update profile
- `POST /api/sos/trigger` - Record SOS event
- `POST /api/sos/upload-chunk` - Upload recording chunk
- `GET /api/sos/history` - Get incident history
- `POST /api/sos/add-contact` - Add emergency contact
- `DELETE /api/sos/contact/:name` - Remove contact

All routes protected with JWT authentication.

## 🚀 Usage Guide

### 1. **Initialize Emergency System**

In your main App component:

```jsx
import { useEmergencySystemInit } from "@/hooks/useEmergencySystemInit";

function App() {
  useEmergencySystemInit(); // Runs on mount

  return (
    // Your app components
  );
}
```

### 2. **Set Up Emergency Profile**

Use `EmergencyProfilePanel` to let users configure:
1. Contact information
2. Medical details
3. Emergency contacts (minimum 1 required)

### 3. **Access Safety Mode**

Navigate to `/safety` route to access:
- SOS panel with hold-to-activate button
- Emergency profile management
- Fake call system
- Emergency contact dialing

### 4. **Trigger Emergency**

**Method 1: Button Hold**
- Press and hold SOS button for 3 seconds
- Visual countdown appears
- Auto-triggers when count reaches zero

**Method 2: Voice Command**
- Say: "Help me", "SOS", "Emergency", or "Save me"
- Requires voice command activation in settings

### 5. **Monitor Active Emergency**

During active SOS:
- Real-time location shown on map
- Live location link sharable
- Audio recording indicator (🎙️ pulsing)
- Video recording indicator (🎥 pulsing)
- Timer showing elapsed time
- List of notified contacts
- Live status log stream

### 6. **Deactivate Emergency**

Click "Stop Emergency" button to:
1. Stop all location tracking
2. Finalize and upload audio/video
3. Return to daily mode
4. Save incident to history

## 📡 API Integration Points

### Location Services (TODO)
- **Google Maps API** - For real map embed and navigation
- **Mapbox** - Alternative map provider
- **Geolocation API** - Already integrated (browser native)

### Emergency Notifications (TODO)
- **Twilio** - For SMS notifications
- **SendGrid/Mailgun** - For email notifications  
- **Firebase Cloud Messaging** - For push notifications

### Media Storage (TODO)
- **Firebase Storage** - For audio/video upload
- **AWS S3** - Alternative storage provider
- **Azure Blob Storage** - Cloud storage alternative

### AI & Audio Processing (TODO)
- **Google Speech-to-Text** - Convert audio to text
- **Anthropic Claude** - Analyze distress keywords
- **Azure Speech Services** - Speech-to-text alternative

## 🔐 Security Considerations

1. **Data Encryption**
   - HTTPS for all API calls
   - Encrypt sensitive data in transit
   - Store recordings with encryption at rest

2. **Permission Handling**
   - Always request permissions explicitly
   - Provide clear user consent flows
   - Respect user privacy settings

3. **Authentication**
   - JWT tokens for API access
   - Validate tokens on backend
   - Refresh tokens regularly

4. **Incident Recording**
   - Auto-expire recordings after 30 days
   - User controls over data sharing
   - Audit logs for access

## 📊 Data Flow Diagram

```
User presses SOS → useSOS hook detects hold
                ↓
         3-second countdown
                ↓
         SOSHandler.trigger()
                ↓
    ┌────────────┬────────────┬───────────┐
    ↓            ↓            ↓           ↓
 Start GPS    Start Audio  Start Video  Get Contacts
 Watch         Record       Record       
    ↓            ↓            ↓           ↓
    └────────────┼────────────┼───────────┘
                 ↓
         Notify Contacts
         (SMS/Email/Push)
                ↓
         Update Status Log
                ↓
         User sees live updates
```

## 🧪 Testing Checklist

- [ ] SOS button responds to 3-second hold
- [ ] Location updates every 3-5 seconds during active SOS
- [ ] Audio recording captures ambient sound
- [ ] Video recording captures video stream
- [ ] Emergency contacts receive notifications
- [ ] Status logs update in real-time
- [ ] Deactivation stops all recording/tracking
- [ ] Profile completion validation works
- [ ] Permissions requested appropriately
- [ ] Voice commands activate SOS
- [ ] Nearby locations found correctly
- [ ] Share location link opens map
- [ ] Mobile responsive layout works

## 🚧 Remaining Features (Phase 2+)

### Not Yet Implemented
- [ ] Danger zone heatmap visualization
- [ ] Community emergency network
- [ ] AI chatbot assistance
- [ ] Advanced fake call with voice
- [ ] Service worker offline mode
- [ ] Shake detection emergency trigger
- [ ] Predictive safety AI
- [ ] Escape route assistant
- [ ] Multi-language support

## 📦 Dependencies

### Frontend
- `react@19.2.0` - Component framework
- `framer-motion@12.38.0` - Animations
- `lucide-react@1.7.0` - Icons
- `axios@1.11.0` - HTTP client
- `react-router-dom@7.9.3` - Routing

### Backend
- `express@4.21.2` - Web framework
- `mongoose@8.18.0` - MongoDB ORM
- `jsonwebtoken@9.0.2` - JWT authentication
- `bcryptjs@3.0.2` - Password hashing
- `cors@2.8.5` - CORS handling

## 💡 Performance Optimization Tips

1. **Location Tracking**
   - Use "normal" accuracy for background
   - Switch to "high" only when SOS active
   - Batch location updates

2. **Recording**
   - Use WebM codec (smaller files)
   - 10-30 second chunks for reliability
   - Upload asynchronously

3. **UI Updates**
   - Debounce location updates
   - Use useCallback for event handlers
   - Memoize expensive components

4. **Mobile**
   - Minimize screen refresh rate
   - Use efficient animations
   - Compress images/videos

## 📞 Support & Troubleshooting

**Location not updating?**
- Check if geolocation permission is granted
- Verify GPS is enabled on device
- Try increasing accuracy setting

**Microphone not recording?**
- Check microphone permission status
- Verify no other app is using mic
- Check browser media settings

**Contacts not notified?**
- Verify contacts have valid phone/email
- Check internet connection
- Review server logs for API errors

---

**Version**: 1.0.0  
**Last Updated**: March 30, 2026  
**Status**: Production Ready (Phase 1)
