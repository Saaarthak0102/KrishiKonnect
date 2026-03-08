export const cropHindiMap: Record<string, string> = {
  wheat: 'गेहूं',
  rice: 'धान',
  maize: 'मक्का',
  sugarcane: 'गन्ना',
  cotton: 'कपास',
  mustard: 'सरसों',
  potato: 'आलू',
  tomato: 'टमाटर',
  onion: 'प्याज़',
  soybean: 'सोयाबीन',
  barley: 'जौ',
  groundnut: 'मूंगफली',
  bajra: 'बाजरा',
  jowar: 'ज्वार',
  chickpea: 'चना',
}

export const mandiHindiMap: Record<string, string> = {
  'Kota Mandi': 'कोटा मंडी',
  'Jaipur Mandi': 'जयपुर मंडी',
  'Nashik Mandi': 'नासिक मंडी',
  'Indore Mandi': 'इंदौर मंडी',
  'Kanpur Mandi': 'कानपुर मंडी',
  'Azadpur Mandi': 'आजादपुर मंडी',
  'Nagpur Mandi': 'नागपुर मंडी',
  'Ludhiana Mandi': 'लुधियाना मंडी',
}

export const fertilizerHindiData = [
  {
    name: 'Urea',
    nameHindi: 'यूरिया',
    descriptionHindi: 'फसल की वृद्धि और दानों की संख्या बढ़ाने में सहायक',
    price: '₹265 / बोरी',
  },
  {
    name: 'DAP',
    nameHindi: 'डीएपी',
    descriptionHindi: 'जड़ों की वृद्धि और पौधों की मजबूती के लिए',
    price: '₹1310 / बोरी',
  },
  {
    name: 'NPK 20:20:0',
    nameHindi: 'एनपीके 20:20:0',
    descriptionHindi: 'फसल के संतुलित पोषण के लिए',
    price: '₹1250 / बोरी',
  },
  {
    name: 'Potash',
    nameHindi: 'पोटाश',
    descriptionHindi: 'फसल की गुणवत्ता और रोग प्रतिरोध बढ़ाता है',
    price: '₹1700 / बोरी',
  },
]

export const pesticideHindiData = [
  {
    name: 'Imidacloprid',
    nameHindi: 'इमिडाक्लोप्रिड',
    descriptionHindi: 'एफिड्स और सफेद मक्खी से सुरक्षा',
    price: '₹710 / लीटर',
  },
  {
    name: 'Chlorpyrifos',
    nameHindi: 'क्लोरपाइरीफॉस',
    descriptionHindi: 'दीमक और कीट नियंत्रण',
    price: '₹620 / लीटर',
  },
  {
    name: 'Neem Oil',
    nameHindi: 'नीम तेल',
    descriptionHindi: 'प्राकृतिक कीटनाशक',
    price: '₹450 / लीटर',
  },
]

export const marketTrendHindi = {
  rising: 'बाजार बढ़ रहा है ↑',
  falling: 'बाजार गिर रहा है ↓',
  stable: 'बाजार स्थिर है',
}

export const priceLabelsHindi = {
  modalPrice: 'मॉडल भाव',
  minimum: 'न्यूनतम',
  maximum: 'अधिकतम',
  pricePerQuintal: '₹ / क्विंटल',
  lastUpdated: '12 घंटे पहले अपडेट',
  marketTrend: 'बाजार प्रवृत्ति',
}

export const bazaarButtonsHindi = {
  buy: 'खरीदें',
  transport: 'परिवहन का अनुरोध करें',
  sellNow: 'यहीं बेचें → ट्रांसपोर्ट',
  viewChart: 'चार्ट देखें',
}

export const bazaarHeadingsHindi = {
  mandiTitle: 'आज की सर्वोत्तम मंडी',
  nearbyMandis: 'आपके राज्य की मंडियाँ',
  fertilizerSection: 'उर्वरक और फसल देखभाल',
  marketTrend: 'बाजार प्रवृत्ति (7 दिन)',
}

export const stateHindiMap: Record<string, string> = {
  Rajasthan: 'राजस्थान',
  UttarPradesh: 'उत्तर प्रदेश',
  Maharashtra: 'महाराष्ट्र',
  Punjab: 'पंजाब',
  Haryana: 'हरियाणा',
  Gujarat: 'गुजरात',
  MadhyaPradesh: 'मध्य प्रदेश',
  Karnataka: 'कर्नाटक',
}

export const mandiCropHindiData = [
  {
    crop: 'मक्का',
    mandi: 'कोटा मंडी',
    state: 'राजस्थान',
    modalPrice: '₹1,964 / क्विंटल',
    minPrice: '₹1,824',
    maxPrice: '₹2,105',
    trend: '-2.0%',
  },
  {
    crop: 'गेहूं',
    mandi: 'जयपुर मंडी',
    state: 'राजस्थान',
    modalPrice: '₹2,060 / क्विंटल',
    minPrice: '₹1,910',
    maxPrice: '₹2,220',
    trend: '+1.5%',
  },
]

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '').trim()
}

export function getHindiCropName(cropName: string): string {
  const normalized = cropName.toLowerCase().trim()
  return cropHindiMap[normalized] ?? cropName
}

export function getHindiMandiName(mandiName: string): string {
  return mandiHindiMap[mandiName] ?? mandiName
}

export function getHindiStateName(stateName: string): string {
  const direct = stateHindiMap[stateName]
  if (direct) return direct

  const normalized = normalizeKey(stateName)
  const mappedEntry = Object.entries(stateHindiMap).find(([key]) => normalizeKey(key) === normalized)
  return mappedEntry ? mappedEntry[1] : stateName
}

export function formatTrendHindi(direction: 'up' | 'down' | 'stable'): string {
  if (direction === 'up') return marketTrendHindi.rising
  if (direction === 'down') return marketTrendHindi.falling
  return marketTrendHindi.stable
}
