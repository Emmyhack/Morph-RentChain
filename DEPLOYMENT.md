# RentChain Vercel Deployment Guide

This guide will help you deploy RentChain to Vercel successfully.

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual Deployment
Follow the steps below for manual deployment.

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **Vercel CLI** installed: `npm install -g vercel`
3. **Git** repository cloned
4. **Vercel account** created

## 🔧 Pre-Deployment Setup

### 1. Environment Configuration

Create your environment file:
```bash
cp RentChain-frontend/Frontend/RentChain/.env.example RentChain-frontend/Frontend/RentChain/.env.local
```

Edit `.env.local` with your actual values:
```env
# Contract Addresses (replace with actual deployed addresses)
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_LISTINGS_CONTRACT=0x0000000000000000000000000000000000000000
VITE_ESCROW_CONTRACT=0x0000000000000000000000000000000000000000
# ... add other contract addresses

# Network Configuration
VITE_NETWORK_CHAIN_ID=0x2
VITE_NETWORK_NAME=Morph Testnet
VITE_RPC_URL=https://rpc-testnet.morphl2.io
VITE_EXPLORER_URL=https://explorer-testnet.morphl2.io

# Token Addresses
VITE_USDT_ADDRESS=0x176211869cA2b568f2A7D4EE941E073a821EE1ff
```

### 2. Test Local Build

```bash
cd RentChain-frontend/Frontend/RentChain
npm install
npm run build
```

If the build succeeds, you're ready to deploy!

## 🌐 Vercel Deployment

### Method 1: Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm deployment settings
   - Wait for deployment to complete

### Method 2: Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import in Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `RentChain-frontend/Frontend/RentChain`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

## ⚙️ Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from your `.env.local` file:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_CONTRACT_ADDRESS` | `0x...` | Production, Preview |
| `VITE_NETWORK_CHAIN_ID` | `0x2` | Production, Preview |
| `VITE_RPC_URL` | `https://rpc-testnet.morphl2.io` | Production, Preview |
| `VITE_USDT_ADDRESS` | `0x176211869cA2b568f2A7D4EE941E073a821EE1ff` | Production, Preview |

### Via Vercel CLI:

```bash
vercel env add VITE_CONTRACT_ADDRESS
vercel env add VITE_NETWORK_CHAIN_ID
vercel env add VITE_RPC_URL
vercel env add VITE_USDT_ADDRESS
# ... add all other variables
```

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails with "Module not found"**:
   - Ensure all dependencies are in `package.json`
   - Run `npm install` locally to verify

2. **Environment Variables Not Working**:
   - Check variable names start with `VITE_`
   - Verify variables are set in Vercel dashboard
   - Redeploy after adding variables

3. **Contract Addresses Not Loading**:
   - Verify contract addresses are correct
   - Check network configuration
   - Ensure contracts are deployed to the correct network

4. **CORS Issues**:
   - CORS is configured in `vite.config.js`
   - Should work automatically in production

### Debug Steps:

1. **Check Build Logs**:
   ```bash
   vercel logs
   ```

2. **Test Locally**:
   ```bash
   cd RentChain-frontend/Frontend/RentChain
   npm run build
   npm run preview
   ```

3. **Verify Environment**:
   ```bash
   vercel env ls
   ```

## 📊 Post-Deployment

### 1. Verify Deployment
- Check the deployed URL
- Test all major features
- Verify wallet connections
- Test contract interactions

### 2. Set Up Custom Domain (Optional)
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records

### 3. Monitor Performance
- Use Vercel Analytics
- Monitor build times
- Check error rates

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy on:
- Push to `main` branch
- Pull request creation
- Manual deployment trigger

## 📞 Support

If you encounter issues:

1. Check this guide
2. Review Vercel documentation
3. Check build logs
4. Test locally first
5. Contact the development team

## 🎉 Success!

Your RentChain application should now be live on Vercel! 🚀