# 🚨 OMINA - Secure Evidence Recording System
## Production-Level Implementation Guide

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Components & Services](#components--services)
5. [API Endpoints](#api-endpoints)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### 🎯 Core Features
- ✅ **Real-time Chunk Uploads** - Never lose evidence even if app closes
- ✅ **Offline Support** - IndexedDB caching + auto-sync when online
- ✅ **Cloud Storage** - Firebase or AWS S3 secure uploads
- ✅ **Location Tracking** - GPS coordinates attached to every chunk
- ✅ **Permission Management** - Graceful handling of device permissions
- ✅ **Evidence Dashboard** - View, download, manage all recordings
- ✅ **Tamper-Proof** - Cryptographic verification (future)
- ✅ **Mobile Optimized** - PWA support, low bandwidth optimization
- ✅ **Emergency Alerts** - Notify contacts with evidence links

### 🧠 Key Differentiators from Prototype
1. **Real-time chunking** (2-3 sec intervals) instead of waiting for full recording
2. **IndexedDB offline queue** ensures zero data loss
3. **Automatic retry system** with exponential backoff
4. **Cloud-first architecture** - local storage is secondary
5. **Session-based** tracking with metadata
6. **Background sync** for PWA

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SOS Panel    │  │  Dashboard   │  │  Permission  │      │
│  │              │  │              │  │  Handler     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼──────┐      │
│  │           Recording Service                       │      │
│  │   (EvidenceRecorder) - Real-time chunking        │      │
│  └──────┬─────────────────────────────────────────────┘      │
│         │                                                    │
│  ┌──────▼────────────────────────────────────────────┐      │
│  │ ChunkUploaderService                             │      │
│  │ • Upload coordination                            │      │
│  │ • Retry logic                                    │      │
│  │ • Offline detection                              │      │
│  └──────┬─────────────────┬────────────────────────┘       │
│         │                 │                                 │
│  {Online}         {Offline}                                │
│         │                 │                                 │
│  ┌──────▼────────┐   ┌───▼──────────────────┐             │
│  │ API Client    │   │  IndexedDB Storage   │             │
│  │ (Axios)       │   │  • PendingChunks     │             │
│  │               │   │  • UploadedChunks    │             │
│  │               │   │  • FailedChunks      │             │
│  └──────┬────────┘   │  • Sessions          │             │
│         │            └───▲──────────────────┘             │
│         │                │                                 │
│         └────────────────┴─────────────────────────────┐  │
│                                                        │  │
└────────────────────────────────────────────────────────┼──┘
                                                         │
                          ┌──────────────────────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │    SERVER (Node.js/Express)        │
        ├────────────────────────────────────┤
        │  POST /api/evidence/upload-chunk   │
        │  GET  /api/evidence/:sessionId     │
        │  POST /api/evidence/complete       │
        │  POST /api/evidence/share          │
        │  ... (full CRUD)                   │
        └─────────────┬──────────────────────┘
                      │
        ┌─────────────▼──────────────────┐
        │   MongoDB (Metadata)           │
        │   • Evidence Sessions          │
        │   • Chunk References           │
        │   • Location Data              │
        └───────────────────────────────┘

                 Cloud Storage
        ┌─────────────────────────────┐
        │  Firebase Storage / S3       │
        │  /evidence/{userId}/         │
        │    {sessionId}/chunks/       │
        └─────────────────────────────┘
```

---

## Setup Instructions

### 1️⃣ Backend Setup

```bash
# Install dependencies
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/omina
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
EOF

# Run migrations/seed if needed
node seedAdmin.js

# Start server
npm run dev
```

### 2️⃣ Client Setup

```bash
# Install dependencies
cd client
npm install

# Add manifest.json reference to index.html
# Already done in: client/public/manifest.json

# Start development server
npm run dev
```

### 3️⃣ Firebase Setup

```bash
# Go to Google Cloud Console
# Create a new project
# Enable Cloud Storage
# Create a service account and download JSON key
# Add credentials to backend .env file
```

### 4️⃣ Database Setup

```bash
# Create MongoDB indexes for performance
db.evidence.createIndex({ userId: 1, createdAt: -1 })
db.evidence.createIndex({ sessionId: 1 })
db.evidence.createIndex({ status: 1 })
```

---

## Components & Services

### Frontend Services

#### 1. **EvidenceRecorder** (`recordingService.js`)
```javascript
const recorder = new EvidenceRecorder({
  recordingType: 'audio-video',
  chunkDuration: 2000, // 2 seconds
  onChunkReady: handleChunk,
  onStatusChange: handleStatus,
  onError: handleError
});

await recorder.start(sessionId);
// ... recording happens
await recorder.stop();
```

**Features:**
- MediaRecorder API wrapper
- Real-time chunking
- Audio/video toggle
- Camera switching (mobile)
- Automatic cleanup

#### 2. **ChunkUploaderService** (`chunkUploaderService.js`)
```javascript
const uploader = createChunkUploader(apiClient, {
  maxRetries: 5,
  retryDelay: 2000,
  onProgress: handleProgress,
  onError: handleError
});

await uploader.uploadChunk(blob, metadata);
// Auto-syncs pending chunks when online
```

**Features:**
- Real-time upload coordination
- Automatic retry with exponential backoff
- Offline queueing
- Online/offline detection
- Progress tracking

#### 3. **OfflineStorageService** (`offlineStorageService.js`)
```javascript
await offlineStorageService.initialize();

// Save for pending upload
await offlineStorageService.saveChunkForUpload(chunk);

// Get all pending
const pending = await offlineStorageService.getPendingChunks();

// Mark as uploaded
await offlineStorageService.saveUploadedChunk(chunk);
```

**Features:**
- IndexedDB persistence
- Automatic cleanup
- Session management
- Statistics tracking

#### 4. **PermissionHandler** (`permissionService.js`)
```javascript
const status = await permissionHandler.requestCamera();
const allPerms = await permissionHandler.requestAllPermissions();

const isReady = permissionHandler.isReadyForRecording();
```

**Features:**
- Permission requests
- Graceful fallback (audio-only if no camera)
- Non-blocking UI
- Retry capability

### Backend Services

#### 1. **Evidence Model** (`models/Evidence.js`)
```javascript
{
  sessionId: String (unique),
  userId: ObjectId,
  status: "recording" | "completed" | "failed",
  recordingType: "audio-only" | "audio-video",
  chunks: [
    {
      chunkIndex: Number,
      uploadStatus: "pending" | "success" | "failed",
      cloudPath: String,
      location: { latitude, longitude }
    }
  ],
  uploadedChunks: Number,
  totalChunks: Number,
  location: { startLat, startLng, endLat, endLng }
}
```

#### 2. **FirebaseStorageService** (`services/firebaseStorageService.js`)
```javascript
await firebaseStorageService.uploadChunk(buffer, userId, sessionId, chunkIndex);
const url = await firebaseStorageService.generateSignedUrl(userId, sessionId, chunkIndex);
```

#### 3. **EvidenceController** (`controllers/evidenceController.js`)
```javascript
POST /api/evidence/start           // Create session
POST /api/evidence/upload-chunk    // Upload chunk
POST /api/evidence/complete/:id    // Finish session
GET  /api/evidence                 // List all sessions
GET  /api/evidence/:id             // Get session details
GET  /api/evidence/:id/chunks/:num/download  // Get download link
```

---

## API Endpoints

### Evidence Management

#### Start Recording Session
```bash
POST /api/evidence/start
Content-Type: application/json

{
  "recordingType": "audio-video",
  "metadata": {
    "deviceInfo": "Mozilla/5.0..."
  }
}

Response:
{
  "status": "success",
  "data": {
    "sessionId": "uuid-xxxx",
    "evidenceId": "mongo_id",
    "startTime": "2024-03-31T10:00:00Z"
  }
}
```

#### Upload Chunk (Real-time)
```bash
POST /api/evidence/upload-chunk
Content-Type: multipart/form-data

chunk: <binary>
sessionId: "uuid-xxxx"
chunkIndex: 0
duration: 2000
location: { "latitude": 40.7128, "longitude": -74.0060 }

Response:
{
  "status": "success",
  "data": {
    "sessionId": "uuid-xxxx",
    "chunkIndex": 0,
    "uploadStatus": "success",
    "cloudPath": "evidence/user_id/session_id/chunks/chunk-0.webm"
  }
}
```

#### Complete Session
```bash
POST /api/evidence/complete/:sessionId
Content-Type: application/json

{
  "notes": "Incident at location..."
}

Response:
{
  "status": "success",
  "data": {
    "sessionId": "uuid-xxxx",
    "status": "completed",
    "duration": 125,
    "totalChunks": 63,
    "uploadedChunks": 62
  }
}
```

#### Get Session with Chunks
```bash
GET /api/evidence/:sessionId

Response:
{
  "status": "success",
  "data": {
    "_id": "mongo_id",
    "sessionId": "uuid-xxxx",
    "status": "completed",
    "chunks": [
      {
        "chunkIndex": 0,
        "uploadStatus": "success",
        "cloudPath": "...",
        "downloadUrl": "https://..."
      },
      ...
    ]
  }
}
```

---

## Configuration

### Environment Variables

**.env (Server)**
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/omina
MONGODB_DATABASE=omina

# JWT
JWT_SECRET=your_super_secret_key_256_bits_min
JWT_EXPIRE=7d

# Firebase
FIREBASE_PROJECT_ID=project_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=project.appspot.com

# Client
CLIENT_URL=http://localhost:5173

# Features
ENABLE_LOCATION_TRACKING=true
ENABLE_NOTIFICATIONS=true
MAX_CHUNK_SIZE=52428800  # 50MB
CHUNK_RETENTION_DAYS=90
```

### Client Configuration

**Recording Settings:**
```javascript
const recordingConfig = {
  chunkDuration: 2000,        // Extract chunks every 2 seconds
  maxChunkSize: 50 * 1024 * 1024,  // 50MB per chunk
  uploadRetries: 5,            // Retry failed uploads 5 times
  retryDelay: 2000,           // Initial retry delay (exponential backoff)
  offlineQueueLimit: 500,     // Max offline chunks to queue
};
```

---

## Testing

### Manual Testing Checklist

- [ ] **Permission Flow**
  - [ ] Grant all permissions
  - [ ] Deny camera, keep audio
  - [ ] Deny microphone
  - [ ] Test location tracking

- [ ] **Recording**
  - [ ] Start recording, verify chunks appear in real-time
  - [ ] Upload status shows progress
  - [ ] Timer updates correctly
  - [ ] Stop and verify session is saved

- [ ] **Offline Mode**
  - [ ] Disable internet
  - [ ] Start recording
  - [ ] Chunks queue in IndexedDB
  - [ ] Enable internet
  - [ ] Verify auto-sync occurs

- [ ] **Dashboard**
  - [ ] Display all sessions
  - [ ] Filter by status (recording/completed/failed)
  - [ ] Download chunk
  - [ ] Delete session
  - [ ] View detailed stats

- [ ] **Error Scenarios**
  - [ ] Network interruption during upload
  - [ ] Camera permission denied
  - [ ] Storage full
  - [ ] Session timeout

### Automated Testing

```bash
# Backend tests
npm test

# Integration tests
npm run test:integration

# Load tests
npm run test:load
```

---

## Deployment

### Production Checklist

- [ ] Set up Firebase project in production
- [ ] Configure MongoDB Atlas
- [ ] Set strong JWT secret
- [ ] Enable HTTPS only
- [ ] Configure CORS for production domain
- [ ] Set up monitoring/logging
- [ ] Create database indexes
- [ ] Test offline mode
- [ ] Performance optimization (chunk size, upload limits)

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

---

## Troubleshooting

### Issue: Uploads fail even when online

**Solution:**
1. Check Firebase credentials in .env
2. Verify bucket permissions
3. Check CORS configuration
4. Review browser console for errors

### Issue: IndexedDB quota exceeded

**Solution:**
```javascript
// Clear old sessions
const db = await offlineStorageService.initialize();
// Storage limit: ~50MB initially, can request more
```

### Issue: Chunks missing after app close

**Solution:**
1. Ensure IndexedDB initialized before recording
2. Clear browser cache/storage rarely
3. Use IndexedDB events to track sync status

### Issue: Recording stops unexpectedly

**Solution:**
1. Check permission status (may be revoked)
2. Verify stream from getUserMedia
3. Monitor memory usage
4. Check browser console for errors

---

## Security Considerations

1. **Authentication**: All API calls require JWT token
2. **Encryption**: Store sensitive fields encrypted at rest
3. **Access Control**: Users can only access their own evidence
4. **Data Retention**: Auto-delete after configured period
5. **Audit Logging**: Log all access to evidence
6. **HTTPS**: Enforce TLS 1.3+ in production

---

## Future Enhancements

- [ ] AI-based incident detection (sound/motion analysis)
- [ ] Live streaming to emergency services
- [ ] End-to-end encryption (E2E)
- [ ] Multi-format support (3GP, MP4)
- [ ] Video compression/optimization
- [ ] Real-time face/object detection
- [ ] Integration with emergency hotlines
- [ ] Advanced sharing & collaboration
- [ ] Blockchain verification (tamper-proof)

---

## Support & Documentation

- API Documentation: `/docs/api`
- Mobile Optimization: `/docs/mobile`
- PWA Guide: `/docs/pwa`
- Firebase Setup: `/docs/firebase`

