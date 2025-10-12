@echo off
REM Simple deployment script for Railway

echo 🚀 Starting deployment process...

REM Check if we're on Railway
if "%RAILWAY_ENV%"=="true" (
  echo 🔧 Running on Railway environment
  
  REM Run database setup
  echo 📊 Setting up database...
  node setup-db.js
  
  REM Start the application
  echo 🟢 Starting application...
  node server.js
) else (
  echo 🔧 Running in local environment
  echo To deploy to Railway:
  echo 1. Push this code to a GitHub repository
  echo 2. Create a new project on Railway.app
  echo 3. Connect your GitHub repository
  echo 4. Set environment variables in Railway dashboard
  echo 5. Run 'npm run setup' in Railway console after deployment
)