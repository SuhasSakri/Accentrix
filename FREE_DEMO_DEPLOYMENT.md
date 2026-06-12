# 🆓 Free Demo Mode Deployment - Step by Step

## What You'll Get (All Free!)

✅ Full working app with beautiful UI
✅ TTS voices work perfectly (native pronunciation)
✅ Recording works
✅ Analysis shows scores (mock/random for demo)
✅ Progress tracking
✅ User authentication
✅ Professional portfolio piece

❌ Real AI pronunciation analysis (scores are random)

---

## 🚀 Let's Deploy! (30 minutes)

### Step 1: Prepare Your Code (2 minutes)

First, update AI service to use mock mode:

1. Open `ai-service/.env`
2. Change this line:
   ```env
   ANALYSIS_MODE=mock
   ```

That's it! Now the AI service will work on free tier.

---

### Step 2: Push to GitHub (5 minutes)

```bash
# In your project root directory
cd c:\Users\HP\OneDrive\Desktop\suhas\AI-assistant

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Accentrix - AI Pronunciation Coach - Ready for deployment"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/accentrix.git

# Push
git branch -M main
git push -u origin main
```

**✅ Checkpoint**: Your code is now on GitHub!

---

### Step 3: Deploy Frontend to Vercel (2 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login (will open browser)
vercel login

# Deploy!
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `accentrix` (or any name)
- Directory? Press Enter (current directory)
- Override settings? **N**

**✅ Write down your URL**: `https://accentrix-xxxxx.vercel.app`

---

### Step 4: Deploy Backend to Render (8 minutes)

1. **Go to**: https://dashboard.render.com/
2. **Sign up** with GitHub (it's free!)
3. **Click**: "New +" → "Web Service"
4. **Connect** your GitHub repository
5. **Find** `accentrix` repository → Click "Connect"

**Configure Backend:**
- **Name**: `accentrix-backend`
- **Region**: Oregon (US West) or closest to you
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Branch**: `main`
- **Plan**: **Free** ⭐

**Add Environment Variables** (click "Add Environment Variable"):

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = your_mongodb_atlas_connection_string
JWT_SECRET = (generate below)
AI_SERVICE_URL = https://accentrix-ai-YOUR-ID.onrender.com
FRONTEND_URL = https://accentrix-xxxxx.vercel.app
```

**Generate JWT_SECRET** (run this in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note**: Leave `AI_SERVICE_URL` as placeholder for now, we'll update it after deploying AI service.

6. **Click**: "Create Web Service"
7. **Wait**: 3-5 minutes for deployment

**✅ Write down your URL**: `https://accentrix-backend-xxxxx.onrender.com`

---

### Step 5: Deploy AI Service to Render (8 minutes)

1. **Go to**: https://dashboard.render.com/
2. **Click**: "New +" → "Web Service"
3. **Connect** same repository
4. **Find** `accentrix` repository → Click "Connect"

**Configure AI Service:**
- **Name**: `accentrix-ai`
- **Region**: Same as backend
- **Root Directory**: `ai-service`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Branch**: `main`
- **Plan**: **Free** ⭐ (Mock mode works on free!)

**Add Environment Variables**:
```
PORT = 10000
ANALYSIS_MODE = mock
DEBUG = false
```

5. **Click**: "Create Web Service"
6. **Wait**: 5-10 minutes for first deployment (downloads all packages)

**✅ Write down your URL**: `https://accentrix-ai-xxxxx.onrender.com`

---

### Step 6: Update Backend with AI Service URL (2 minutes)

1. Go back to your **Backend** service on Render
2. Click **"Environment"** tab on the left
3. Find `AI_SERVICE_URL` variable
4. Update it with your AI service URL: `https://accentrix-ai-xxxxx.onrender.com`
5. Click **"Save Changes"**
6. Wait for auto-redeploy (~2 minutes)

---

### Step 7: Update Frontend with Backend URL (3 minutes)

Create a file `.env.production` in your project root:

```env
VITE_API_URL=https://accentrix-backend-xxxxx.onrender.com
```

Deploy updated frontend:
```bash
vercel --prod
```

---

### Step 8: Test Your Live App! (5 minutes)

1. **Open**: Your Vercel URL in browser
2. **Register**: Create a new account
3. **Test TTS**: 
   - Go to Practice page
   - Click "Listen to Native Pronunciation"
   - ✅ Should hear voice!

4. **Test Recording**:
   - Click microphone
   - Say the phrase
   - Stop recording
   - ✅ Should see analysis with scores!

5. **Check Progress**:
   - Go to Progress page
   - ✅ Should see your session!

---

## 🎉 You're Live!

Your URLs:
- **Frontend**: `https://accentrix-xxxxx.vercel.app`
- **Backend**: `https://accentrix-backend-xxxxx.onrender.com`
- **AI Service**: `https://accentrix-ai-xxxxx.onrender.com`

---

## ⚠️ Important Notes (Free Tier Limitations)

1. **Services spin down after 15 min inactivity**
   - First request takes ~30 seconds to wake up
   - Subsequent requests are fast

2. **Mock pronunciation scores**
   - Scores are random (for demo purposes)
   - Still shows off your full-stack skills!

3. **All other features work perfectly**:
   - ✅ TTS voices (native pronunciation)
   - ✅ Recording
   - ✅ User authentication
   - ✅ Progress tracking
   - ✅ Beautiful UI

---

## 📱 Share Your Project!

Add to your:
- **Portfolio**: "Full-stack AI pronunciation coach"
- **Resume**: "React + Node.js + Python + Whisper AI"
- **LinkedIn**: "Just deployed my AI pronunciation app!"
- **GitHub**: Pin the repository

Example description:
```
🎙️ Accentrix - AI Pronunciation Coach

Full-stack web app helping language learners improve pronunciation.

Tech Stack:
• Frontend: React, Vite, Custom Audio Recording Hook
• Backend: Node.js, Express, MongoDB, JWT Auth
• AI Service: Python, FastAPI, OpenAI Whisper, Edge TTS
• Deployment: Vercel + Render

Features:
✓ Multi-language TTS with native voices
✓ Real-time pronunciation analysis
✓ Progress tracking & session history
✓ Custom text practice mode
✓ PWA support

Live Demo: [Your Vercel URL]
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Wait 30 seconds (service waking up from sleep)
- Check backend logs on Render dashboard

### TTS not working
- Check AI service logs
- Verify it's running on Render dashboard

### CORS errors
- Update `FRONTEND_URL` in backend environment
- Make sure it exactly matches your Vercel URL

### Need to update something?
```bash
# Update code
git add .
git commit -m "Update something"
git push

# Frontend will auto-deploy via Vercel
# Backend/AI will auto-deploy via Render
```

---

## 🎯 Next Steps

Now that it's live:
1. Share on LinkedIn
2. Add to portfolio
3. Add to resume
4. Show to potential employers
5. Get feedback from users

Want real AI later? Just upgrade AI service to Starter plan ($7/month) and change `ANALYSIS_MODE=whisper`!

---

## 💪 You Did It!

You've successfully deployed a full-stack AI application! 🚀

Cost: **$0/month**
Time invested: ~30 minutes
Result: Professional portfolio piece! ✨
