# Excel Analytics Website with Firebase

A professional Excel analytics platform with AI-powered insights, Firebase authentication, and cloud storage. Built with React, TypeScript, and Firebase.

## Features

- **🔐 Firebase Authentication**: Secure user authentication with email/password
- **☁️ Cloud Storage**: Files stored securely in Firebase Storage
- **📊 Real-time Database**: User data and analytics stored in Firestore
- **📁 File Upload & Processing**: Drag-and-drop Excel file uploads with real-time processing
- **🤖 AI-Powered Insights**: Intelligent analysis and recommendations for your data
- **📈 Interactive Dashboards**: Beautiful, responsive charts and visualizations
- **🔍 Data Analysis Tools**: Comprehensive analytics with filtering and sorting
- **🎨 Modern UI/UX**: Clean, professional interface with dark/light mode support
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **Radix UI** for styling
- **Firebase SDK** for authentication and storage
- **XLSX** for Excel file processing
- **React Router DOM** for routing
- **React Query** for server state management

### Backend & Database
- **Firebase Firestore** for document storage
- **Firebase Storage** for file uploads
- **Firebase Authentication** for user management
- **Firebase Security Rules** for data protection

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Authentication, Firestore, and Storage enabled

### Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Create Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode for development

4. **Set up Storage**:
   - Go to Storage
   - Click "Get started"
   - Start in test mode for development

5. **Get Firebase Configuration**:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Add a web app and copy the config

6. **Update Configuration**:
   - Replace the placeholder values in `src/config/firebase.ts` with your actual Firebase config

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd excel-analytics-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Update `src/config/firebase.ts` with your Firebase configuration
   - Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:5173`

## Usage

### For Users

1. **Sign Up**: Create an account with your email and password
2. **Sign In**: Use your credentials to access the platform
3. **Upload Files**: Drag and drop Excel files (.xls, .xlsx) up to 10MB
4. **Analyze Data**: View AI-generated insights and create visualizations
5. **View History**: Access your previous analyses in the dashboard

### File Processing

- **Supported Formats**: .xls, .xlsx
- **File Size Limit**: 10MB
- **Processing**: Automatic column detection and data extraction
- **Storage**: Files stored securely in Firebase Storage
- **Privacy**: Each user can only access their own files

### AI Insights

- **Trend Analysis**: Identifies patterns and growth trends
- **Anomaly Detection**: Finds unusual data points
- **Recommendations**: Provides actionable insights
- **Confidence Scores**: Each insight includes a confidence percentage

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── FileUpload.tsx  # File upload component
│   ├── DataAnalysis.tsx # Data analysis tools
│   ├── AIInsights.tsx  # AI insights display
│   └── Header.tsx      # Navigation header
├── context/            # React context providers
│   └── FirebaseAuthContext.tsx # Firebase authentication
├── services/           # Firebase services
│   └── firebaseService.ts # File processing and data management
├── config/             # Configuration files
│   └── firebase.ts     # Firebase configuration
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   ├── LoginUser.tsx   # User authentication
│   └── NotFound.tsx    # 404 page
└── lib/                # Utility functions
    └── utils.ts        # Helper functions
```

## Firebase Security Rules

### Firestore Rules
- Users can only access their own data
- Analyses are user-specific
- Insights are tied to user analyses

### Storage Rules
- Users can only upload to their own folder
- File access is restricted by user authentication

## Deployment

### Firebase Hosting

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

3. **Access your app**:
   - Your app will be available at `https://your-project.web.app`

### Environment Variables

For production, consider using environment variables for Firebase configuration:

```bash
# .env.local
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Roadmap

- [ ] Real-time collaboration
- [ ] Advanced chart types
- [ ] Data export features
- [ ] API integration
- [ ] Mobile app
- [ ] Advanced AI features
- [ ] Team management
- [ ] Data visualization templates

## Acknowledgments

- Built with React and Firebase
- UI components from Radix UI
- Styling with Tailwind CSS
- Excel processing with XLSX library

## Firebase Setup

Follow these steps to enable the real Firebase backend with minimal code changes:

### 1) Create .env.local
Create a file named `.env.local` in the project root with your Firebase web app config:

```
VITE_FIREBASE_API_KEY=AIzaSyCBB1OplXqyRh53x7m9kTwM69j_m7IzB2k
VITE_FIREBASE_AUTH_DOMAIN=excellytics-6cef2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=excellytics-6cef2
VITE_FIREBASE_STORAGE_BUCKET=excellytics-6cef2.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=544349788420
VITE_FIREBASE_APP_ID=1:544349788420:web:76ec0effcc02e51c571851
VITE_FIREBASE_MEASUREMENT_ID=G-W8ZBCEG3LM
```

Note: Storage bucket must use the `appspot.com` domain in config.

### 2) Enable Firebase services
- Authentication: enable Email/Password provider
- Firestore: create database (start in test for development)
- Storage: click “Get started” to enable

### 3) Deploy security rules
```
firebase deploy --only firestore:rules
# After enabling Storage in console:
firebase deploy --only storage:rules
```

### 4) Local development
```
npm install
npm run dev
```

### 5) Production build and Hosting deploy
```
npm run build
firebase deploy --only hosting,firestore:rules
# Include storage when enabled
firebase deploy --only hosting,firestore:rules,storage:rules
```

The app uses Firebase via `src/config/firebase.ts`. Auth, uploads, and persistence are live through Firebase while data processing and AI insight generation remain mocked for now to avoid major changes.