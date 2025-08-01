# Check Vero Backend - Ready for Deployment

🚀 **Persistent backend for Check Vero fraud verification platform**

## Quick Deploy to Vercel

1. **Clone or download this repository**
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Deploy**: `vercel --prod`
4. **Use project name**: `checkvero-api`

## Files Structure

```
├── api/
│   └── index.py          # FastAPI backend application
├── requirements.txt      # Python dependencies
├── vercel.json          # Vercel configuration
├── package.json         # Project metadata
└── deploy.sh           # Deployment helper script
```

## Features

- ✅ **24/7 Uptime** - Never sleeps
- ✅ **User Registration & Login** - JWT authentication
- ✅ **Phone Verification** - Instant company lookup
- ✅ **Fraud Reporting** - AI-powered analysis
- ✅ **CORS Enabled** - Works with checkvero.com
- ✅ **Sample Data** - Ready for testing

## Sample Phone Numbers

- `+31612345678` → Acme Bank ✅
- `+61298765432` → Gov Australia ✅  
- `+14155552020` → TechCorp Support ✅
- `+442071234567` → British Telecom ✅

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-phone` - Phone verification
- `POST /api/phone-numbers/register` - Register phone number
- `POST /api/reports/submit` - Submit fraud report

## Testing

After deployment, test with:

```javascript
// Health check
fetch('https://YOUR-DEPLOYED-URL/api/health')
  .then(r => r.json()).then(console.log)

// Phone verification
fetch('https://YOUR-DEPLOYED-URL/api/verify-phone', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({phone_number: '+31612345678'})
}).then(r => r.json()).then(console.log)
```

## Frontend Configuration

Update your frontend environment variable:

```
REACT_APP_BACKEND_URL = https://YOUR-DEPLOYED-URL
```

## Support

This backend provides persistent, reliable API service for the Check Vero fraud verification platform.