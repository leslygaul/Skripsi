import withPWA from 'next-pwa'

const runtimeCaching = [
  {
    urlPattern: /\/api\/products/,
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: 'api-products',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60,
      },
      networkTimeoutSeconds: 10,
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'product-images',
      expiration: {
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /\.(?:js|css|woff2|woff|ttf)$/,
    handler: 'StaleWhileRevalidate' as const,
    options: {
      cacheName: 'static-assets',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'image-assets',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
    },
  },
]

const baseConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'fakestoreapi.com',
      },
    ],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
   disable: false, 
  runtimeCaching,
})(baseConfig)

export default nextConfig
