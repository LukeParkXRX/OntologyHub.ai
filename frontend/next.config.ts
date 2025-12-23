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
        source: '/api/chat',
        destination: 'http://127.0.0.1:8000/chat',
      },
      {
        source: '/api/reset_graph',
        destination: 'http://127.0.0.1:8000/reset_graph',
      },
      {
        source: '/api/auth/ingest',
        destination: 'http://127.0.0.1:8000/auth/ingest',
      },
    ];
  },
};

export default nextConfig;
