import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/backend-universite/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
