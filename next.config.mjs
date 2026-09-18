/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma client needs to be external for serverless (Vercel)
  // In Next.js 14, use experimental.serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
