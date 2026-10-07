import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: [
    '192.168.15.55',
    '192.168.15.55:3000',
    '192.168.*',
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
