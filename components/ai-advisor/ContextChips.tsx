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
    `📍 ${location}`,
    `🌾 ${crop}`,
    `🌤 ${temperature}`,
    `💰 ${mandiPrice}`,
    `🌱 ${cropStage}`,
  ]

  return (
    <div className="flex flex-wrap gap-2 text-sm bg-white/30 backdrop-blur-md rounded-lg px-3 py-2 border border-indigo-200/40 shadow-md">
      {chips.map((chip) => (
        <span key={chip} className="px-2 py-1 rounded-md bg-white/50 backdrop-blur-sm text-green-900 border border-green-300/30">
          {chip}
        </span>
      ))}
    </div>
  )
}
