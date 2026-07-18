import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Render serves the site as a Node server, so we don't need static export.
  // This keeps API routes (like /api/contact) working out of the box.
};

export default nextConfig;
