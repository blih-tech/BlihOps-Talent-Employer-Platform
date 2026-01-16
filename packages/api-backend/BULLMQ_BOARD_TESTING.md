# BullMQ Board Testing Guide

## ✅ Server Status

The API backend server is running and BullMQ Board is accessible.

- **Server URL**: http://localhost:3000
- **BullMQ Board URL**: http://localhost:3000/admin/queues
- **Health Check**: http://localhost:3000/api/v1/health

## 🧪 Manual Testing Steps

### 1. Access BullMQ Board (Development Mode)

Since we're in development mode without `JWT_SECRET` set, the board should be accessible without authentication (with a console warning).

**Steps:**
1. Open your browser
2. Navigate to: `http://localhost:3000/admin/queues`
3. You should see the Bull Dashboard UI

**Expected Result:**
- ✅ Bull Dashboard loads successfully
- ✅ All three queues are visible:
  - `publish-talent`
  - `publish-job`
  - `notify-talent`
- ⚠️ Console warning in server logs: "BullMQ Board is accessible without authentication in development mode"

### 2. Verify Queue Visibility

**Check:**
- [ ] All three queues appear in the dashboard
- [ ] Queue names are correct:
  - `publish-talent`
  - `publish-job`
  - `notify-talent`
- [ ] Each queue shows:
  - Waiting jobs count
  - Active jobs count
  - Completed jobs count
  - Failed jobs count
  - Delayed jobs count

### 3. Test Queue Operations (Optional)

If you want to test adding jobs to queues:

**Using curl:**
```bash
# This would require the queue processors to be implemented
# For now, we're just testing the UI visibility
```

### 4. Test Authentication (With JWT_SECRET)

To test the authentication middleware:

1. **Set JWT_SECRET in .env:**
   ```bash
   JWT_SECRET=your-secret-key-for-testing
   ```

2. **Restart the server**

3. **Try accessing without token:**
   ```bash
   curl http://localhost:3000/admin/queues
   ```
   **Expected:** 401 Unauthorized response

4. **Try accessing with invalid token:**
   ```bash
   curl -H "Authorization: Bearer invalid-token" http://localhost:3000/admin/queues
   ```
   **Expected:** 401 Unauthorized - Invalid token

5. **Try accessing with valid JWT token (when auth is implemented):**
   ```bash
   # First, get a token from /api/v1/auth/login
   # Then use it:
   curl -H "Authorization: Bearer <your-jwt-token>" http://localhost:3000/admin/queues
   ```
   **Expected:** Bull Dashboard loads (if token has admin role)

### 5. Browser Testing

**Recommended browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Test:**
1. Open browser developer tools (F12)
2. Navigate to Network tab
3. Access `http://localhost:3000/admin/queues`
4. Check:
   - [ ] No CORS errors
   - [ ] All static assets load (CSS, JS)
   - [ ] Dashboard renders correctly
   - [ ] Queues are visible and clickable

### 6. Verify Server Logs

Check the server console output for:
- ✅ "✅ BullMQ Board is available at: /admin/queues"
- ⚠️ Warning about authentication (if JWT_SECRET not set)
- ❌ Any error messages

## 📋 Testing Checklist

### Basic Functionality
- [x] Server starts successfully
- [x] BullMQ Board endpoint is accessible
- [ ] Bull Dashboard UI loads in browser
- [ ] All three queues are visible
- [ ] Queue statistics display correctly

### Authentication (Development Mode)
- [x] Board accessible without JWT_SECRET (development mode)
- [ ] Console warning appears (check server logs)
- [ ] Board accessible with valid JWT token (when auth implemented)
- [ ] Board rejects invalid tokens (when JWT_SECRET set)

### UI/UX
- [ ] Dashboard is responsive
- [ ] Queue names are readable
- [ ] Job counts display correctly
- [ ] Navigation works (if multiple pages)
- [ ] No console errors in browser

## 🐛 Troubleshooting

### Issue: Board not accessible
**Solution:**
- Check if server is running: `curl http://localhost:3000/api/v1/health`
- Check server logs for errors
- Verify Redis is running: `docker-compose -f docker-compose.dev.yml ps`

### Issue: Queues not visible
**Solution:**
- Verify QueueModule is imported in AppModule
- Check that queues are registered in QueueModule
- Verify Redis connection is working

### Issue: Authentication errors
**Solution:**
- In development: Remove or comment out JWT_SECRET to allow access
- In production: Ensure JWT_SECRET is set and valid tokens are used
- Check token format: `Authorization: Bearer <token>`

## 📝 Notes

- **Current Status**: BullMQ Board is set up and accessible
- **Authentication**: Express middleware implemented (temporary solution)
- **Future**: Will be replaced with NestJS guards when JwtAuthGuard and RolesGuard are implemented

## 🎯 Next Steps

After UI testing is complete:
1. Mark Subtask 4.1.3 as fully complete
2. Proceed to Task 4.2: Worker Implementation
3. Implement queue processors (Publish Talent, Publish Job, Notify Talent)



