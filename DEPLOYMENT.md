# VeriChain Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account (free)

---

## Phase 1: Frontend Deployment (Testnet)

### Step 1: Push to GitHub

```bash
cd /home/yashodip-more/Downloads/Naval/Blockchain/verichain

# Initialize git (if not done)
git init

# Add all files
git add .

# Create .gitignore if needed
echo "node_modules/
dist/
.env
.env.local
*.log
.DS_Store" > .gitignore

# Commit
git commit -m "VeriChain DID Protocol v1.0 - QIE Testnet"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/verichain-did.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Login with GitHub
3. Click **"Add New Project"**
4. Import your `verichain-did` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables (if needed):
   - `VITE_PINATA_JWT` = your Pinata JWT token
7. Click **Deploy**

Your app will be live at: `https://verichain-did.vercel.app`

---

## Phase 2: Smart Contracts (Already Deployed)

### QIE Testnet Contracts

| Contract | Address |
|----------|---------|
| IdentityRegistry | `0x33b9eb7320c2ACE82caDBA8F61eAB5D72E8282C6` |
| OracleAdapter | `0x32376c7aABa1c6F9d802Ede04d7e106d113e275B` |
| TrustScoreCalculator | `0xEb0a50DEAb93c92730E1429Fb2A82B431C54b48A` |
| ZKVerifier | `0x056cbf01E11105858005E6aB43076a41387D164C` |
| MultiSigAdmin | `0x6668fF8D75209B51D2D292ceF5A688F77142cb6C` |
| RateLimiter | `0xA9b1Ff4B906F11629fAcB9183cd8b201A8f452c8` |
| CrossChainReputation | `0xF7fD38Bf7EFDFA33b7fa368b9A87d76c92f38389` |

---

## Phase 3: Mainnet Upgrade

### Pre-Mainnet Checklist

- [ ] All testnet features working
- [ ] Security audit completed
- [ ] Gas optimization done
- [ ] Multi-sig wallet setup for admin
- [ ] Backup private keys securely
- [ ] Update RPC URLs to mainnet
- [ ] Get mainnet QIE tokens

### Mainnet Deployment Steps

1. **Update Network Config** (`frontend/src/config/constants.ts`):
```typescript
// Change from testnet to mainnet
export const ACTIVE_NETWORK = QIE_MAINNET;
```

2. **Deploy Contracts to Mainnet**:
```bash
cd /home/yashodip-more/Downloads/Naval/Blockchain/verichain
npx hardhat run scripts/deploy.js --network qie_mainnet
```

3. **Update Contract Addresses** in frontend config

4. **Rebuild & Redeploy Frontend**:
```bash
cd frontend
npm run build
git add .
git commit -m "Upgrade to QIE Mainnet"
git push
```

Vercel will auto-deploy on push.

---

## 🔐 Security Best Practices

### Private Key Management
- **NEVER** commit private keys to git
- Use hardware wallet for mainnet
- Store keys in secure password manager

### Environment Variables
```bash
# .env.local (never commit this)
VITE_PINATA_JWT=your_jwt_token
PRIVATE_KEY=your_deployer_private_key
```

### Multi-Sig Setup
For mainnet, use MultiSigAdmin contract:
- Minimum 2/3 signers for critical operations
- Time-lock for major changes

---

## 📊 Monitoring

### Contract Events
Monitor these events on explorer:
- `IdentityCreated`
- `TrustScoreUpdated`
- `IdentityVerified`

### Frontend Analytics
Add Vercel Analytics or Google Analytics for user tracking.

---

## 🆘 Troubleshooting

### Build Fails
```bash
rm -rf node_modules
npm install
npm run build
```

### Contract Calls Fail
1. Check network connection
2. Verify contract addresses
3. Ensure sufficient gas

### IPFS Upload Fails
- Check Pinata JWT validity
- Fallback uses localStorage

---

## 📞 Support

- GitHub Issues: [repo]/issues
- QIE Discord: discord.gg/qie
- Email: support@verichain.io

---

## 📜 License

MIT License - See LICENSE file
