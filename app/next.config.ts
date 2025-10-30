import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nur in Dev relevant
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
};

export default nextConfig;
