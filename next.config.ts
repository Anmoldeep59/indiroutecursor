import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep firebase-admin outside the Turbopack/server bundle so Node can load it.
  serverExternalPackages: [
    "firebase-admin",
    "firebase-admin/app",
    "firebase-admin/auth",
    "firebase-admin/firestore",
    "firebase-admin/storage",
    "@google-cloud/firestore",
    "jose",
    "jwks-rsa",
  ],
};

export default nextConfig;
