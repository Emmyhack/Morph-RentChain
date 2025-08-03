#!/bin/bash

# RentChain Vercel Deployment Script
echo "🚀 Starting RentChain deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Check if environment file exists
if [ ! -f "RentChain-frontend/Frontend/RentChain/.env.local" ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp RentChain-frontend/Frontend/RentChain/.env.example RentChain-frontend/Frontend/RentChain/.env.local
    echo "📝 Please edit RentChain-frontend/Frontend/RentChain/.env.local with your actual values"
    echo "   Then run this script again."
    exit 1
fi

# Test the build locally first
echo "🔨 Testing build locally..."
cd RentChain-frontend/Frontend/RentChain
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    cd ../../..
else
    echo "❌ Local build failed. Please fix the issues before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📋 Next steps:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure your domain (optional)"
echo "   3. Test the deployed application"