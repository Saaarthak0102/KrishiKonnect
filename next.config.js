/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase', '@firebase/auth', '@firebase/firestore', 'undici'],
}

module.exports = nextConfig
