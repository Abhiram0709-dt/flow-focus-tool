# Pre-Deployment Checklist

## ✅ Before You Deploy

### 1. Generate Secrets
```bash
node generate-secrets.js
```
Save the generated JWT_SECRET and SESSION_SECRET for your environment variables.

### 2. Setup OAuth Apps

#### Google OAuth
- [ ] Create project in Google Cloud Console
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Note Client ID and Secret
- [ ] Add production callback URL

#### GitHub OAuth
- [ ] Create OAuth App in GitHub Settings
- [ ] Note Client ID and Secret  
- [ ] Add production callback URL

### 3. Setup Cloud Services

#### MongoDB Atlas
- [ ] Create free cluster
- [ ] Create database user
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Get connection string

#### Cloudinary
- [ ] Sign up for free account
- [ ] Note Cloud Name, API Key, API Secret

#### Google Gemini AI
- [ ] Get API key from Google AI Studio
- [ ] Test API key with a simple request

### 4. Deploy Backend (Render/Railway)

- [ ] Create new web service
- [ ] Connect GitHub repository
- [ ] Set root directory to `server`
- [ ] Add all environment variables (see server/.env.production.example)
- [ ] Deploy and note the backend URL

### 5. Deploy Frontend (Vercel)

- [ ] Import GitHub repository
- [ ] Add environment variables (see .env.production.example)
- [ ] Update VITE_API_URL with your backend URL
- [ ] Deploy and note the frontend URL

### 6. Update OAuth Callbacks

#### Google
- [ ] Update authorized redirect URI with production backend URL
- [ ] Format: `https://your-backend.onrender.com/api/auth/google/callback`

#### GitHub  
- [ ] Update authorization callback URL
- [ ] Format: `https://your-backend.onrender.com/api/auth/github/callback`

### 7. Final Testing

- [ ] Visit your frontend URL
- [ ] Test Google OAuth login
- [ ] Test GitHub OAuth login
- [ ] Record a practice session (audio)
- [ ] Record a practice session (video)
- [ ] Check AI feedback generation
- [ ] Verify media upload to Cloudinary
- [ ] Check session history
- [ ] Test settings page
- [ ] Verify logout works

### 8. Production Considerations

- [ ] Add custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up backup strategy for MongoDB
- [ ] Review and optimize rate limits
- [ ] Enable HTTPS everywhere
- [ ] Update social OAuth app icons/branding

## 🚨 Common Issues

**CORS Errors**
- Ensure CLIENT_ORIGIN matches your frontend URL exactly
- No trailing slashes in URLs

**OAuth Redirect Loop**
- Check callback URLs are correct
- Verify SERVER_URL is set correctly
- Ensure HTTPS is used in production

**MongoDB Connection Failed**
- Whitelist IP: 0.0.0.0/0
- URL-encode special characters in password
- Check connection string format

**Render Free Tier Sleep**
- First request after 15min takes ~30 seconds
- Consider paid tier for production

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Frontend .env Example](./.env.production.example)
- [Backend .env Example](./server/.env.production.example)

## 🆘 Need Help?

1. Check deployment guide for detailed steps
2. Review Render/Vercel logs for errors
3. Test backend health: `https://your-backend.onrender.com/api/health`
4. Verify environment variables are set correctly
