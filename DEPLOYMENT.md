# Deployment Guide - AI English Coach API

## Overview

This guide covers the deployment of the AI English Coach backend API to Render's free tier. The application provides comprehensive English sentence analysis using Google Gemini 2.0 Flash API.

**Last Updated**: 2025-09-05 23:31:35 (Thailand Time)

## Architecture

- **Platform**: Render Free Tier (Serverless Functions)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **AI Provider**: Google Gemini 2.0 Flash API
- **Payment**: Stripe Integration
- **Runtime**: Node.js 18+

## Prerequisites

### Required Environment Variables

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Stripe Payment
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_key
STRIPE_SECRET_KEY=sk_live_or_test_key

# Optional
NODE_ENV=production
```

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project or use existing
   - Enable Firestore Database
   - Enable Authentication

2. **Configure Firestore Security Rules**
   ```javascript
   // Deploy the rules from firestore.rules file
   firebase deploy --only firestore:rules
   ```

3. **Set up Firebase Admin SDK**
   - Generate service account key
   - Add to Render environment variables

## Deployment Steps

### 1. Render Configuration

**render.yaml** is already configured with:
- Build command: `npm install`
- Start command: `node server.js`
- Node.js 18 runtime
- Health check endpoint: `/api/health`

### 2. Environment Variables Setup

In Render Dashboard:
1. Go to your service settings
2. Navigate to "Environment" tab
3. Add all required environment variables
4. Ensure sensitive keys are properly secured

### 3. Database Indexes

Firestore requires indexes for complex queries. Deploy these indexes:

```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Required indexes:
- `credit_transactions`: `userId` (ascending) + `createdAt` (descending)
- `sentences`: `userId` (ascending) + `createdAt` (descending)
- `sentences`: `userId` (ascending) + `status` (ascending)

### 4. Health Check

The API includes a health check endpoint:
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-05T16:31:35.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "ai": "available"
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Sentences
- `POST /api/sentences/create` - Create new sentence
- `GET /api/sentences/list` - List user sentences
- `GET /api/sentences/get/:id` - Get specific sentence
- `PUT /api/sentences/update/:id` - Update sentence
- `DELETE /api/sentences/delete/:id` - Delete sentence
- `POST /api/sentences/analyze` - AI analysis

### Credits
- `GET /api/credits/balance` - Get credit balance
- `GET /api/credits/history` - Get transaction history

### AI Analysis
- `POST /api/ai/gemini` - Direct Gemini API access

### Health
- `GET /api/health` - Service health check

## Testing

### Running Tests

```bash
# Install dependencies
npm install

# Run test suite
npm test

# Run with coverage
npm run test:coverage
```

### Test Configuration

Tests use Jest with:
- Firebase Admin SDK mocking
- Google Generative AI mocking
- Supertest for API testing
- Custom setup file for environment

## Monitoring

### Logs

Render provides built-in logging. Monitor:
- API response times
- Error rates
- Firebase connection status
- Gemini API usage

### Performance

- **Cold Start**: ~2-3 seconds (Render free tier)
- **Response Time**: <500ms for most endpoints
- **AI Analysis**: 3-8 seconds depending on complexity

## Security

### Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Firebase Rules**: Restrict access to user's own data
3. **API Rate Limiting**: Implement in production
4. **CORS**: Configured for mobile app domains
5. **Authentication**: JWT token validation on all protected routes

### Security Headers

```javascript
// Already implemented in server.js
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify environment variables
   - Check Firebase project settings
   - Ensure service account permissions

2. **Gemini API Errors**
   - Verify API key validity
   - Check quota limits
   - Monitor rate limiting

3. **Deployment Failures**
   - Check build logs in Render
   - Verify package.json dependencies
   - Ensure Node.js version compatibility

### Debug Commands

```bash
# Check service status
curl https://your-app.onrender.com/api/health

# Test authentication
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Scaling Considerations

### Render Free Tier Limitations

- **Sleep Mode**: Service sleeps after 15 minutes of inactivity
- **Build Minutes**: 500 minutes per month
- **Bandwidth**: 100GB per month
- **Memory**: 512MB RAM

### Upgrade Path

1. **Render Starter Plan**: $7/month
   - No sleep mode
   - More build minutes
   - Better performance

2. **Production Optimizations**
   - Implement Redis caching
   - Add CDN for static assets
   - Database connection pooling
   - API rate limiting

## Support

For deployment issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints manually
4. Review Firebase console for errors

---

**Deployment Checklist**:
- [ ] Environment variables configured
- [ ] Firebase project setup
- [ ] Firestore rules deployed
- [ ] Database indexes created
- [ ] Health check responding
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] AI analysis functional
- [ ] Payment system tested

## Overview

This guide covers deploying the AI English Coach backend API to Render's free tier.

## Prerequisites

- GitHub repository with the codebase
- Render account (free tier)
- Firebase project with Firestore enabled
- Google Gemini API key
- Stripe account (for payment processing)

## Environment Variables

The following environment variables must be configured in Render:

### Firebase Configuration
```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### AI Integration
```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### Payment Processing
```
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### Application Settings
```
NODE_ENV=production
PORT=3000
```

## Deployment Steps

### 1. Prepare Repository

Ensure your repository contains:
- `render.yaml` - Render configuration
- `server.js` - Production server
- `package.json` - Dependencies and scripts
- All API endpoints in `/api` directory

### 2. Create Render Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `oeng-app-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Plan**: `Free`

### 3. Configure Environment Variables

In the Render dashboard:
1. Go to your service settings
2. Navigate to "Environment" tab
3. Add all required environment variables listed above

### 4. Set Health Check

- **Health Check Path**: `/api/health`
- **Health Check Timeout**: 30 seconds

### 5. Deploy

1. Push your code to the main branch:
   ```bash
   git add .
   git commit -m "feat: add production deployment configuration"
   git push origin main
   ```

2. Render will automatically deploy your service

## Verification

### Health Check
Once deployed, verify the service is running:
```bash
curl https://your-service-url.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-25T10:30:00.000Z",
  "thailandTime": "25/01/2568 17:30:00",
  "services": {
    "firebase": {
      "status": "connected",
      "error": null
    },
    "environment": {
      "status": "configured",
      "variables": {
        "NODE_ENV": "production",
        "FIREBASE_PROJECT_ID": "set",
        "FIREBASE_PRIVATE_KEY": "set",
        "FIREBASE_CLIENT_EMAIL": "set",
        "GOOGLE_GENERATIVE_AI_API_KEY": "set"
      }
    }
  },
  "version": "1.0.0",
  "deployment": {
    "platform": "render",
    "region": "oregon",
    "service": "oeng-app-api"
  }
}
```

### API Endpoints
Test key endpoints:

1. **Root endpoint**:
   ```bash
   curl https://your-service-url.onrender.com/
   ```

2. **Authentication**:
   ```bash
   curl -X POST https://your-service-url.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## Monitoring

### Render Dashboard
- Monitor service health and logs in Render dashboard
- Check deployment history and build logs
- Monitor resource usage (free tier limitations)

### Firebase Console
- Monitor Firestore usage and performance
- Check authentication metrics
- Review security rules and access patterns

### Error Tracking
- Check Render logs for application errors
- Monitor Firebase logs for database issues
- Review API response times and error rates

## Troubleshooting

### Common Issues

1. **Service won't start**:
   - Check build logs in Render dashboard
   - Verify all environment variables are set
   - Ensure `package.json` scripts are correct

2. **Firebase connection errors**:
   - Verify Firebase credentials are correct
   - Check Firebase project permissions
   - Ensure Firestore is enabled

3. **API errors**:
   - Check service logs for detailed error messages
   - Verify CORS configuration
   - Test endpoints individually

### Free Tier Limitations

- **Sleep after 15 minutes of inactivity**
- **750 hours per month** (sufficient for development)
- **Cold start delays** (first request after sleep)
- **Limited bandwidth and compute**

### Performance Optimization

1. **Keep service warm**:
   - Implement periodic health checks
   - Use external monitoring services

2. **Optimize cold starts**:
   - Minimize dependencies
   - Use efficient initialization

3. **Cache frequently used data**:
   - Implement in-memory caching
   - Use Firebase caching strategies

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to repository
   - Use Render's environment variable management
   - Rotate keys regularly

2. **Firebase Security**:
   - Configure proper Firestore security rules
   - Use Firebase Admin SDK for server operations
   - Monitor authentication patterns

3. **API Security**:
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only

## Maintenance

### Regular Tasks

1. **Monitor service health**
2. **Update dependencies** (security patches)
3. **Review logs** for errors and performance issues
4. **Monitor Firebase usage** and costs
5. **Test API endpoints** regularly

### Scaling Considerations

When ready to scale beyond free tier:
- Upgrade to Render paid plans
- Consider Firebase pricing tiers
- Implement proper monitoring and alerting
- Add load balancing and redundancy

## Support

For issues and questions:
- Check Render documentation
- Review Firebase documentation
- Consult project repository issues
- Contact development team