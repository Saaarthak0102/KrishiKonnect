import { motion } from 'framer-motion'
import { FiMapPin, FiTrendingUp } from 'react-icons/fi'
import { GiWheat, GiPlantSeed } from 'react-icons/gi'
import { WiDaySunny } from 'react-icons/wi'

interface ContextChipsProps {
  location: string
  crop: string
  temperature: string
  mandiPrice: string
  cropStage: string
}

export default function ContextChips({
  location,
  crop,
  temperature,
  mandiPrice,
  cropStage,
}: ContextChipsProps) {
  const chips = [
    { icon: <FiMapPin size={16} />, text: location },
    { icon: <GiWheat size={16} />, text: crop },
    { icon: <WiDaySunny size={18} />, text: temperature },
    { icon: <FiTrendingUp size={16} />, text: mandiPrice },
    { icon: <GiPlantSeed size={16} />, text: cropStage },
  ]

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {chips.map((chip, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(196,106,61,0.25)',
            color: '#2D2A6E',
          }}
        >
          <span style={{ color: '#2D2A6E', opacity: 0.9 }}>{chip.icon}</span>
          <span>{chip.text}</span>
        </motion.div>
      ))}
    </div>
  )
}
