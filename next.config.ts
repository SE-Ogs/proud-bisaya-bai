import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    //allow production builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    //allow production builds to succeed even if there are type errors
    ignoreBuildErrors: true,
  },
  async redirects() {
      return[
        {
          source: "/",
          destination: "/home",
          permanent: true,
        }
      ];
  },
};

export default nextConfig;
