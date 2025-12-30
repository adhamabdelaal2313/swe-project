# Production Deployment Checklist

## ✅ Build Status
- **Frontend**: ✅ Build successful (no TypeScript errors)
- **Backend**: ✅ Syntax validated (no errors)
- **Linting**: ✅ No linting errors

## 📋 Pre-Deployment Checklist

### Frontend (Vercel)
- [x] Build completes successfully
- [x] TypeScript compilation passes
- [ ] Set environment variable: `VITE_API_URL` (Railway backend URL)
  - Example: `https://your-app.up.railway.app`
  - This should be your Railway backend URL without trailing slash

### Backend (Railway)
- [x] Syntax validation passes
- [ ] Set environment variables:
  - `DATABASE_URL` - MySQL connection string from Railway
  - `FRONTEND_URL` - Vercel frontend URL (for CORS)
    - Example: `https://your-app.vercel.app`
    - Can include multiple URLs separated by commas
  - `JWT_SECRET` - Secret key for JWT tokens (optional, has default)
  - `NODE_ENV` - Set to `production`

### Database (Railway MySQL)
- [ ] Run `schema.sql` to create tables
- [ ] Verify tables exist: `users`, `teams`, `team_members`, `tasks`, `activities`

## 🚀 Deployment Steps

### 1. Deploy Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set root directory to `backend`
3. Set start command: `npm start`
4. Add environment variables (see above)
5. Deploy and note the URL

### 2. Deploy Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = Your Railway backend URL
6. Deploy

### 3. Update CORS Settings
1. In Railway backend, update `FRONTEND_URL` to include your Vercel URL
2. Restart the backend service

## ⚠️ Known Warnings (Non-Critical)

### Frontend Build Warning
- **Chunk size warning**: Main bundle is ~673 KB (gzipped: ~196 KB)
  - This is acceptable for production
  - Consider code-splitting if performance becomes an issue
  - Current size is within reasonable limits

## 🔍 Post-Deployment Verification

1. **Frontend loads**: Check Vercel deployment URL
2. **API connection**: Check browser console for API config logs
3. **Login works**: Test user authentication
4. **CORS**: Verify no CORS errors in browser console
5. **Database**: Verify data persists correctly

## 📝 Environment Variables Summary

### Railway (Backend)
```
DATABASE_URL=mysql://user:pass@host:port/database
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-secret-key-here (optional)
NODE_ENV=production
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-app.up.railway.app
```

## ✅ All Systems Ready for Production!

