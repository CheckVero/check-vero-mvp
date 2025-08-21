# Check Vero ICP - Motoko dApp

🚀 **Complete ICP-native fraud verification platform built with Motoko**

## Overview

Check Vero is a decentralized application (dApp) built on the Internet Computer Protocol (ICP) that helps users verify legitimate communications from businesses and government agencies while protecting against fraud.

## Features

- ✅ **Decentralized Phone Verification** - Blockchain-based company registry
- 🔒 **Fraud Reporting System** - AI-powered analysis with ICP security
- 👥 **User Management** - Role-based access control (Citizen/Business/Admin)
- 📊 **Analytics Dashboard** - Real-time statistics and insights
- 🎯 **Points System** - Reward users for valuable fraud reports
- 🌐 **Web Interface** - Professional HTML/CSS/JS frontend

## Quick Start

### Prerequisites

- Install [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- Node.js (for frontend dependencies, optional)

### Local Development

1. **Clone and setup:**
```bash
git clone <repository-url>
cd check-vero-icp
```

2. **Start local ICP replica:**
```bash
dfx start --background
```

3. **Deploy canisters:**
```bash
dfx deploy
```

4. **Initialize sample data:**
```bash
dfx canister call check_vero_backend initializeSampleDataPublic
```

5. **Open frontend:**
```bash
# Get the frontend URL
dfx canister id check_vero_frontend
# Visit: http://127.0.0.1:4943/?canisterId=<frontend-canister-id>
```

## Sample Data

The platform includes verified phone numbers for testing:

- `+31612345678` → **Acme Bank** ✅
- `+61298765432` → **Gov Australia** ✅  
- `+14155552020` → **TechCorp Support** ✅
- `+442071234567` → **British Telecom** ✅

## Architecture

### Backend (Motoko)
- **Location**: `src/main.mo`
- **Features**:
  - User registration and authentication
  - Phone number registry with verification
  - Fraud report submission and analysis
  - Statistics and analytics
  - Role-based access control

### Frontend (Web)
- **Location**: `frontend/`
- **Stack**: HTML5, CSS3, Vanilla JavaScript
- **Features**:
  - Professional ICP-native UI design
  - Real-time phone verification
  - Fraud reporting form with analysis
  - Dashboard with system statistics
  - Responsive design for all devices

## API Reference

### Main Canister Methods

```motoko
// User Management
registerUser(username: Text, email: Text, role: UserRole, companyName: ?Text) : async ApiResponse<User>
getCurrentUserProfile() : async ApiResponse<User>

// Phone Verification
registerPhoneNumber(phoneNumber: Text, companyName: Text, description: ?Text) : async ApiResponse<PhoneNumber>
verifyPhoneNumber(phoneNumber: Text) : async ApiResponse<VerificationResult>

// Fraud Reporting
submitFraudReport(reportType: ReportType, phoneNumber: ?Text, emailAddress: ?Text, description: Text) : async ApiResponse<FraudReport>
getFraudReports() : async [FraudReport]

// Statistics
getSystemStats() : async SystemStats
getUserStats(userId: Text) : async ApiResponse<UserStats>
```

## Testing

### Unit Tests
```bash
# Run Motoko tests
dfx canister call check_vero_backend test_verification_flow
```

### Frontend Tests
1. Open the application in browser
2. Use sample phone numbers for verification
3. Submit test fraud reports
4. Check dashboard statistics

## Deployment

### Local Network
```bash
dfx deploy --network local
```

### IC Mainnet
```bash
# First, ensure you have cycles
dfx wallet balance

# Deploy to mainnet
dfx deploy --network ic --with-cycles 1000000000000
```

### Alternative: Fleek/Ninja Deployment
1. Push code to GitHub
2. Connect repository to Fleek or Ninja
3. Configure build settings:
   - Build command: `dfx build`
   - Output directory: `.dfx/local/canisters`

## Configuration

### Environment Variables (.env)
```bash
# Development
DFX_NETWORK=local
CANISTER_ID_CHECK_VERO_BACKEND=<backend-canister-id>
CANISTER_ID_CHECK_VERO_FRONTEND=<frontend-canister-id>

# Production (IC Mainnet)
DFX_NETWORK=ic
IC_CANISTER_ID=<production-canister-id>
```

## Project Structure

```
check-vero-icp/
├── src/
│   └── main.mo                 # Motoko backend canister
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── styles.css             # Professional CSS styling
│   └── app.js                 # JavaScript frontend logic
├── mock_data/
│   └── sample_phones.json     # Test phone numbers
├── dfx.json                   # DFX configuration
├── README.md                  # This file
└── .env.example               # Environment template
```

## Grant Applications

This project is designed for:
- 🏆 **DFINITY Developer Grants**
- 🚀 **DoraHacks Hackathons** 
- 🌊 **World Computer Hackathon League (WCHL)**
- 💎 **ICP Ecosystem Funding**

## Key Features for Reviewers

- **✅ Real Motoko Implementation** - Full backend logic in native ICP language
- **🎨 Professional UI** - Production-ready frontend with ICP branding
- **📱 Complete Functionality** - All core features working end-to-end
- **🔒 Blockchain Security** - Leverages ICP's decentralized architecture
- **📊 Analytics Dashboard** - Real-time insights and statistics
- **🧪 Demo Ready** - Sample data and test scenarios included

## License

MIT License - Built for the Internet Computer Protocol ecosystem.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

- **Documentation**: [Internet Computer Docs](https://internetcomputer.org/docs)
- **Community**: [ICP Developer Discord](https://discord.gg/internetcomputer)
- **Issues**: Open an issue in this repository

---

**Built with ❤️ for the Internet Computer Protocol**