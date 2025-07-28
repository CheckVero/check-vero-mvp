# Check Vero Persistent Backend API

This is the persistent backend API for Check Vero that stays online 24/7.

## Deployment Instructions

1. Deploy to Vercel:
```bash
cd vercel-backend
vercel --prod
```

2. The API will be available at: `https://checkvero-api.vercel.app`

## Endpoints

- `GET /` - API info
- `GET /api/health` - Health check
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-phone` - Phone verification
- `POST /api/phone-numbers/register` - Register phone number
- `POST /api/reports/submit` - Submit fraud report

## Sample Phone Numbers

- `+31612345678` → Acme Bank
- `+61298765432` → Gov Australia
- `+14155552020` → TechCorp Support
- `+442071234567` → British Telecom