'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

// Helper function to render two-colored Krishi titles
function renderKrishiTitle(title: string) {
  // Check if title starts with "Krishi"
  if (title.startsWith('Krishi ')) {
    const parts = title.split(' ')
    return (
      <>
        <span className="text-[#2D4B8C]">Krishi</span>
        {' '}
        <span className="text-[#C96A3A]">{parts.slice(1).join(' ')}</span>
      </>
    )
  }
  return <span className="text-krishi-heading">{title}</span>
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white/70 backdrop-blur-md border-2 border-krishi-border rounded-lg p-6 shadow-sm hover:shadow-md"
    >
      <motion.div
        className="text-5xl mb-4"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-3">
        {renderKrishiTitle(title)}
      </h3>
      <p className="text-krishi-text/80">
        {description}
      </p>
    </motion.div>
  )
}
