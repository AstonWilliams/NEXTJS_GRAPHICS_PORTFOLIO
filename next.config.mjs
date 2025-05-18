/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', '127.0.0.1', 'placehold.co', 'via.placeholder.com'],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
