# Deployment Guide for Flow Focus Tool

## Prerequisites
1. MongoDB Atlas account (free tier works)
2. Cloudinary account
3. Google Cloud Console account
4. GitHub account with OAuth app
5. Vercel account (for frontend)
6. Render/Railway/Heroku account (for backend)

---

## Step 1: Setup OAuth Applications

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Flow Focus Tool
   - User support email: your-email@example.com
   - Authorized domains: Add your production domain
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: Flow Focus Tool
   - Authorized JavaScript origins:
     - `https://your-frontend-domain.vercel.app`
   - Authorized redirect URIs:
     - `https://your-backend-domain.onrender.com/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback` (for testing)
7. Copy Client ID and Client Secret

### GitHub OAuth Setup
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: Flow Focus Tool
   - Homepage URL: `https://your-frontend-domain.vercel.app`
   - Authorization callback URL: `https://your-backend-domain.onrender.com/api/auth/github/callback`
4. Click "Register application"
5. Copy Client ID and generate Client Secret

---

## Step 2: Deploy Backend (Render/Railway)

### Using Render.com (Recommended - Free Tier Available)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `flow-focus-tool`

2. **Configure Service**
   - Name: `flow-focus-tool-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables** (Add these in Render dashboard)
   ```
   NODE_ENV=production
   PORT=5000
   
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flow-focus-tool
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key
   
   # URLs
   SERVER_URL=https://your-backend-domain.onrender.com
   CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
   
   # Turnstile (Optional)
   TURNSTILE_SECRET_KEY=your-turnstile-secret-if-using
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL: `https://your-app-name.onrender.com`

---

## Step 3: Deploy Frontend (Vercel)

### Using Vercel

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `flow-focus-tool`

2. **Configure Project**
   - Framework Preset: Vite
   - Root Directory: `./` (leave as root)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables** (Add these in Vercel project settings)
   ```
   VITE_API_URL=https://your-backend-domain.onrender.com/api
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key-if-using
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL: `https://your-app-name.vercel.app`

---

## Step 4: Update OAuth Callback URLs

### Update Google OAuth
1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth client
3. Update Authorized redirect URIs:
   - Replace localhost with your production backend URL
   - Should be: `https://your-backend-domain.onrender.com/api/auth/google/callback`

### Update GitHub OAuth
1. Go back to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Select your app
3. Update Authorization callback URL:
   - Replace localhost with your production backend URL
   - Should be: `https://your-backend-domain.onrender.com/api/auth/github/callback`

---

## Step 5: MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster
   - Choose a region close to your backend

2. **Database Access**
   - Create database user with password
   - Note the username and password

3. **Network Access**
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Render/Vercel to connect

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this as `MONGODB_URI` in backend environment variables

---

## Step 6: Cloudinary Setup

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to backend environment variables

---

## Step 7: Verification

### Test the Deployment

1. **Frontend Check**
   - Visit `https://your-app-name.vercel.app`
   - Should see login page
   - Check browser console for errors

2. **Backend Health Check**
   - Visit `https://your-backend-domain.onrender.com/health`
   - Should return: `{"status": "ok"}`

3. **OAuth Login Test**
   - Click "Continue with Google"
   - Should redirect to Google
   - After authorization, should redirect back and log you in
   - Check if JWT token is set in localStorage

4. **Full Flow Test**
   - Login successfully
   - Navigate to Practice page
   - Record audio/video
   - Save and analyze
   - Check History page
   - Check Settings page

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_ORIGIN` in backend matches your frontend URL exactly
   - No trailing slashes

2. **OAuth Redirect Issues**
   - Verify callback URLs match exactly in OAuth provider settings
   - Check `SERVER_URL` environment variable
   - Ensure HTTPS is used in production

3. **MongoDB Connection Failed**
   - Verify IP whitelist includes 0.0.0.0/0
   - Check connection string format
   - Ensure password is URL-encoded if it contains special characters

4. **API Calls Failing**
   - Check `VITE_API_URL` includes `/api` suffix
   - Verify backend is running (check Render logs)
   - Check CORS settings in backend

5. **Render Free Tier Sleep**
   - Free tier backends sleep after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - Consider upgrading for production use

---

## Environment Variables Checklist

### Backend (.env)
- [ ] NODE_ENV=production
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GITHUB_CLIENT_ID
- [ ] GITHUB_CLIENT_SECRET
- [ ] GEMINI_API_KEY
- [ ] SERVER_URL
- [ ] CLIENT_ORIGIN

### Frontend (.env)
- [ ] VITE_API_URL
- [ ] VITE_GEMINI_API_KEY

---

## Post-Deployment

1. **Monitor Logs**
   - Render: Check logs in dashboard
   - Vercel: Check function logs

2. **Set Up Custom Domain** (Optional)
   - In Vercel, add custom domain
   - Update OAuth redirect URLs

3. **Enable Analytics** (Optional)
   - Add Vercel Analytics
   - Add monitoring service

4. **Backup Strategy**
   - MongoDB Atlas has automatic backups
   - Consider export strategy for important data

---

## Quick Reference URLs

- **Frontend**: https://your-app-name.vercel.app
- **Backend**: https://your-backend-domain.onrender.com
- **Google Console**: https://console.cloud.google.com/
- **GitHub OAuth**: https://github.com/settings/developers
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Cloudinary**: https://cloudinary.com/console
- **Render Dashboard**: https://dashboard.render.com/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Cost Breakdown (Free Tier)

- **Vercel**: Free (with limits)
- **Render**: Free tier with sleep
- **MongoDB Atlas**: Free tier (512MB)
- **Cloudinary**: Free tier (25GB storage)
- **Gemini API**: Free tier with limits

**Total**: $0/month for hobby projects

For production, consider paid tiers for better performance and reliability.
