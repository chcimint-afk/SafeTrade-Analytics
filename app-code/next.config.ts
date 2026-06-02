import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these security headers to all routes in the application
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents clickjacking by blocking the terminal from being embedded in iframes
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents MIME-type sniffing attacks
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protects user privacy during cross-site requests
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Disable hardware features to prevent tracking/hacking
          },
        ],
      },
    ];
  },
};

export default nextConfig;
