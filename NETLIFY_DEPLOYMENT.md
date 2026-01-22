# Netlify Deployment Guide

This guide will help you deploy your Restaurant Orders API to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://www.netlify.com)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. MongoDB Atlas connection string (already configured in `.env`)

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm install` (or leave empty, Netlify will auto-detect)
   - Publish directory: `.` (root directory)
   - Functions directory: `netlify/functions`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add your MongoDB connection string:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://bhupeshv668_db_user:rEzeds017TFB0BFG@appointment-booking.ruyykrl.mongodb.net/restaurant-orders?retryWrites=true&w=majority&appName=Appointment-booking`

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set MONGODB_URI "mongodb+srv://bhupeshv668_db_user:rEzeds017TFB0BFG@appointment-booking.ruyykrl.mongodb.net/restaurant-orders?retryWrites=true&w=majority&appName=Appointment-booking"
   ```

## Important Configuration

### Environment Variables

Make sure to set these in Netlify Dashboard → Site settings → Environment variables:

- `MONGODB_URI` - Your MongoDB Atlas connection string

### MongoDB Atlas Network Access

Ensure your MongoDB Atlas cluster allows connections from:
- Netlify's IP addresses (or set to allow from anywhere `0.0.0.0/0` for development)

## API Endpoints After Deployment

Once deployed, your API will be available at:
- `https://your-site-name.netlify.app/api/restaurant-orders`
- `https://your-site-name.netlify.app/` (health check)

## Testing the Deployment

1. **Health Check**
   ```
   GET https://your-site-name.netlify.app/
   ```

2. **Create Order**
   ```
   POST https://your-site-name.netlify.app/api/restaurant-orders
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "order_items": [{"item": "Pizza", "quantity": 1, "price": 12.99}],
     "address": "123 Main St",
     "phone_no": "555-1234",
     "amount": 12.99,
     "collection": "delivery"
   }
   ```

## Troubleshooting

### Common Issues

1. **Function timeout**
   - Netlify functions have a 10-second timeout on free tier
   - Consider upgrading or optimizing database queries

2. **MongoDB connection issues**
   - Check MongoDB Atlas network access settings
   - Verify connection string in environment variables

3. **Build errors**
   - Check Netlify build logs
   - Ensure all dependencies are in `package.json`

4. **Cold starts**
   - First request after inactivity may be slow (serverless cold start)
   - This is normal for serverless functions

## Alternative Deployment Options

If you encounter issues with Netlify, consider these alternatives:

- **Vercel** - Similar to Netlify, great for serverless
- **Railway** - Easy deployment with database support
- **Render** - Free tier available, good for Express apps
- **Heroku** - Traditional PaaS (paid plans)

## Support

For issues specific to:
- Netlify: https://docs.netlify.com
- MongoDB: https://docs.atlas.mongodb.com
- This project: Check the main README.md
