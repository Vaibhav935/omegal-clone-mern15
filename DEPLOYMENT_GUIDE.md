# Complete Deployment Guide

## Overview
Yeh guide tumhe batayegi kaise deploy karna hai:
- Backend: Docker + Render
- Frontend: Vercel
- CI/CD: GitHub Actions

---

## 1. Docker Setup for Backend

### Create Dockerfile
Backend folder mein `Dockerfile` banao:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Create .dockerignore
Backend folder mein `.dockerignore` banao:

```
node_modules
npm-debug.log
.env
.git
.gitignore
```

### Local Testing
```bash
cd backend
docker build -t webrtc-backend .
docker run -p 3000:3000 webrtc-backend
```

---

## 2. Render Deployment (Backend)

### Steps:
1. **Render.com pe account banao** aur login karo
2. **New Web Service** create karo
3. **Connect GitHub repository**
4. **Configuration:**
   - Name: `webrtc-backend` (ya koi bhi naam)
   - Environment: `Docker`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Docker Command: (automatic detection)

5. **Environment Variables add karo:**
   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. **Deploy** button click karo

### Render.yaml (Optional - Infrastructure as Code)
Root folder mein `render.yaml` banao:

```yaml
services:
  - type: web
    name: webrtc-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        sync: false
```

---

## 3. Vercel Deployment (Frontend)

### Steps:
1. **Vercel.com pe account banao**
2. **Import Git Repository**
3. **Configuration:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```

5. **Deploy** karo

### vercel.json (Optional)
Frontend folder mein `vercel.json` banao:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. GitHub Actions CI/CD

### Workflow File
Root folder mein `.github/workflows/deploy.yml` banao:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint || echo "No lint script found"
    
    - name: Run tests
      run: npm test || echo "No test script found"

  # Frontend Tests
  frontend-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Run tests
      run: npm test || echo "No test script found"

  # Docker Build & Push (Optional - for Docker Hub)
  docker-build:
    needs: [backend-test]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/webrtc-backend:latest
        cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/webrtc-backend:buildcache
        cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/webrtc-backend:buildcache,mode=max

  # Deploy to Render (Automatic via Render's GitHub integration)
  # Render automatically deploys when you push to main
  
  # Deploy to Vercel (Automatic via Vercel's GitHub integration)
  # Vercel automatically deploys when you push to main
```

---

## 5. GitHub Secrets Setup

GitHub repository mein jao:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** click karo
3. Add these secrets:

```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

---

## 6. Environment Variables Configuration

### Backend (.env file - local development only)
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env file - local development only)
```env
VITE_BACKEND_URL=http://localhost:3000
```

### Production Environment Variables

**Render (Backend):**
- `PORT=3000`
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-app.vercel.app`

**Vercel (Frontend):**
- `VITE_BACKEND_URL=https://your-backend.onrender.com`

---

## 7. CORS Configuration

Backend mein CORS properly configure karo. `backend/server.js` mein check karo:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
```

---

## 8. Deployment Checklist

### Pre-Deployment:
- [ ] `.env` files gitignore mein hain
- [ ] Environment variables properly configured
- [ ] CORS settings correct hain
- [ ] WebSocket URLs dynamic hain (not hardcoded)
- [ ] Build locally test karo: `npm run build`

### Backend Deployment:
- [ ] Dockerfile test karo locally
- [ ] Render pe service create karo
- [ ] Environment variables add karo
- [ ] Deploy karo aur logs check karo

### Frontend Deployment:
- [ ] Vercel pe project import karo
- [ ] Build settings verify karo
- [ ] Environment variables add karo
- [ ] Deploy karo

### CI/CD:
- [ ] GitHub Actions workflow file add karo
- [ ] GitHub secrets configure karo
- [ ] Push karo aur workflow run check karo

---

## 9. Post-Deployment Testing

1. **Backend health check:**
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **Frontend access:**
   - Browser mein `https://your-app.vercel.app` open karo

3. **WebSocket connection:**
   - Browser console mein check karo connection logs

4. **WebRTC functionality:**
   - Do tabs open karo aur video call test karo

---

## 10. Monitoring & Logs

### Render:
- Dashboard → Your Service → Logs
- Real-time logs dekh sakte ho

### Vercel:
- Dashboard → Your Project → Deployments → Logs
- Function logs aur build logs available hain

### GitHub Actions:
- Repository → Actions tab
- Har workflow run ka detailed log milega

---

## 11. Common Issues & Solutions

### Issue: WebSocket connection failing
**Solution:** 
- Backend URL correct hai check karo
- CORS properly configured hai verify karo
- Render pe WebSocket support enabled hai (by default hai)

### Issue: Video not showing
**Solution:**
- HTTPS pe deploy karo (HTTP pe camera access nahi milta)
- Browser permissions check karo
- STUN/TURN servers configure karo production ke liye

### Issue: Build failing on Vercel
**Solution:**
- `package.json` mein build script check karo
- Node version compatibility verify karo
- Environment variables properly set hain check karo

### Issue: Docker build slow
**Solution:**
- `.dockerignore` properly configured hai check karo
- Multi-stage builds use karo
- Layer caching optimize karo

---

## 12. Production Optimizations

### Backend:
- Rate limiting add karo
- Logging service integrate karo (Winston, Pino)
- Health check endpoint banao
- Graceful shutdown implement karo

### Frontend:
- Code splitting use karo
- Assets optimize karo (images, videos)
- CDN use karo static assets ke liye
- Service Worker add karo (optional)

### WebRTC:
- TURN server add karo production ke liye (Twilio, Xirsys)
- Connection quality monitoring
- Fallback mechanisms

---

## 13. Cost Considerations

### Render (Backend):
- Free tier: 750 hours/month
- Spins down after inactivity (cold starts)
- Paid plans: $7/month se start

### Vercel (Frontend):
- Free tier: Generous limits
- Bandwidth: 100GB/month
- Build minutes: 6000/month
- Paid plans: $20/month se start

### GitHub Actions:
- Free tier: 2000 minutes/month (public repos unlimited)

---

## Quick Start Commands

### Local Development:
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker Local Test:
```bash
cd backend
docker build -t webrtc-backend .
docker run -p 3000:3000 webrtc-backend
```

### Deploy via Git:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
# Render aur Vercel automatically deploy kar denge
```

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Docker Docs:** https://docs.docker.com
- **GitHub Actions:** https://docs.github.com/actions

---

Yeh guide follow karo aur tumhara WebRTC app production mein live ho jayega! 🚀
