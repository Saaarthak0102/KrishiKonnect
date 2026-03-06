export interface FarmContext {
  location: string
  crop: string
  season: string
  cropStage: string
  weather: {
    temperature: string
    humidity: string
    condition: string
  }
  mandi: {
    crop: string
    price: string
    market: string
  }
}

export async function buildFarmContext(userId: string): Promise<FarmContext> {
  // TEMP: static values for hackathon demo.
  // Later these will come from Firebase profile + Weather API + mandiService.
  void userId

  const location = 'Uttar Pradesh'
  const crop = 'Wheat'
  const season = 'Rabi'
  const cropStage = 'Tillering'

  const weather = {
    temperature: '24°C',
    humidity: '58%',
    condition: 'Sunny',
  }

  const mandi = {
    crop: 'Wheat',
    price: '₹2150 / quintal',
    market: 'Lucknow Mandi',
  }

  return {
    location,
    crop,
    season,
    cropStage,
    weather,
    mandi,
  }
}
