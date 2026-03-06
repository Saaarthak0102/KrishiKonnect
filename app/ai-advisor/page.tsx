'use client'

import Footer from '@/components/Footer'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function AIAdvisorPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetAdvice = async () => {
    if (!query.trim()) {
      setError(lang === 'hi' ? 'कृपया एक सवाल लिखें' : 'Please enter a question')
      return
    }

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: query,
          language: lang,
        }),
      })

      if (!res.ok) {
        throw new Error(
          lang === 'hi' 
            ? `त्रुटि: ${res.status}` 
            : `Error: ${res.status}`
        )
      }

      const data = await res.json()

      if (data.success && data.text) {
        setResponse(data.text)
      } else {
        throw new Error(data.error || (lang === 'hi' ? 'अनुत्तरदायी प्रतिक्रिया' : 'Invalid response'))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('AI Advisor error:', errorMessage)
      setError(
        lang === 'hi'
          ? `त्रुटि: ${errorMessage}\nकृपया बाद में कोशिश करें।`
          : `Error: ${errorMessage}\nPlease try again later.`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Ctrl+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleGetAdvice()
    }
  }

  return (
    <FeaturePageLayout>
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-krishi-heading mb-4">
              {t.aiAdvisorTitle}
            </h1>
            <p className="text-xl text-krishi-text mb-2">{t.aiAdvisorSubtitle}</p>
            <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.aiAdvisorDescription}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            {/* Input Section */}
            <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm mb-6">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={4}
                placeholder={t.askQuestion}
              />
              <button
                onClick={handleGetAdvice}
                disabled={isLoading}
                className="mt-4 w-full bg-krishi-primary text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? lang === 'hi'
                    ? 'प्रतीक्षा करें...'
                    : 'Loading...'
                  : t.getAdvice}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 text-red-700 whitespace-pre-wrap"
              >
                {error}
              </motion.div>
            )}

            {/* Response Section */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-krishi-agriculture/10 border-2 border-krishi-agriculture rounded-lg p-6 mb-6"
              >
                <p className="text-sm text-krishi-text/70 mb-3 font-semibold">
                  {lang === 'hi' ? 'AI सलाहकार का उत्तर:' : 'AI Advisor Response:'}
                </p>
                <p className="text-krishi-text whitespace-pre-wrap">{response}</p>
              </motion.div>
            )}

            {/* Example Question */}
            {!response && !isLoading && (
              <div className="bg-krishi-agriculture/10 border-2 border-krishi-agriculture rounded-lg p-6">
                <p className="text-sm text-krishi-text/70 mb-2">{t.exampleQuestion}</p>
                <p className="text-krishi-text italic">"{t.sampleAiQuestion}"</p>
              </div>
            )}
          </motion.div>
        </main>
        <Footer />
      </div>
    </FeaturePageLayout>
  )
}
