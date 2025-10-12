# Railway Deployment Guide

This guide will help you deploy the Attendance Management System to Railway, a cloud hosting platform.

## Prerequisites

1. A GitHub account
2. A Railway account (free at https://railway.app)

## Deployment Steps

### 1. Fork this Repository

First, you'll need to have this code in a GitHub repository:
1. Create a new repository on GitHub
2. Push this code to your new repository

### 2. Sign up for Railway

1. Go to https://railway.app
2. Sign up for a free account using GitHub

### 3. Create a New Project

1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your forked repository
4. Allow Railway to access your repository

### 4. Configure the Project

Railway will automatically detect this is a Node.js project and:
1. Use the [railway.toml](file://c:\Attendance%20system\railway.toml) configuration file
2. Set up the PostgreSQL database automatically
3. Deploy the application

### 5. Set Environment Variables

In Railway, go to your project settings and add these environment variables:
```
SESSION_SECRET=your_random_secret_key_here_change_this
PORT=3000
NODE_ENV=production
USE_MOCK_DB=false
```

### 6. Initialize the Database

After deployment, you need to run the setup script:
1. Go to your Railway project
2. Click on your application
3. Go to the "Console" tab
4. Run: `npm run setup`

### 7. Access Your Application

1. Railway will provide a URL like: `https://your-project.up.railway.app`
2. Visit this URL to access your deployed application

## Default Login Credentials

After setup, you can log in with:

### Admin Account
- Email: admin@school.com
- Password: admin123

### Teacher Accounts
- sarah.johnson@school.edu (Section 1A) / teacher123
- rahul.sharma@school.edu (Section 1B) / teacher123
- priya.patel@school.edu (Section 1C) / teacher123
- anjali.gupta@school.edu (Section 1D) / teacher123
- vikram.singh@school.edu (Section 1E) / teacher123
- kavya.reddy@school.edu (Section 1F) / teacher123
- meera.das@school.edu (Section 1G) / teacher123

### Student Account
- Email: student@school.com
- Password: student123

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL environment variable is set by Railway
- Check that PostgreSQL plugin is enabled

### Application Not Starting
- Check logs in Railway dashboard
- Ensure all environment variables are set
- Verify PORT is set to 3000

### Setup Script Fails
- Run `npm run setup` from Railway console
- Check database connection in logs

## Updating Your Deployment

To update your deployed application:
1. Push changes to your GitHub repository
2. Railway will automatically redeploy
3. If database schema changes, run setup again

## Railway Free Tier Limits

- 512 MB RAM
- 1 GB disk space
- Sleeps after 12 hours of inactivity
- Limited database resources

For production use, consider upgrading to a paid plan.