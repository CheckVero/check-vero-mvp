
# ✅ Check Vero MVP (ICP-Native)

This is a minimal Motoko-based demo of the Check Vero verification system.

## Features

- Real-time phone number verification via Motoko backend
- Hardcoded responses for demo numbers
- Simple HTML/JS frontend
- ICP-native: deployable via Fleek or DFX

## Test Numbers

- `+31612345678` → ✅ Acme Bank
- `+61298765432` → ✅ Gov Australia
- Anything else → ❌ Not registered

## Deploy Instructions

1. Upload this ZIP to GitHub
2. Connect to Fleek, set:
   - Branch: `main`
   - Directory: `src/check_vero_frontend`
   - Framework: `Other`
   - Build command: *(leave empty)*
3. Hit Deploy

---

Contact: [checkvero.org](https://checkvero.org)
