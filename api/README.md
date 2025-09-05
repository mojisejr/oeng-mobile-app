# API Directory

This directory contains serverless functions for the Oeng mobile app backend.

## Structure

```
/api
  /auth          # Authentication endpoints
    login.ts     # User login endpoint
  /users         # User management endpoints
    profile.ts   # User profile CRUD operations
  /payments      # Payment processing endpoints
    stripe.ts    # Stripe payment integration
  /utils         # Utility functions
    response.ts  # Response helpers and types
  /middleware    # Middleware functions
    auth.ts      # Authentication middleware
```

## Deployment

These functions are designed to be deployed as serverless functions on Vercel or similar platforms.

### Vercel Deployment

1. Each `.ts` file in this directory becomes an API endpoint
2. File path determines the endpoint URL:
   - `/api/auth/login.ts` → `https://your-domain.com/api/auth/login`
   - `/api/users/profile.ts` → `https://your-domain.com/api/users/profile`

### Environment Variables

Make sure to set these environment variables in your deployment platform:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_key

# API Configuration
API_BASE_URL=https://your-domain.com/api
```

## Usage Examples

### Authentication

```typescript
// Login
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
```

### User Profile

```typescript
// Get user profile
const response = await fetch("/api/users/profile?id=123", {
  method: "GET",
  headers: {
    Authorization: "Bearer your_jwt_token",
  },
});
```

### Payments

```typescript
// Process payment
const response = await fetch("/api/payments/stripe", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your_jwt_token",
  },
  body: JSON.stringify({
    amount: 1000, // Amount in THB
    currency: "thb",
    paymentMethodId: "pm_card_visa",
  }),
});
```

## Development

### Local Testing

To test these functions locally, you can use Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

### Adding New Endpoints

1. Create a new `.ts` file in the appropriate subdirectory
2. Export a default function that handles the request
3. Use the utility functions from `/utils` for consistent responses
4. Add authentication middleware if needed

### Error Handling

All endpoints should use the standardized response format from `/utils/response.ts`:

```typescript
import { createSuccessResponse, createErrorResponse } from "../utils/response";

// Success response
return res
  .status(200)
  .json(createSuccessResponse(data, "Operation successful"));

// Error response
return res.status(400).json(createErrorResponse("Validation failed"));
```

## Security

- All endpoints include CORS headers
- Authentication middleware is available for protected routes
- Input validation should be implemented for all endpoints
- Sensitive data should never be logged or exposed in responses

## Next Steps

1. Implement actual authentication logic with Firebase Auth
2. Add Stripe payment processing
3. Set up database connections (Firebase Firestore)
4. Add input validation and sanitization
5. Implement rate limiting
6. Add comprehensive error logging
7. Set up monitoring and analytics
