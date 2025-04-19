# Car Marketplace

A modern car marketplace application built with Next.js, Firebase, and AWS S3.

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase account with Firestore enabled
- AWS account with S3 bucket

### Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

2. Fill in your Firebase and AWS credentials in the `.env.local` file.

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Add your Firebase configuration to `.env.local`

For server-side Firebase Admin:
1. Go to Project Settings > Service Accounts
2. Generate a new private key
3. Add the client email and private key to `.env.local`

### AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Configure CORS for your bucket:

\`\`\`json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
\`\`\`

3. Create an IAM user with S3 access
4. Add your AWS credentials to `.env.local`

### Running the Application

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is ready to deploy on Vercel:

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and configuration
  - `/firebase.ts` - Firebase client-side utilities
  - `/firebase-admin.ts` - Firebase server-side utilities
  - `/upload.ts` - S3 upload utilities
  - `/environment.ts` - Environment detection utilities
  - `/fallback.ts` - Fallback implementations for development
- `/public` - Static assets

## Troubleshooting

### File System Errors

If you encounter errors related to the file system (like `fs.readFile is not implemented`), make sure you're not using Node.js-specific APIs in client components. All file operations should be done through the browser's File API or in server components/API routes.

### AWS S3 Connection Issues

If you have issues connecting to S3:
1. Verify your AWS credentials in `.env.local`
2. Check that your IAM user has the correct permissions
3. Ensure your S3 bucket CORS configuration is correct

### Firebase Authentication Issues

If authentication isn't working:
1. Verify that Email/Password authentication is enabled in Firebase
2. Check your Firebase configuration in `.env.local`
3. Ensure you're using the correct Firebase project ID
