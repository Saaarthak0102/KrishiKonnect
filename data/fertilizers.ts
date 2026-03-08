export interface CropInputItem {
	name: string
	type: 'Fertilizer' | 'Pesticide'
	description: string
	price: number
	unit: 'bag' | 'litre' | 'kg'
}

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
	millet: 'बाजरा',
	lentil: 'मसूर',
	peanut: 'मूंगफली',
	sunflower: 'सूरजमुखी',
	watermelon: 'तरबूज',
	muskmelon: 'खरबूजा',
	cucumber: 'खीरा',
}

export const fertilizerHindiMap: Record<string, string> = {
	urea: 'यूरिया',
	dap: 'डीएपी',
	potash: 'पोटाश',
	npk: 'एनपीके',
	zinc_sulphate: 'जिंक सल्फेट',
	ammonium_sulphate: 'अमोनियम सल्फेट',
	calcium_nitrate: 'कैल्शियम नाइट्रेट',
	magnesium_sulphate: 'मैग्नीशियम सल्फेट',
	boron: 'बोरॉन',
	compost: 'कम्पोस्ट',
	vermicompost: 'वर्मी कम्पोस्ट',
	neem_cake: 'नीम खली',
	super_phosphate: 'सुपर फॉस्फेट',
}

export const fertilizerProducts = [
	{
		name: 'Urea',
		nameHindi: 'यूरिया',
		price: '₹266',
		weight: '45 kg',
	},
	{
		name: 'DAP',
		nameHindi: 'डीएपी',
		price: '₹1350',
		weight: '50 kg',
	},
	{
		name: 'NPK 20:20:0',
		nameHindi: 'एनपीके 20:20:0',
		price: '₹1250',
		weight: '50 kg',
	},
	{
		name: 'Potash',
		nameHindi: 'पोटाश',
		price: '₹1700',
		weight: '50 kg',
	},
	{
		name: 'Zinc Sulphate',
		nameHindi: 'जिंक सल्फेट',
		price: '₹380',
		weight: '10 kg',
	},
	{
		name: 'Vermicompost',
		nameHindi: 'वर्मी कम्पोस्ट',
		price: '₹450',
		weight: '25 kg',
	},
] as const

export const locationHindiMap: Record<string, string> = {
	ghaziabad: 'गाज़ियाबाद',
}

function normalizeKey(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, '_')
}

export function getCropHindiName(crop: string): string {
	const key = normalizeKey(crop).replace(/_/g, '-')
	const normalizedKey = key.replace(/-/g, '_')
	return cropHindiMap[key] || cropHindiMap[normalizedKey] || crop
}

export function getFertilizerHindiName(name: string): string {
	const key = normalizeKey(name)
	if (fertilizerHindiMap[key]) return fertilizerHindiMap[key]

	if (key.startsWith('npk')) {
		const npkGrade = name.replace(/\s+/g, ' ').trim().split(' ').slice(1).join(' ')
		return npkGrade ? `एनपीके ${npkGrade}` : fertilizerHindiMap.npk
	}

	return name
}

export function getLocationHindiName(location: string): string {
	const key = normalizeKey(location).replace(/_/g, '')
	return locationHindiMap[key] || location
}

export function formatBilingual(english: string, hindi: string, useHindi: boolean): string {
	if (!useHindi || english === hindi) return english
	return `${english} (${hindi})`
}

export const cropFertilizerData: Record<string, CropInputItem[]> = {
	wheat: [
		{
			name: 'Urea',
			type: 'Fertilizer',
			description: 'Boosts nitrogen for strong plant growth',
			price: 270,
			unit: 'bag',
		},
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Supports root development in early stage',
			price: 1350,
			unit: 'bag',
		},
		{
			name: 'Neem Oil',
			type: 'Pesticide',
			description: 'Natural pest protection against aphids',
			price: 320,
			unit: 'litre',
		},
	],
	rice: [
		{
			name: 'Urea',
			type: 'Fertilizer',
			description: 'Supports tillering and green leaf growth',
			price: 280,
			unit: 'bag',
		},
		{
			name: 'Potash',
			type: 'Fertilizer',
			description: 'Improves grain filling and stress tolerance',
			price: 980,
			unit: 'bag',
		},
		{
			name: 'Imidacloprid',
			type: 'Pesticide',
			description: 'Controls hoppers and sucking pests',
			price: 740,
			unit: 'litre',
		},
	],
	maize: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Balanced nutrition for uniform crop growth',
			price: 1250,
			unit: 'bag',
		},
		{
			name: 'Urea',
			type: 'Fertilizer',
			description: 'Strengthens vegetative growth and vigor',
			price: 275,
			unit: 'bag',
		},
		{
			name: 'Chlorpyrifos',
			type: 'Pesticide',
			description: 'Helps control stem borer and soil pests',
			price: 560,
			unit: 'litre',
		},
	],
	cotton: [
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Encourages root spread and early vigor',
			price: 1380,
			unit: 'bag',
		},
		{
			name: 'Zinc Sulphate',
			type: 'Fertilizer',
			description: 'Corrects micronutrient deficiency in cotton',
			price: 460,
			unit: 'kg',
		},
		{
			name: 'Spinosad',
			type: 'Pesticide',
			description: 'Effective for bollworms and caterpillars',
			price: 980,
			unit: 'litre',
		},
	],
	sugarcane: [
		{
			name: 'Urea',
			type: 'Fertilizer',
			description: 'Improves cane growth and tiller strength',
			price: 285,
			unit: 'bag',
		},
		{
			name: 'Ammonium Sulphate',
			type: 'Fertilizer',
			description: 'Supplies nitrogen and sulfur for cane quality',
			price: 720,
			unit: 'bag',
		},
		{
			name: 'Chlorpyrifos',
			type: 'Pesticide',
			description: 'Protects against early shoot borer damage',
			price: 590,
			unit: 'litre',
		},
	],
	mustard: [
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Supports root establishment and flowering',
			price: 1320,
			unit: 'bag',
		},
		{
			name: 'Potash',
			type: 'Fertilizer',
			description: 'Improves oil content and plant resilience',
			price: 970,
			unit: 'bag',
		},
		{
			name: 'Neem Oil',
			type: 'Pesticide',
			description: 'Helps manage aphids and minor infestations',
			price: 340,
			unit: 'litre',
		},
	],
	soybean: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Balanced nutrition for pod development',
			price: 1220,
			unit: 'bag',
		},
		{
			name: 'Zinc Sulphate',
			type: 'Fertilizer',
			description: 'Supports chlorophyll and enzyme activity',
			price: 450,
			unit: 'kg',
		},
		{
			name: 'Imidacloprid',
			type: 'Pesticide',
			description: 'Controls jassids and sap-sucking pests',
			price: 730,
			unit: 'litre',
		},
	],
	groundnut: [
		{
			name: 'Gypsum + Potash Mix',
			type: 'Fertilizer',
			description: 'Improves pegging and kernel filling',
			price: 890,
			unit: 'bag',
		},
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Supports root and early pod growth',
			price: 1340,
			unit: 'bag',
		},
		{
			name: 'Neem Oil',
			type: 'Pesticide',
			description: 'Helps suppress leaf miner activity',
			price: 330,
			unit: 'litre',
		},
	],
	barley: [
		{
			name: 'Urea',
			type: 'Fertilizer',
			description: 'Improves tillering and grain biomass',
			price: 265,
			unit: 'bag',
		},
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Improves root vigor and crop stand',
			price: 1310,
			unit: 'bag',
		},
		{
			name: 'Imidacloprid',
			type: 'Pesticide',
			description: 'Protection against aphids in cool weather',
			price: 710,
			unit: 'litre',
		},
	],
	millet: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Helps balanced growth in low-input fields',
			price: 1180,
			unit: 'bag',
		},
		{
			name: 'Ammonium Sulphate',
			type: 'Fertilizer',
			description: 'Boosts nitrogen use in dryland crop',
			price: 700,
			unit: 'bag',
		},
		{
			name: 'Spinosad',
			type: 'Pesticide',
			description: 'Controls armyworm and foliar feeders',
			price: 950,
			unit: 'litre',
		},
	],
	chickpea: [
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Promotes nodulation and early root growth',
			price: 1360,
			unit: 'bag',
		},
		{
			name: 'Zinc Sulphate',
			type: 'Fertilizer',
			description: 'Improves flowering and pod set',
			price: 445,
			unit: 'kg',
		},
		{
			name: 'Spinosad',
			type: 'Pesticide',
			description: 'Useful against pod borer incidence',
			price: 990,
			unit: 'litre',
		},
	],
	lentil: [
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Supports root branching and flowering',
			price: 1330,
			unit: 'bag',
		},
		{
			name: 'Potash',
			type: 'Fertilizer',
			description: 'Helps stress tolerance and grain quality',
			price: 960,
			unit: 'bag',
		},
		{
			name: 'Imidacloprid',
			type: 'Pesticide',
			description: 'Controls sucking pests during pod stage',
			price: 720,
			unit: 'litre',
		},
	],
	peanut: [
		{
			name: 'Gypsum + Potash Mix',
			type: 'Fertilizer',
			description: 'Supports better pod filling and quality',
			price: 905,
			unit: 'bag',
		},
		{
			name: 'DAP',
			type: 'Fertilizer',
			description: 'Improves early growth and root strength',
			price: 1345,
			unit: 'bag',
		},
		{
			name: 'Chlorpyrifos',
			type: 'Pesticide',
			description: 'Helps control soil and stem pests',
			price: 575,
			unit: 'litre',
		},
	],
	sunflower: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Balanced feeding for head formation',
			price: 1230,
			unit: 'bag',
		},
		{
			name: 'Potash',
			type: 'Fertilizer',
			description: 'Improves seed filling and oil recovery',
			price: 990,
			unit: 'bag',
		},
		{
			name: 'Spinosad',
			type: 'Pesticide',
			description: 'Controls caterpillars and head borer',
			price: 970,
			unit: 'litre',
		},
	],
	potato: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Supports tuber bulking and uniform growth',
			price: 1240,
			unit: 'bag',
		},
		{
			name: 'Potash',
			type: 'Fertilizer',
			description: 'Essential for tuber size and shelf life',
			price: 1005,
			unit: 'bag',
		},
		{
			name: 'Chlorpyrifos',
			type: 'Pesticide',
			description: 'Reduces tuber moth and soil pest damage',
			price: 600,
			unit: 'litre',
		},
	],
	watermelon: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Improves vine growth and fruit setting',
			price: 1210,
			unit: 'bag',
		},
		{
			name: 'Ammonium Sulphate',
			type: 'Fertilizer',
			description: 'Supports early vegetative growth',
			price: 710,
			unit: 'bag',
		},
		{
			name: 'Neem Oil',
			type: 'Pesticide',
			description: 'Helps manage mites and fruit flies',
			price: 350,
			unit: 'litre',
		},
	],
	muskmelon: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Supports flowering and fruit sweetness',
			price: 1225,
			unit: 'bag',
		},
		{
			name: 'Zinc Sulphate',
			type: 'Fertilizer',
			description: 'Improves fruit uniformity and vigor',
			price: 455,
			unit: 'kg',
		},
		{
			name: 'Spinosad',
			type: 'Pesticide',
			description: 'Controls fruit borer and sucking pests',
			price: 965,
			unit: 'litre',
		},
	],
	cucumber: [
		{
			name: 'NPK 19-19-19',
			type: 'Fertilizer',
			description: 'Balanced nutrition for fast vine growth',
			price: 1190,
			unit: 'bag',
		},
		{
			name: 'Potash',
			type: 'Fertilizer',
			description: 'Improves fruit firmness and quality',
			price: 950,
			unit: 'bag',
		},
		{
			name: 'Neem Oil',
			type: 'Pesticide',
			description: 'Controls aphids, mites, and minor infestations',
			price: 345,
			unit: 'litre',
		},
	],
}
