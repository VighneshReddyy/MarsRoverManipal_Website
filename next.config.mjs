/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure proper handling of client-side only code
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/irc',
        destination: '/alumni',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
