// Public Firebase web app config — safe to be committed (identifies the project,
// does not grant privileged access; trusted access is enforced by Firestore
// Security Rules and Cloud Functions, not by keeping this secret).
export const firebaseConfig = {
  apiKey: "AIzaSyCnGI21-nijGW05yCO_Det-cwutazQzX0s",
  authDomain: "snake-odyssey.firebaseapp.com",
  projectId: "snake-odyssey",
  storageBucket: "snake-odyssey.firebasestorage.app",
  messagingSenderId: "318481715844",
  appId: "1:318481715844:web:6ed954ea9e07c81a1f28d1",
  measurementId: "G-7BRC8MLMD9"
};

// Firebase App Check (reCAPTCHA Enterprise). Empty until provisioned in the Firebase
// Console: App Check > Apps > register this web app > reCAPTCHA Enterprise, which
// mints this site key. On real domains (GitHub Pages/itch.io), auth.js only calls
// initializeAppCheck() when this is non-empty, so leaving it blank is always safe to
// deploy - App Check simply stays off there. It's used unconditionally for the
// emulator-backed test suite (tests/cloud/), which relies on appCheckDebugToken instead.
export const appCheckSiteKey = "6Lc9ea0tAAAAAHqaiDzvec1gt6dm6aM5YP-OEmaC";

// Fixed debug token so the emulator-backed pytest suite (tests/cloud/, --cloud flag)
// passes App Check enforcement without real reCAPTCHA attestation. Register this exact
// value once in Firebase Console > App Check > Apps > (web app, three-dot menu) >
// Manage debug tokens. Safe to commit - a debug token only grants App Check attestation,
// never bypasses Firebase Auth or Firestore Security Rules.
export const appCheckDebugToken = "33dc1cfb-3dde-4aa6-a978-9dbaeb66cc35";
