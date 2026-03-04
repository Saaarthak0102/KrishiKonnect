'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm hover:shadow-md"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-krishi-heading mb-3">
        {title}
      </h3>
      <p className="text-krishi-text/80">
        {description}
      </p>
    </motion.div>
  )
}
