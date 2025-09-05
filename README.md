# Oeng App 🚀

A clean, production-ready [Expo](https://expo.dev) mobile application with serverless API backend integration.

## Features

- ✅ **Clean Architecture**: Simplified single-page layout
- ✅ **Serverless API**: Ready-to-deploy API endpoints in `/api` folder
- ✅ **Firebase Integration**: Authentication and database ready
- ✅ **Stripe Payments**: Payment processing setup
- ✅ **TypeScript**: Full type safety
- ✅ **Production Ready**: Optimized dependencies and structure

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

## Project Structure

```
├── app/                    # Main application screens
│   ├── index.tsx          # Main screen (single page layout)
│   └── _layout.tsx        # Root layout
├── api/                   # Serverless API endpoints
│   ├── auth/              # Authentication endpoints
│   ├── users/             # User management
│   ├── payments/          # Stripe integration
│   ├── middleware/        # Auth middleware
│   └── utils/             # API utilities
├── components/            # Reusable UI components
├── constants/             # App constants
└── hooks/                 # Custom React hooks
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
