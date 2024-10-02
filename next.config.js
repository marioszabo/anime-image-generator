// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['replicate.delivery'],
    },
    experimental: {
        serverComponentsExternalPackages: ['@vercel/kv', '@huggingface/inference'],
    },
    webpack: (config) => {
        config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
        return config;
    },
    // ... other configurations
}

module.exports = nextConfig;

