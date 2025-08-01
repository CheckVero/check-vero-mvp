#!/bin/bash

# Check Vero Backend - One-Click Deployment Script
# Run this script after extracting the deployment package

echo "🚀 Check Vero Backend Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "api/index.py" ]; then
    echo "❌ Error: api/index.py not found. Please run this script from the vercel-backend directory."
    exit 1
fi

echo "📁 Files found:"
ls -la

echo ""
echo "🧪 Testing backend locally..."

# Test local imports
python3 -c "
import sys
sys.path.append('./api')
try:
    from api.index import app
    print('✅ Backend imports successfully')
    print('✅ Sample data will be initialized on startup')
except Exception as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

echo ""
echo "🚀 Ready to deploy to Vercel!"
echo ""
echo "Next steps:"
echo "1. Make sure you're logged into Vercel CLI: vercel login"
echo "2. Deploy: vercel --prod"
echo "3. When prompted for project name, use: checkvero-api"
echo "4. Copy the deployed URL and update your frontend environment variable"
echo ""
echo "📞 Sample numbers that will work:"
echo "  +31612345678 → Acme Bank"
echo "  +61298765432 → Gov Australia"
echo "  +14155552020 → TechCorp Support"
echo "  +442071234567 → British Telecom"
echo ""
echo "🎯 Your persistent backend will be available 24/7!"