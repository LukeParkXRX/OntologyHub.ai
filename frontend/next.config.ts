import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    return [
      {
        source: '/api/graph',
        destination: `${API_URL}/graph`,
      },
      {
        source: '/api/graph/:path*',
        destination: `${API_URL}/graph/:path*`,
      },
      {
        source: '/api/chat',
        destination: `${API_URL}/chat`,
      },
      {
        source: '/api/ingest',
        destination: `${API_URL}/ingest`,
      },
      {
        source: '/api/ingest/:path*',
        destination: `${API_URL}/ingest/:path*`,
      },
      {
        source: '/api/interviewer/:path*',
        destination: `${API_URL}/interviewer/:path*`,
      },
      {
        source: '/api/auth/ingest',
        destination: `${API_URL}/auth/ingest`,
      },
      {
        source: '/api/node/:path*',
        destination: `${API_URL}/api/node/:path*`,
      },
    ];
  },
};

export default nextConfig;
