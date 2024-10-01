// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['replicate.delivery'],
    },
    experimental: {
        serverComponentsExternalPackages: ['@vercel/kv'],
    },
    // ... other configurations
}

module.exports = nextConfig;

