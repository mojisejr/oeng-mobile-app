---
## Project Overview

**Project Name**: AI English Coach

**Repository**: https://github.com/mojisejr/mimivibe-ai.git

**Description**: แอปพลิเคชันบนมือถือที่ช่วยให้ผู้ใช้สามารถฝึกฝนและตรวจสอบความถูกต้องของประโยคภาษาอังกฤษที่ใช้ในชีวิตจริง โดยใช้ AI (LLM) เป็นเครื่องมือหลักในการให้คำแนะนำและแก้ไขอย่างละเอียด ระบบใช้ Google Gemini 2.0 Flash API เพื่อสร้างการวิเคราะห์ที่มีคุณภาพสูงและเป็นธรรมชาติ

**Project Goals**:

- สร้างประสบการณ์การเรียนรู้ภาษาอังกฤษที่เข้าถึงได้ง่าย น่าเชื่อถือ และมีคุณภาพสูงผ่านเทคโนโลยี AI
- รับประกันคุณภาพการวิเคราะห์ด้วยระบบ Google Gemini 2.0 Flash API
- สร้างรายได้ที่ยั่งยืนผ่านระบบ credit และ payment system ครบครัน
- รักษาความปลอดภัยและความเชื่อถือของผู้ใช้ด้วยระบบ Firebase Authentication

---

## 🌏 Timezone & Date Configuration

### Thailand Timezone Settings

**Primary Timezone**: Asia/Bangkok (UTC+7)
**Date Format**: Christian Era (ค.ศ.) - YYYY-MM-DD
**Time Format**: 24-hour format (HH:MM)
**Locale**: th-TH with Christian Era calendar

### Development Guidelines

#### Date/Time Handling

**⚠️ CRITICAL: Synchronize Time Before Any File Operations**

Before creating a new file or saving any timestamps, you **MUST** use the following command to retrieve the current date and time from the system:

```bash
date +"%Y-%m-%d %H:%M:%S"
```

This ensures accurate timestamp synchronization with the system clock and prevents time-related inconsistencies.

```javascript
// Use this utility for consistent timezone handling
const getThailandDateTime = () => {
  return new Date().toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    calendar: "gregory", // Christian Era
  });
};

// For file naming (retrospectives, logs)
const getThailandDateForFilename = () => {
  const now = new Date();
  return now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  }); // Returns YYYY-MM-DD format
};
```

#### File Naming Conventions

- **Retrospective Files**: `session-YYYY-MM-DD-[description].md`
- **Log Files**: `YYYY-MM-DD-[type].log`
- **Backup Files**: `backup-YYYY-MM-DD-HHMM.sql`

#### Important Notes

- **ALWAYS synchronize time first**: Run `date +"%Y-%m-%d %H:%M:%S"` before any file creation or timestamp operations
- **ALL timestamps** in documentation, logs, and file names must use Thailand timezone
- **Year format** must always be Christian Era (ค.ศ.) not Buddhist Era (พ.ศ.)
- **Development sessions** should reference Thailand local time
- **Retrospective files** must use correct Thailand date in filename
- **System time verification** is mandatory for accurate time-based operations

---

## Architecture Overview

### Core Structure

- **Framework**: React Native Expo 53.0.22
- **Frontend/Framework**: React 19.0.0 with TypeScript (Strict Mode)
- **Backend**: Render Free Tier (Serverless Functions)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Payment**: Stripe React Native Integration
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router 5.1.5 with File-based Routing
- **Icons**: Lucide React Native

### Tech Stack

- **Frontend**: React Native Expo, TypeScript
- **Backend**: Render Free Tier (Serverless Functions), Firebase Firestore, Firebase Authentication
- **AI Integration**: Google Gemini 2.0 Flash API
- **Payment**: Stripe React Native
- **UI/UX**: NativeWind (Tailwind CSS), Lucide React Native
- **Development**: ESLint, TypeScript, Expo CLI

### Mobile App Structure

- **Core Screens**:
  - `Add/Edit Sentence Screen`: Input fields for English sentence, user translation, and context
  - `Sentence List Screen`: Display saved sentences with status indicators and search/filter
  - `Analysis Result Screen`: AI-generated analysis with 7 detailed sections
  - `Buy Credits Screen`: Credit purchase interface with Stripe integration
  - `Payment History Screen`: Transaction history and credit usage tracking

- **Navigation Structure**:
  - Tab-based navigation with Home and Explore tabs
  - File-based routing with Expo Router
  - Stack navigation for detailed screens
  - Haptic feedback integration for iOS

### Backend Render Serverless Functions

- **Sentence Management**:
  - `POST /api/saveSentence`: Save new sentences to Firestore
  - `GET /api/getSentences`: Retrieve user's sentence list with filtering
  - `POST /api/analyzeSentence`: Process AI analysis and update sentence status

- **User Management**:
  - User profile and credit balance management
  - Authentication state handling
  - Credit deduction and top-up processing

- **Payment System**:
  - `POST /api/stripePayment`: Process credit purchases
  - `GET /api/getPaymentHistory`: Retrieve transaction history
  - Webhook handling for payment confirmations

---

## 🤖 AI System Architecture

### Google Gemini Integration

- **Primary AI Provider**: Google Gemini 2.0 Flash API
- **Analysis Workflow**: Single-step comprehensive analysis
- **Token Management**: Optimized prompts for cost efficiency
- **Response Format**: Structured JSON output for mobile app consumption

### AI Analysis Components

1. **Translation Analysis**: Correct Thai translation with explanations
2. **Grammar Correction**: Grammar mistakes identification and fixes
3. **Spelling Check**: Misspelled words detection and correction
4. **Vocabulary Breakdown**: Key words with parts of speech and explanations
5. **Alternative Sentences**: Two alternative phrasings for natural conversation
6. **Context Analysis**: Situation appropriateness evaluation
7. **Final Recommendation**: Actionable improvement advice

### Prompt Engineering

- **Role Definition**: AI English coach for Thai speakers
- **Output Format**: Structured JSON for mobile app parsing
- **Tone**: Friendly, encouraging, conversational
- **Language**: Thai explanations for Thai users
- **Focus**: Practical, real-life English usage

---

## 💳 Payment & Credit System

### Credit Management

- **Free Tier**: 3 credits for new users
- **Credit Deduction**: 1 credit per AI analysis
- **Credit Packages**: Configurable pricing tiers
- **Balance Tracking**: Real-time credit balance updates

### Stripe Integration

- **Currency**: Thai Baht (THB)
- **Payment Method**: Stripe React Native SDK
- **Security**: PCI DSS compliant payment processing
- **Webhook**: Real-time payment status updates
- **History**: Complete transaction tracking

---

## 📱 Mobile App Features

### User Input & Save Functionality

- **English Sentence Input**: Required text field
- **User Translation**: Optional translation field
- **Context/Situation**: Optional context description
- **Save Action**: Store to Firestore with 'Pending' status

### List & Filter Functionality

- **Sentence Display**: List view with status indicators
- **Search & Filter**: Text search and status filtering
- **Status Management**: 'Pending' vs 'Analyzed' states
- **Action Buttons**: Analyze (for pending) or View (for analyzed)

### AI Analysis Display

- **Structured Results**: 7-section analysis display
- **Thai Language**: All explanations in Thai
- **Interactive UI**: Expandable sections and clear typography
- **Save Results**: Persistent storage of analysis

---

## ⚠️ CRITICAL SAFETY RULES

### NEVER MERGE PRS YOURSELF

**DO NOT** use any commands to merge Pull Requests, such as `gh pr merge`. Your role is to create a well-documented PR and provide the link to the user.

**ONLY** provide the PR link to the user and **WAIT** for explicit user instruction to merge. The user will review and merge when ready.

### DO NOT DELETE CRITICAL FILES

You are **FORBIDDEN** from deleting or moving critical files and directories in the project. This includes, but is not limited to: `.env`, `.git/`, `node_modules/`, `package.json`, `app.json`, `expo.json`, and the main project root files. If a file or directory needs to be removed, you must explicitly ask for user permission and provide a clear explanation.

### HANDLE SENSITIVE DATA WITH CARE

You must **NEVER** include sensitive information such as API keys, passwords, or user data in any commit messages, Pull Request descriptions, or public logs. Always use environment variables for sensitive data. If you detect sensitive data, you must alert the user and **REFUSE** to proceed until the information is properly handled.

**Critical Environment Variables**:

- `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- `FIREBASE_FUNCTIONS_URL`

### STICK TO THE SCOPE

You are instructed to focus **ONLY** on the task described in the assigned Issue. Do not perform any refactoring, code cleanup, or new feature development unless it is explicitly part of the plan. If you encounter an opportunity to improve the code outside of the current scope, you must create a new task and discuss it with the user first.

### MOBILE DEVELOPMENT SAFETY

**DO NOT** modify Expo configuration or native dependencies without explicit permission. The app uses Expo managed workflow and any changes to native modules must be thoroughly tested. Always use Expo-compatible libraries and follow Expo best practices.

---

## 🚀 Development Workflows

### The Two-Issue Pattern

This project uses a Two-Issue Pattern to separate work context from actionable plans, integrating local workflows with GitHub Issues for clarity and traceability.

- **Context Issues (`=fcs`):** Used to record the current state and context of a session on GitHub.

- **Task Issues (`=plan`):** Used to create a detailed and comprehensive plan of action on GitHub. The agent will use information from the latest Context Issue as a reference.

---

### Shortcut Commands

These commands are standard across all projects and streamline our communication with **AUTOMATED WORKFLOW INTEGRATION**.

- **`=fcs > [message]`**: Updates the `current-focus.md` file on the local machine and creates a **GitHub Context Issue** with the specified `[message]` as the title. **WARNING**: This command will only work if there are no open GitHub issues. If there are, the agent will alert you to clear the backlog before you can save a new context. To bypass this check, use the command `=fcs -f > [message]`.

- **`=plan > [question/problem]`**: Creates a **GitHub Task Issue** with a detailed and comprehensive plan of action. The agent will use all the information from the `current-focus.md` file and previous conversations to create this Issue. If an open Task Issue already exists, the agent will **update** that Issue with the latest information instead of creating a new one.

- **`=impl > [message]`**: **ENHANCED WITH AUTOMATED WORKFLOW** - Instructs the agent to execute the plan contained in the latest **GitHub Task Issue** with full automation:

  1. **Auto-Branch Creation**: Creates feature branch with proper naming (`feature/[issue-number]-[description]`)
  2. **Implementation**: Executes the planned work
  3. **Auto-Commit & Push**: Commits changes with descriptive messages and pushes to remote
  4. **Auto-PR Creation**: Creates Pull Request with proper description and issue references
  5. **Issue Updates**: Updates the plan issue with PR link and completion status
  6. **User Notification**: Provides PR link for review and approval

- **`=rrr > [message]`**: Creates a daily Retrospective file in the `docs/retrospective/` folder and creates a GitHub Issue containing a summary of the work, an AI Diary, and Honest Feedback, allowing you and the team to review the session accurately.

### 🔄 Plan Issue Management Guidelines

**CRITICAL**: For large, multi-phase projects, the agent must **UPDATE** existing plan issues instead of creating new ones.

- **When completing phases**: Update the plan issue to reflect completed phases and mark them as ✅ COMPLETED
- **Progress tracking**: Update the issue description with current status, next steps, and any blockers
- **Phase completion**: When a phase is finished, update the plan issue immediately before moving to the next phase
- **Never create new issues**: For ongoing multi-phase work, always update the existing plan issue
- **Retrospective issues**: Only create retrospective issues for session summaries, not for plan updates

### 🌿 Automated Workflow Implementation

**ENHANCED AUTOMATION**: All development workflows now include full automation to ensure consistent adherence to project guidelines.

#### Enhanced Command Behavior

The following commands now include **FULL WORKFLOW AUTOMATION**:

##### `=impl` Command Enhancement

**Automated Execution Flow:**

```
1. Parse GitHub Task Issue → Extract requirements and scope
2. Auto-Branch Creation → feature/[issue-number]-[sanitized-description]
3. Implementation Phase → Execute planned work with progress tracking
4. Auto-Commit & Push → Descriptive commits with proper formatting
5. Auto-PR Creation → Comprehensive PR with issue linking
6. Issue Updates → Update plan issue with PR link and completion status
7. User Notification → Provide PR URL for review and approval
```

##### Branch Naming Convention

- **Format**: `feature/[issue-number]-[sanitized-description]`
- **Example**: `feature/27-ai-analysis-implementation`
- **Auto-sanitization**: Removes special characters, converts to kebab-case

##### Commit Message Standards

- **Format**: `[type]: [description] (#[issue-number])`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Example**: `feat: implement AI sentence analysis (#25)`

##### Pull Request Automation

- **Title**: Auto-generated from issue title with proper formatting
- **Description**: Includes implementation summary, changes made, and testing notes
- **Issue Linking**: Automatic `Closes #[issue-number]` for proper tracking
- **Labels**: Auto-applied based on implementation type and scope

#### Workflow Safety Measures

- **Branch Protection**: Prevents direct commits to main/master
- **PR Validation**: Ensures all changes go through review process
- **Issue Tracking**: Maintains complete audit trail of work
- **Status Updates**: Real-time progress tracking and notifications

**CRITICAL**: **NEVER** work directly on main/master branch. **ALWAYS** create PRs for review.

---

## 🛠️ Development Commands

### Core Development

```bash
# Start development server
npm start
# or
expo start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Lint code
npm run lint

# Reset project (remove example code)
npm run reset-project
```

### Expo Commands

```bash
# Install dependencies
npm install

# Start with specific options
expo start --clear-cache
expo start --tunnel
expo start --localhost

# Build for production
expo build:android
expo build:ios

# Publish updates
expo publish
```

### Render Deployment Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Render (via Git push)
git push origin main

# Environment variables setup on Render dashboard
# - FIREBASE_API_KEY
# - FIREBASE_AUTH_DOMAIN
# - FIREBASE_PROJECT_ID
# - GOOGLE_GENERATIVE_AI_API_KEY
# - STRIPE_PUBLISHABLE_KEY
# - STRIPE_SECRET_KEY
```

### Firebase Commands

```bash
# Install Firebase CLI (for Firestore management)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init firestore

# View Firestore data
firebase firestore:indexes
```

---

## 📈 Retrospective Workflow

When you use the `=rrr` command, the agent will create a file and an Issue with the following sections and details:

### Session Retrospective

**Session Date**: [Date in YYYY-MM-DD format, Thailand timezone]
**Start Time**: [HH:MM Thailand time]
**End Time**: [HH:MM Thailand time]
**Duration**: ~X minutes
**Primary Focus**: [Main Focus]
**Current Issue**: #XXX
**Last PR**: #XXX

### Session Summary

[Overall summary of the work done today]

### Timeline

- HH:MM - Start, review issue #XXX (Thailand time)
- HH:MM - [Event] (Thailand time)
- HH:MM - [Event] (Thailand time)
- HH:MM - Work completed (Thailand time)

### Timezone Guidelines for Retrospectives

- **File Naming**: Use `session-YYYY-MM-DD-[description].md` format with Thailand date
- **All Times**: Must be in Thailand timezone (Asia/Bangkok, UTC+7)
- **Date Format**: Christian Era (ค.ศ.) in YYYY-MM-DD format
- **Example**: `session-2025-01-25-thailand-timezone-implementation.md`

### 📝 AI Diary (REQUIRED - DO NOT SKIP)

**⚠️ MANDATORY**: The agent must write this section in the first person.
[Record initial understanding, how the approach changed, confusing or clarifying points, decisions made, and their reasoning.]

### 💭 Honest Feedback (REQUIRED - DO NOT SKIP)

**⚠️ MANDATORY**: The agent must honestly evaluate its performance in this section.
[Assess the session's overall efficiency, tools and their limitations, clarity of communication, and suggestions for improvement.]

### What Went Well

- The successes that occurred

### What Could Improve

- Areas that could be made better

### Blockers & Resolutions

- **Blocker**: Description of the obstacle
  **Resolution**: The solution implemented

### Lessons Learned

- **Pattern**: [Pattern discovered] - [Reason why it's important]
- **Mistake**: [Mistake made] - [How to avoid it]
- **Discovery**: [New finding] - [How to apply it]

---

## 🔧 Troubleshooting

### Common Issues

#### Expo Development Issues

```bash
# Clear Expo cache
expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Firebase Issues

```bash
# Check Firebase configuration
firebase projects:list

# Test Firebase connection
firebase functions:shell

# View Firebase logs
firebase functions:log --only [function-name]

# Deploy specific function
firebase deploy --only functions:[function-name]
```

#### React Native Issues

```bash
# iOS simulator issues
npx react-native run-ios --simulator="iPhone 15"

# Android emulator issues
npx react-native run-android

# Clean Android build
cd android && ./gradlew clean && cd ..

# Clean iOS build
cd ios && xcodebuild clean && cd ..
```

#### TypeScript Issues

```bash
# Type checking
npx tsc --noEmit

# Generate types
expo install --fix

# Check Expo types
expo doctor
```

#### Stripe Integration Issues

```bash
# Test Stripe keys
echo $STRIPE_PUBLISHABLE_KEY | head -c 20

# Verify Stripe webhook
stripe listen --forward-to localhost:3000/webhook

# Test payment flow
stripe payment_intents create --amount=2000 --currency=thb
```

### Performance Monitoring

- **App Performance**: Monitor using Expo DevTools and React Native Performance
- **Firebase Performance**: Use Firebase Performance Monitoring
- **API Response Times**: Track Cloud Function execution times
- **AI Response Times**: Monitor Gemini API response latency
- **Error Tracking**: Use Firebase Crashlytics for crash reporting
- **User Analytics**: Implement Firebase Analytics for user behavior tracking

### Database Schema (Firestore)

#### Users Collection

```javascript
// Collection: users
// Document ID: User's UID from Firebase Auth
{
  email: string,
  credits: number, // Remaining credits
  createdAt: timestamp,
  lastActiveAt: timestamp
}
```

#### Sentences Collection

```javascript
// Collection: sentences
// Document ID: Auto-generated UUID
{
  userId: string,
  englishSentence: string,
  userTranslation?: string,
  context?: string,
  status: 'Pending' | 'Analyzed',
  createdAt: timestamp,
  analyzedAt?: timestamp,
  analysisResult?: {
    correctTranslation: string,
    grammarCorrection: {
      analysis: string,
      correctedSentence: string,
      explanation: string
    },
    spellingCorrection: {
      analysis: string,
      corrections: object // Key-value pairs
    },
    vocabularyList: [{
      word: string,
      partOfSpeech: string,
      explanation: string
    }],
    alternativeSentences: string[],
    contextAnalysis: {
      analysis: string,
      suggestion: string
    },
    finalRecommendation: string
  }
}
```

#### Payments Collection

```javascript
// Collection: payments
// Document ID: Auto-generated UUID
{
  userId: string,
  stripePaymentId: string,
  amount: number, // Amount in cents
  creditsAdded: number,
  status: 'succeeded' | 'failed' | 'pending',
  createdAt: timestamp
}
```

---

## 📚 Additional Resources

### Documentation Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe React Native Documentation](https://stripe.com/docs/stripe-react-native)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

### Development Tools

- **Expo CLI**: Command-line tool for Expo development
- **Firebase CLI**: Command-line tool for Firebase services
- **Stripe CLI**: Command-line tool for Stripe testing
- **React Native Debugger**: Standalone debugging tool
- **Flipper**: Desktop debugging platform for React Native

### Testing Strategy

- **Unit Testing**: Jest for component and utility testing
- **Integration Testing**: Firebase emulator for backend testing
- **E2E Testing**: Detox for end-to-end mobile testing
- **Payment Testing**: Stripe test mode for payment flow testing
- **AI Testing**: Mock responses for Gemini API testing

---