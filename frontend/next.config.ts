const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    if (!backendUrl) {
      throw new Error("BACKEND_URL must be set for the API rewrite.");
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};
export default nextConfig;
