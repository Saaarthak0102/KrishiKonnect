interface RecommendedMandiCardProps {
  cropLabel: string
  mandiName: string
  state: string
  modalPrice: number
  reasons: string[]
  onUse: () => void
  lang: 'en' | 'hi'
}

export default function RecommendedMandiCard({
  cropLabel,
  mandiName,
  state,
  modalPrice,
  reasons,
  onUse,
  lang
}: RecommendedMandiCardProps) {
  return (
    <div
      className="rounded-xl border-2 p-5 md:p-6"
      style={{ borderColor: '#C7DFAF', backgroundColor: '#F2F9EA' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#4D7C0F' }}>
        {lang === 'hi' ? 'AI लॉजिस्टिक्स सुझाव' : 'AI Logistics Suggestion'}
      </p>
      <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1F3C88' }}>
        {lang === 'hi'
          ? `${cropLabel} के लिए सुझाई गई मंडी`
          : `Recommended Mandi for ${cropLabel}`}
      </h3>

      <div className="mb-4">
        <p className="text-lg md:text-xl font-bold" style={{ color: '#1F3C88' }}>
          📍 {mandiName}
        </p>
        <p className="text-sm text-gray-700 mt-1">{state}</p>
        <p className="text-2xl font-bold mt-2" style={{ color: '#7FB069' }}>
          ₹{modalPrice.toLocaleString('en-IN')} / {lang === 'hi' ? 'क्विंटल' : 'quintal'}
        </p>
      </div>

      <div className="mb-5">
        <p className="text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
          {lang === 'hi' ? 'कारण' : 'Reason'}
        </p>
        <ul className="space-y-1 text-sm text-gray-700">
          {reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onUse}
        className="rounded-lg px-5 py-3 text-sm font-semibold text-white transition-colors"
        style={{ backgroundColor: '#1F3C88' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#162847'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1F3C88'
        }}
      >
        {lang === 'hi' ? 'सुझाई गई मंडी चुनें' : 'Use Recommended Mandi'}
      </button>
    </div>
  )
}
