'use client'

import { motion } from 'framer-motion'

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => Promise<void>
  lang: string
}

const SUGGESTED_QUESTIONS_EN = [
  {
    emoji: '🌾',
    title: 'Pest Control',
    question: 'My wheat crops are affected by insects. What should I do?',
  },
  {
    emoji: '💧',
    title: 'Irrigation',
    question: 'How much water do I need for my vegetables during the summer?',
  },
  {
    emoji: '🌦️',
    title: 'Weather Impact',
    question: 'How does excessive rainfall affect my rice crop?',
  },
  {
    emoji: '🧪',
    title: 'Fertilizer',
    question: 'What is the best fertilizer for corn at the vegetative stage?',
  },
]

const SUGGESTED_QUESTIONS_HI = [
  {
    emoji: '🌾',
    title: 'कीट नियंत्रण',
    question: 'मेरी गेहूं की फसल को कीड़ों का दर्द है। मुझे क्या करना चाहिए?',
  },
  {
    emoji: '💧',
    title: 'सिंचाई',
    question: 'गर्मी के मौसम में सब्जियों को कितना पानी देना चाहिए?',
  },
  {
    emoji: '🌦️',
    title: 'मौसम का प्रभाव',
    question: 'अत्यधिक वर्षा मेरी धान की फसल को कैसे प्रभावित करती है?',
  },
  {
    emoji: '🧪',
    title: 'उर्वरक',
    question: 'सब्जी की फसल को किस उर्वरक को सबसे अच्छा है?',
  },
]

export default function SuggestedQuestions({
  onSelectQuestion,
  lang,
}: SuggestedQuestionsProps) {
  const questions = lang === 'hi' ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {lang === 'hi' ? (
            <>
              <span className="text-[#2D4B8C]">कृषि</span>
              {' '}
              <span className="text-[#C96A3A]">सहायक</span>
            </>
          ) : (
            <>
              <span className="text-[#2D4B8C]">Krishi</span>
              {' '}
              <span className="text-[#C96A3A]">Sahayak</span>
            </>
          )}
        </h2>
        <p className="text-krishi-text/70">
          {lang === 'hi'
            ? 'कुछ सामान्य प्रश्न चुनें या अपना प्रश्न पूछें'
            : 'Choose a common question or ask your own'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {questions.map((q, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectQuestion(q.question)}
            className="p-4 bg-white/70 backdrop-blur-sm border-2 border-krishi-border rounded-lg hover:border-krishi-primary hover:shadow-md transition-all text-left group"
          >
            <motion.div
              className="text-3xl mb-2"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.2 }}
            >
              {q.emoji}
            </motion.div>
            <p className="font-semibold text-krishi-heading mb-1">{q.title}</p>
            <p className="text-sm text-krishi-text/70 group-hover:text-krishi-text transition-colors">
              {q.question}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-krishi-agriculture/10 border border-krishi-agriculture/30 rounded-lg"
      >
        <p className="text-sm text-krishi-text/70 leading-relaxed">
          {lang === 'hi'
            ? '🌾 मैं कृषि संबंधी किसी भी सवाल का जवाब दे सकता हूँ - फसल की बीमारी, कीटों, सिंचाई, उर्वरक, मिट्टी की जाँच, और कृषि प्रणालियों के बारे में। अपनी स्थिति के अनुसार सलाह पाएं!'
            : '🌾 I can answer any farming question - crop diseases, pests, irrigation, fertilizers, soil testing, and farming practices. Get advice tailored to your situation!'}
        </p>
      </motion.div>
    </motion.div>
  )
}
