# 🚀 Deployment Guide - Make Accentrix Public

## 📋 Deployment Options

### Option 1: Recommended (Best Performance) ⭐
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **AI Service**: Render (Paid $7/month) OR Railway (Has free trial)

### Option 2: Budget (Free but Limited)
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **AI Service**: Use Mock Mode (no real AI, just demos)

### Option 3: Full Control
- **Everything**: AWS EC2 / DigitalOcean ($5/month)

---

## 🎯 Option 1: Vercel + Render (RECOMMENDED)

### Step 1: Deploy Frontend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy Frontend**:
   ```bash
   vercel --prod
   ```

4. **Note your URL**: e.g., `https://accentrix.vercel.app`

### Step 2: Deploy Backend to Render

1. **Go to**: https://render.com/
2. **Sign up/Login** with GitHub
3. **Connect your GitHub repository**
4. **Create New Web Service**:
   - **Name**: `accentrix-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_random_secret_key_here
   AI_SERVICE_URL=https://accentrix-ai.onrender.com
   FRONTEND_URL=https://accentrix.vercel.app
   ```

6. **Deploy** and note your URL: e.g., `https://accentrix-backend.onrender.com`

### Step 3: Deploy AI Service to Render (Paid Plan)

**⚠️ Note**: Whisper requires ~500MB RAM and persistent storage. Free tier won't work well.

1. **Create New Web Service**:
   - **Name**: `accentrix-ai`
   - **Root Directory**: `ai-service`
   - **Environment**: Python 3.10
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Starter ($7/month) - Has enough RAM for Whisper

2. **Add Environment Variables**:
   ```
   PORT=10000
   ANALYSIS_MODE=whisper
   DEBUG=false
   ```

3. **Deploy** and note your URL: e.g., `https://accentrix-ai.onrender.com`

### Step 4: Update Frontend Environment

Update your frontend to point to production backend:

Create `.env.production` in root:
```env
VITE_API_URL=https://accentrix-backend.onrender.com
```

Redeploy frontend:
```bash
vercel --prod
```

### Step 5: Update Backend Environment

Go back to Render Backend settings and update:
```
AI_SERVICE_URL=https://accentrix-ai.onrender.com
```

---

## 🆓 Option 2: Free Deployment (Mock Mode Only)

If you don't want to pay for AI service, you can deploy with mock analysis:

### Deploy AI Service in Mock Mode (Free)

1. Update `ai-service/.env`:
   ```env
   ANALYSIS_MODE=mock
   ```

2. Deploy to Render Free tier:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Limitations**:
- ❌ No real speech recognition
- ❌ Random scores (for demo purposes)
- ✅ TTS voices still work (Edge TTS is free)
- ✅ Good for portfolio/demo

---

## 🔧 Option 3: Full Control with VPS

### Deploy Everything on One Server

**Choose a provider:**
- DigitalOcean Droplet ($6/month)
- AWS EC2 t2.micro ($8/month)
- Linode ($5/month)

**Requirements:**
- Ubuntu 20.04+
- 2GB RAM minimum
- 20GB storage

### Setup Script:

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y python3.10 python3-pip nodejs npm nginx

# 2. Clone your repository
git clone https://github.com/yourusername/accentrix.git
cd accentrix

# 3. Install AI Service
cd ai-service
pip3 install -r requirements.txt
# Run with: uvicorn main:app --host 0.0.0.0 --port 8000

# 4. Install Backend
cd ../backend
npm install
# Run with: npm start

# 5. Build Frontend
cd ..
npm install
npm run build
# Serve with Nginx

# 6. Setup Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/accentrix
```

**Nginx Config**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/accentrix/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Cost Comparison

| Option | Cost/Month | Performance | Setup Difficulty |
|--------|-----------|-------------|------------------|
| Vercel + Render (Mock) | $0 | Demo only | Easy ⭐ |
| Vercel + Render (Whisper) | $7 | Good | Easy ⭐ |
| VPS (DigitalOcean) | $6 | Excellent | Medium ⭐⭐ |
| AWS (Full) | $15+ | Excellent | Hard ⭐⭐⭐ |

---

## ⚡ Quick Deploy (5 Minutes)

**For fastest deployment (Mock mode):**

1. **Frontend**:
   ```bash
   vercel --prod
   ```

2. **Backend**: Push to GitHub, connect to Render

3. **AI Service**: Deploy to Render with `ANALYSIS_MODE=mock`

4. **Done!** Share your Vercel URL

---

## 🔐 Important Security Notes

Before deploying:

1. **Change MongoDB credentials** in `.env` files
2. **Generate strong JWT_SECRET**: 
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Don't commit `.env` files** to GitHub
4. **Set environment variables** in hosting dashboard

---

## 🧪 Testing Deployment

After deployment, test:

1. ✅ Frontend loads at your Vercel URL
2. ✅ Can register/login
3. ✅ "Listen" button plays voice (TTS)
4. ✅ Can record and get analysis
5. ✅ Progress tracking works

---

## 📞 Need Help?

Common issues:
- **CORS errors**: Update `FRONTEND_URL` in backend
- **API not connecting**: Check `AI_SERVICE_URL` in backend
- **TTS not working**: Restart AI service
- **Whisper fails**: Upgrade to paid plan (needs more RAM)

---

Which option do you want to use? I recommend **Option 1** for best results!
