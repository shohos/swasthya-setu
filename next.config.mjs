/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ship the seeded SQLite file with serverless functions on Vercel
    outputFileTracingIncludes: {
      "/api/**": ["./prisma/swasthya.db"],
    },
  },
};

export default nextConfig;
