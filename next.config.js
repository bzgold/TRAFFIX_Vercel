/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile these packages for proper resolution
  transpilePackages: ['react-map-gl', 'mapbox-gl', '@mapbox/mapbox-gl-style-spec'],
  
  // Empty turbopack config to silence webpack warning
  turbopack: {},
}

module.exports = nextConfig

