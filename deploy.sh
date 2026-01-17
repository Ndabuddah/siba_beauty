#!/usr/bin/env bash
set -euo pipefail

# Build the app
npm run build

# Deploy to Firebase Hosting (uses default project from .firebaserc)
npx firebase-tools deploy --only hosting