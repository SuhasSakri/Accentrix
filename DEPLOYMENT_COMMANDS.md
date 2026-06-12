# 📋 Deployment Commands - Copy & Paste

## Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Accentrix - AI Pronunciation Coach"
git remote add origin https://github.com/YOUR_USERNAME/accentrix.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Frontend
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Step 3: Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Update Frontend (After Backend is Live)
Create `.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

Then:
```bash
vercel --prod
```

## Step 5: Update Code Later
```bash
git add .
git commit -m "Your update message"
git push
```

Everything auto-deploys after push! 🚀

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com/
- MongoDB Atlas: https://cloud.mongodb.com/

---

## 📝 URLs to Save

```
Frontend: https://_____________.vercel.app
Backend:  https://_____________.onrender.com
AI:       https://_____________.onrender.com
GitHub:   https://github.com/_____________/accentrix
```
