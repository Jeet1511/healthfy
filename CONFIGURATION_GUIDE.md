# Emergency Safety System - Configuration Guide

## 🛠️ Environment Setup

### Before Running

1. **Install Dependencies**
   ```bash
   npm install                  # Root dependencies
   cd client && npm install     # Frontend
   cd ../server && npm install  # Backend
   ```

2. **Environment Variables**

Create `.env` file in server directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/omina
# or MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/omina

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production

# Server
PORT=5000
NODE_ENV=development

# CORS (for local development)
CORS_ORIGIN=http://localhost:5173

# Email Service (Mailgun, SendGrid, etc)
EMAIL_SERVICE=mailgun
EMAIL_API_KEY=your_mailgun_api_key

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase (for storage/realtime db)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# File Storage
STORAGE_TYPE=firebase  # or 'aws-s3', 'local'
```

### Frontend Configuration

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 📋 Third-Party Service Setup

### 1. Google Maps API Setup

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable APIs:
   - Maps JavaScript API
   - Maps Embedding API
   - Geocoding API
   - Places API
4. Create API key for web applications
5. Add key to environment variables
6. Enable billing (required for production)

**Usage in App:**
```jsx
// Add to LocationTracker.jsx iframe
src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}`}
```

### 2. Twilio SMS Setup

**Steps:**
1. Create [Twilio account](https://www.twilio.com/console)
2. Get Account SID from dashboard
3. Generate Auth Token
4. Purchase or verify phone number
5. Add to environment variables

**Usage in sosService.js:**
```javascript
// Uncomment and configure
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(phone, message) {
  await client.messages.create({
    body: JSON.stringify(message),
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
```

### 3. Email Service Setup (SendGrid)

**Steps:**
1. Create [SendGrid account](https://sendgrid.com/)
2. Get API key from settings
3. Add to environment variables

**Usage in sosService.js:**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(email, message) {
  await sgMail.send({
    to: email,
    from: 'noreply@omina-safety.app',
    subject: '🚨 Emergency Alert - OMINA Safety System',
    html: `<h2>Emergency Alert</h2>${JSON.stringify(message)}`,
  });
}
```

### 4. Firebase Setup (Storage & Realtime DB)

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Cloud Storage
4. Create service account key (JSON format)
5. Add credentials to environment variables

**Usage in sosService.js:**
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-bucket.appspot.com',
});

async function uploadRecording(type, blob) {
  const bucket = admin.storage().bucket();
  const file = bucket.file(`emergencies/${Date.now()}/${type}.webm`);
  
  await file.save(blob);
  return file.publicUrl();
}
```

### 5. AWS S3 Setup (Alternative Storage)

**Steps:**
1. Create AWS account
2. Create IAM user with S3 permissions
3. Generate access keys
4. Create S3 bucket

**Environment:**
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=omina-emergency-recordings
AWS_REGION=us-east-1
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Emergency Profiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  personalInfo: {
    name: String,
    phone: String,
    address: String,
    dateOfBirth: Date
  },
  medicalInfo: {
    bloodGroup: String,
    allergies: [String],
    medicalConditions: [{condition, severity}],
    medications: [String],
    emergencyPhysician: {name, phone, email}
  },
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    priority: Number
  }],
  emergencyHistory: [{
    triggeredAt: Date,
    duration: Number,
    location: {latitude, longitude},
    audio: Boolean,
    video: Boolean,
    outcome: String,
    notes: String
  }],
  isComplete: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🏃 Running the Application

### Development Mode

**Terminal 1: Backend**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Production Build

**Backend:**
```bash
cd server
npm run start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## ✅ Pre-Launch Checklist

- [ ] MongoDB connection verified
- [ ] Google Maps API key added and tested
- [ ] Twilio credentials configured
- [ ] Email service connected
- [ ] Firebase storage set up
- [ ] Environment variables in .env files
- [ ] Database service running
- [ ] Backend server starts without errors
- [ ] Frontend builds successfully
- [ ] Can access /safety route
- [ ] Can set emergency profile
- [ ] SOS button responds to hold
- [ ] Location tracking works
- [ ] Tested on mobile device
- [ ] HTTPS certificates obtained (production)
- [ ] Firebase/AWS backups configured
- [ ] Monitoring/logging set up

## 🔄 Deployment Steps

### Heroku (Recommended for Backend)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create omina-server

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...
heroku config:set TWILIO_ACCOUNT_SID=...

# Deploy
git push heroku main
```

### Vercel (Recommended for Frontend)

```bash
# Push to GitHub
git push origin main

# Import project in Vercel dashboard
# Set environment variables in Vercel settings
# Auto-deploys on push
```

### Docker Deployment

**Dockerfile** (Backend):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./server
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://mongodb:27017/omina

volumes:
  mongodb_data:
```

## 🔒 Security Hardening

1. **HTTPS Only**
   ```javascript
   // server/index.js
   app.use((req, res, next) => {
     if (process.env.NODE_ENV === 'production' && !req.secure) {
       return res.redirect(`https://${req.headers.host}${req.url}`);
     }
     next();
   });
   ```

2. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests
   });
   app.use(limiter);
   ```

3. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     credentials: true
   }));
   ```

4. **Helmet Security Headers**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

## 📞 Support Contacts

For issues or questions:
- **API Documentation**: /api/docs (Swagger UI)
- **Emergency Help**: https://omina-safety.app/help
- **Bug Reports**: issues@omina-safety.app

---

**Last Updated**: March 30, 2026
**Configuration Version**: 1.0.0
