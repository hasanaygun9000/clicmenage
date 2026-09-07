/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Homepage mood photography (see src/lib/config/homepage-media.ts) is
    // hotlinked from Unsplash's free tier — see that file's header comment
    // for the licensing note and the before-launch self-hosting suggestion.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
