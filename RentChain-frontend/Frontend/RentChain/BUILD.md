# 🏗️ RentChain DApp - Build Guide

This guide explains how to build and deploy the RentChain decentralized application built with **Vite + React**.

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git**

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd RentChain-frontend/Frontend/RentChain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
# or
npm start
```

The application will be available at `http://localhost:5173`

### 4. Production Build

```bash
npm run build
```

## 📦 Build Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Alias for dev (development server) |
| `npm run build` | Create production build |
| `npm run build:clean` | Clean dist folder and rebuild |
| `npm run preview` | Preview production build locally |
| `npm run serve` | Serve production build on all interfaces |
| `npm run lint` | Run ESLint checks |
| `npm run lint:fix` | Fix ESLint issues automatically |

## 🏗️ Build Output

The production build creates the following optimized chunks:

- **vendor.js** - React, React DOM, React Router
- **web3.js** - Ethers.js and Web3 functionality  
- **ui.js** - UI components and i18n
- **payments.js** - Stripe payment components
- **index.js** - Main application code
- **index.css** - Compiled Tailwind CSS

### Build Statistics
```
dist/index.html                     2.44 kB │ gzip:   0.86 kB
dist/assets/index.css              34.10 kB │ gzip:   6.37 kB
dist/assets/payments.js            12.99 kB │ gzip:   5.02 kB
dist/assets/vendor.js              46.02 kB │ gzip:  16.53 kB
dist/assets/ui.js                  47.76 kB │ gzip:  15.69 kB
dist/assets/web3.js                82.66 kB │ gzip:  25.12 kB
dist/assets/index.js              488.55 kB │ gzip: 134.97 kB
```

## ⚡ Performance Optimizations

### Implemented Optimizations:
- **Code Splitting**: Separate chunks for vendor, Web3, UI, and payments
- **Tree Shaking**: Automatic removal of unused code
- **Minification**: ESBuild for fast minification
- **Gzip Compression**: Reduced bundle sizes
- **Lazy Loading**: Dynamic imports for route-based code splitting

### Bundle Analysis:
- **Main bundle**: 488.55 kB (135 kB gzipped)
- **Total size**: ~876 KB
- **Load time**: ~2-3 seconds on 3G

## 🌐 Deployment Options

### 1. Static Hosting (Recommended)

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Upload dist/ folder to Netlify
```

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### 2. Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t rentchain .
docker run -p 80:80 rentchain
```

### 3. CDN Deployment

Upload `dist/` folder contents to your CDN:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Blob Storage

## 🔧 Environment Configuration

### Environment Variables

Create `.env.local` file:
```bash
VITE_CONTRACT_ADDRESS=0x...
VITE_INFURA_PROJECT_ID=your_project_id
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_MOONPAY_PUBLIC_KEY=pk_live_...
```

### Network Configuration

Update `src/config/contracts.js`:
```javascript
export const CONTRACT_ADDRESSES = {
  RENTCHAIN: process.env.VITE_CONTRACT_ADDRESS,
  USDT: "0x...", // USDT contract address
  // ... other contracts
};
```

## 🛠️ Troubleshooting

### Common Issues:

**1. Ethers.js Import Warnings**
- These are expected with Ethers v6
- Warnings don't affect functionality
- Build completes successfully

**2. Large Bundle Size Warning**
- Implemented code splitting to reduce impact
- Main chunk is under 500KB threshold
- Consider lazy loading for additional optimization

**3. Buffer/Process Polyfills**
- Already configured in vite.config.js
- Required for Web3 functionality in browser

**4. CORS Issues in Development**
- CORS enabled in vite.config.js
- Use `npm run serve` for production testing

### Build Fixes:

**Clean Build:**
```bash
npm run clean
npm run build
```

**Dependency Issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Linting Issues:**
```bash
npm run lint:fix
```

## 📊 Tech Stack

- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.0
- **Styling**: Tailwind CSS 3.4.17
- **Web3**: Ethers.js 6.15.0
- **Routing**: React Router 7.6.3
- **Payments**: Stripe Elements
- **i18n**: React i18next
- **Icons**: React Icons

## 🔒 Security Notes

- Environment variables are build-time only
- No sensitive keys in client-side code
- Contract addresses configurable per environment
- Wallet connections use MetaMask provider

## 🌍 Multi-language Support

Built-in support for:
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)  
- 🇫🇷 French (fr)
- 🇨🇳 Chinese (zh)
- 🇸🇦 Arabic (ar)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)

## 📞 Support

For build issues or questions:
1. Check console for error messages
2. Review this build guide
3. Check GitHub issues
4. Contact development team

---

**Built with ❤️ using Vite + React**