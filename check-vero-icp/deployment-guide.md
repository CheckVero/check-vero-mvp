# Check Vero ICP - Deployment Guide

## 🚀 Deployment Options

### Local Development Deployment

1. **Start Local Replica**
   ```bash
   dfx start --background --clean
   ```

2. **Deploy to Local Network**
   ```bash
   dfx deploy
   ```

3. **Initialize Sample Data**
   ```bash
   dfx canister call check_vero_backend initializeSampleDataPublic
   ```

4. **Access Local dApp**
   ```bash
   # Get frontend canister ID
   dfx canister id check_vero_frontend
   
   # Access at: http://localhost:4943/?canisterId={frontend_canister_id}
   ```

### IC Mainnet Deployment

1. **Prerequisites**
   - Ensure you have ICP tokens for deployment
   - Verify your developer identity: `dfx identity whoami`

2. **Deploy to IC Mainnet**
   ```bash
   dfx deploy --network ic
   ```

3. **Set Up Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update canister IDs
   dfx canister --network ic id check_vero_backend
   dfx canister --network ic id check_vero_frontend
   ```

4. **Initialize Production Data**
   ```bash
   dfx canister --network ic call check_vero_backend initializeSampleDataPublic
   ```

5. **Access Production dApp**
   ```bash
   echo "https://$(dfx canister --network ic id check_vero_frontend).ic0.app"
   ```

## 🔧 Configuration

### Network Configuration (`dfx.json`)

```json
{
  "networks": {
    "local": {
      "bind": "127.0.0.1:4943",
      "type": "ephemeral"
    },
    "ic": {
      "providers": [
        "https://ic0.app"
      ],
      "type": "persistent"
    }
  }
}
```

### Environment Setup

Create `.env` file:
```bash
# Development
CANISTER_ID_check_vero_backend=rdmx6-jaaaa-aaaaa-aaadq-cai
CANISTER_ID_check_vero_frontend=rrkah-fqaaa-aaaaa-aaaaq-cai
DFX_NETWORK=local

# Production (update with actual IDs)
# CANISTER_ID_check_vero_backend=your-backend-canister-id
# CANISTER_ID_check_vero_frontend=your-frontend-canister-id
# DFX_NETWORK=ic
```

## 📦 Build Process

### Frontend Assets
The frontend assets are automatically bundled and deployed as an asset canister:
- `index.html` - Main application entry point
- `styles.css` - Complete styling with green theme
- `app.js` - Application logic and ICP integration

### Backend Canister
The Motoko backend is compiled and deployed as a canister:
- User management and authentication
- Phone number registry and verification
- Fraud reporting and AI analysis
- Analytics and dashboard data

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
dfx canister call check_vero_backend health
```

### 2. Sample Data Verification
```bash
dfx canister call check_vero_backend getRegisteredPhoneNumbers
```

### 3. Frontend Connectivity
Visit the frontend URL and test:
- Navigation between views
- Sample phone number verification
- User registration flow

### 4. API Integration Test
```bash
# Test phone verification
dfx canister call check_vero_backend verifyPhoneNumber '("+31612345678")'

# Test user registration
dfx canister call check_vero_backend registerUser '("testuser", "test@example.com", #citizen, null)'
```

## 🔐 Security Considerations

### Production Checklist

- [ ] Replace mock authentication with Internet Identity
- [ ] Implement proper access controls
- [ ] Add rate limiting for API calls
- [ ] Validate all user inputs
- [ ] Enable HTTPS in production
- [ ] Set up monitoring and logging
- [ ] Review and audit smart contract code

### Access Control
```motoko
// Current: Mock principal (development only)
let caller = Principal.fromActor(CheckVero);

// Production: Use message caller
let caller = Principal.toText(msg.caller);
```

## 📈 Monitoring and Maintenance

### Key Metrics to Monitor
- Canister cycle balance
- Memory usage
- API response times
- User registration trends
- Fraud report patterns

### Maintenance Tasks
- Regular cycle top-ups
- Data backup and archival
- Performance optimization
- Security patches

## 🆘 Troubleshooting

### Common Issues

1. **Canister Out of Cycles**
   ```bash
   dfx canister status check_vero_backend
   dfx ledger top-up $(dfx canister id check_vero_backend) --amount 10
   ```

2. **Build Failures**
   ```bash
   dfx stop
   rm -rf .dfx
   dfx start --background --clean
   dfx deploy
   ```

3. **Frontend Not Loading**
   - Verify canister ID is correct
   - Check browser console for errors
   - Confirm assets were deployed

4. **Backend API Errors**
   ```bash
   dfx logs check_vero_backend
   ```

### Getting Help
- [IC Developer Forum](https://forum.dfinity.org)
- [DFINITY Discord](https://discord.gg/cA7y6ezyE2)
- [IC Developer Docs](https://internetcomputer.org/docs)

## 🎯 DoraHacks & Grant Submission

### Demo Deployment
For grant reviews and DoraHacks submissions:

1. **Deploy to IC Mainnet** (recommended for permanence)
2. **Document the URLs** in your submission
3. **Include test scenarios** from `mock_data/sample_data.json`
4. **Provide video walkthrough** of key features

### Key Features to Highlight
- ✅ Green checkmark verification system
- 📊 Real-time AI fraud analysis
- 🏗️ Scalable ICP architecture
- 👥 Multi-role user management
- 🔗 Community-driven fraud prevention

---

**Ready to protect the world from digital fraud! 🛡️**