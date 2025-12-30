import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/graph',
        destination: 'http://127.0.0.1:8000/graph',
      },
      {
        source: '/api/graph/:path*',
        destination: 'http://127.0.0.1:8000/graph/:path*',
      },
      {
        source: '/api/chat',
        destination: 'http://127.0.0.1:8000/chat',
      },
      {
        source: '/api/ingest',
        destination: 'http://127.0.0.1:8000/ingest',
      },
      {
        source: '/api/ingest/:path*',
        destination: 'http://127.0.0.1:8000/ingest/:path*',
      },
      {
        source: '/api/interviewer/:path*',
        destination: 'http://127.0.0.1:8000/interviewer/:path*',
      },
      {
        source: '/api/auth/ingest',
        destination: 'http://127.0.0.1:8000/auth/ingest',
      },
      {
        source: '/api/node/:path*',
        destination: 'http://127.0.0.1:8000/api/node/:path*',
      },
    ];
  },
};

export default nextConfig;
