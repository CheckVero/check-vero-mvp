# Check Vero - ICP Native dApp

**A blockchain-powered fraud verification platform built on the Internet Computer**

Check Vero protects users from digital fraud by providing real-time verification of phone calls, emails, and AI communications from legitimate businesses and government agencies.

## 🌟 Key Features

- **✅ Instant Verification**: Real-time phone number verification with green checkmark system
- **📊 AI-Powered Analysis**: Intelligent fraud pattern detection and risk assessment
- **🛡️ Community Protection**: User-driven fraud reporting with point rewards
- **👥 Role-Based Dashboards**: Specialized interfaces for Citizens, Businesses, and Admins
- **🔗 ICP-Native**: Built on Internet Computer for decentralization and security

## 🏗️ Architecture

### Backend (Motoko)
- **User Management**: Registration, authentication, role-based access
- **Phone Registry**: Verified business/government phone numbers
- **Fraud Detection**: AI analysis of suspicious communications
- **Point System**: Reward valuable fraud reports

### Frontend (Vanilla JS/HTML/CSS)
- **Responsive Design**: Professional Apple/Signal-inspired UI
- **Real-time Updates**: Dynamic verification and analysis results
- **Multi-role Support**: Citizen, Business, Admin interfaces
- **Progressive Enhancement**: Works across all modern browsers

## 🚀 Quick Start

### Prerequisites
- [DFINITY Canister SDK (dfx)](https://internetcomputer.org/docs/current/developer-docs/setup/install/) v0.15.0+
- Node.js 16+ (for development tools)

### Local Development

1. **Clone and Setup**
   ```bash
   cd check-vero-icp
   ```

2. **Start Local IC Replica**
   ```bash
   dfx start --background --clean
   ```

3. **Deploy Canisters**
   ```bash
   # Deploy backend
   dfx deploy check_vero_backend
   
   # Deploy frontend assets
   dfx deploy check_vero_frontend
   ```

4. **Initialize Sample Data**
   ```bash
   dfx canister call check_vero_backend initializeSampleDataPublic
   ```

5. **Access the dApp**
   - Frontend: `http://localhost:4943/?canisterId={frontend_canister_id}`
   - Backend: `http://localhost:4943/?canisterId={backend_canister_id}`

### IC Mainnet Deployment

1. **Deploy to Mainnet**
   ```bash
   dfx deploy --network ic
   ```

2. **Get Canister URLs**
   ```bash
   dfx canister --network ic id check_vero_frontend
   dfx canister --network ic id check_vero_backend
   ```

## 🧪 Testing

### Sample Phone Numbers for Verification
- `+31612345678` - Acme Bank (Customer Service)
- `+61298765432` - Gov Australia (Government Services)
- `+14155552020` - TechCorp Support (Technical Hotline)
- `+442071234567` - British Telecom (Customer Services)

### User Flows to Test

1. **Citizen Journey**
   - Register as Citizen
   - Verify phone numbers
   - Submit fraud reports
   - Earn points for valuable reports

2. **Business Journey**
   - Register as Business/Government
   - Register company phone numbers
   - Monitor verification requests

3. **Admin Journey**
   - Access system statistics
   - Monitor fraud patterns
   - Manage verified numbers

## 📝 API Reference

### Key Backend Methods

```motoko
// User Management
registerUser(username: Text, email: Text, role: UserRole, companyName: ?Text) : async ApiResponse<User>
getCurrentUserProfile() : async ApiResponse<User>

// Phone Verification
registerPhoneNumber(phoneNumber: Text, companyName: Text, description: ?Text) : async ApiResponse<PhoneNumber>
verifyPhoneNumber(phoneNumber: Text) : async ApiResponse<VerificationResult>

// Fraud Reporting
submitFraudReport(reportType: ReportType, phoneNumber: ?Text, emailAddress: ?Text, description: Text) : async ApiResponse<ReportResult>

// Analytics
getSystemStats() : async SystemStats
getDashboardStats(userId: Text) : async ApiResponse<DashboardStats>
```

## 🎨 Design System

### Color Palette
- **Primary Green**: `#00C853` (verification success)
- **Light Green**: `#00E676` (hover states)
- **Dark Green**: `#00A040` (active states)
- **Gray Scale**: Professional neutral tones

### Typography
- **Font**: System font stack (-apple-system, BlinkMacSystemFont, etc.)
- **Headings**: Bold, high contrast
- **Body**: Medium weight, readable

## 🔧 Configuration

### DFX Configuration (`dfx.json`)
```json
{
  "version": 1,
  "dfx": "0.15.0",
  "canisters": {
    "check_vero_backend": {
      "type": "motoko",
      "main": "src/main.mo"
    },
    "check_vero_frontend": {
      "type": "assets",
      "source": ["frontend/"]
    }
  }
}
```

## 🚀 Production Considerations

### Security
- **Authentication**: Implement Internet Identity integration
- **Data Validation**: Server-side input sanitization
- **Rate Limiting**: Protect against spam and abuse

### Scalability
- **Stable Storage**: Implement proper data persistence
- **Pagination**: For large datasets (reports, users)
- **Caching**: Optimize frequently accessed data

### Compliance
- **Data Privacy**: GDPR/CCPA compliance
- **Audit Trail**: Immutable fraud reporting logs
- **Verification Standards**: Business identity verification

## 📊 Grant Application Notes

This ICP-native implementation demonstrates:

- **Decentralized Architecture**: No single point of failure
- **Community Governance**: User-driven fraud detection
- **Transparency**: Open-source, auditable smart contracts
- **Scalability**: Built for global fraud prevention

### DoraHacks Integration
- **Bounty Compatibility**: Modular design for hackathon participation
- **Developer Friendly**: Clear documentation and setup
- **Demo Ready**: Sample data and test scenarios included

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Internet Computer Docs](https://internetcomputer.org/docs)
- **Community**: [IC Developer Forum](https://forum.dfinity.org)
- **Issues**: Submit via GitHub Issues

---

**Built with ❤️ for the Internet Computer ecosystem**