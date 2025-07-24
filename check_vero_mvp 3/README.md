# CheckVero MVP

A decentralized application for user verification, built with Motoko for the Internet Computer (ICP).

## Prerequisites
- Install DFX (Internet Computer SDK): https://internetcomputer.org/docs/current/developer-docs/setup/install
- Install Node.js for frontend assets (if needed).
- Fleek account for deployment: https://fleek.co

## Setup
1. Clone this repository.
2. Navigate to the project directory: `cd check_vero_mvp`.
3. Start the local DFX network: `dfx start --background`.
4. Deploy the canister: `dfx deploy`.

## Deploying to Fleek
1. Ensure your `dfx.json` is configured correctly.
2. Deploy the frontend and canister:
   - Use Fleek's ICP integration to deploy the `check_vero_mvp_assets` canister.
   - Follow Fleek's documentation: https://docs.fleek.co
3. Update the frontend to use the deployed canister ID.

## Uploading to GitHub
1. Create a new repository or use an existing one.
2. Upload the contents of this ZIP file to the repository.
3. Commit and push changes.

## Running Locally
1. Start DFX: `dfx start --clean --background`.
2. Deploy: `dfx deploy`.
3. Access the frontend at `http://localhost:8000/?canisterId=<check_vero_mvp_assets_canister_id>`.

## Notes
- Ensure the `public` directory contains your frontend assets.
- Update `script.js` with the correct canister ID after deployment.
- For production, secure the canister with proper access controls.
