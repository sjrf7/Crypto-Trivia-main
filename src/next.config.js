/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      }
    ],
  },
   webpack: (config, { isServer }) => {
    if (!isServer) {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }
    if (isServer) {
      // These modules are not used in the server-side code and can be externalized
      // to prevent webpack from trying to bundle them, which can cause errors.
      config.externals.push(
        'handlebars',
        'lokijs',
        '@opentelemetry/exporter-jaeger',
        '@opentelemetry/sdk-node',
        '@genkit-ai/firebase', // Explicitly externalize the problematic module
        'firebase-admin',
        'express',
         // Genkit plugins depending on grpc may not work properly.
        'grpc',
        '@grpc/grpc-js'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
