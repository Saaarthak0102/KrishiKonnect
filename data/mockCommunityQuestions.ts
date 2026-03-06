export interface MockCommunityQuestion {
  id: string;
  userName: string;
  userLocation: string;
  cropTag: string;
  cropEmoji: string;
  questionText: string;
  description: string;
  upvotes: number;
  repliesCount: number;
  createdAt: string;
}

export const mockCommunityQuestions: MockCommunityQuestion[] = [
  {
    id: "mock1",
    userName: "Ramesh Singh",
    userLocation: "Punjab",
    cropTag: "Wheat",
    cropEmoji: "🌾",
    questionText: "Yellow spots appearing on wheat leaves. Is this rust disease?",
    description: "I noticed yellow-orange spots on my wheat crop leaves. They started small but are spreading. The leaves are also becoming dry. Is this yellow rust? What treatment should I use?",
    upvotes: 12,
    repliesCount: 5,
    createdAt: "2h ago"
  },
  {
    id: "mock2",
    userName: "Sunita Devi",
    userLocation: "Maharashtra",
    cropTag: "Tomato",
    cropEmoji: "🍅",
    questionText: "Tomato mandi price dropped today. Should I store harvest for a few days?",
    description: "Today's mandi price for tomatoes is ₹15/kg, down from ₹22/kg last week. My crop is ready to harvest. Should I wait for prices to recover or sell now? I have limited cold storage.",
    upvotes: 7,
    repliesCount: 3,
    createdAt: "4h ago"
  },
  {
    id: "mock3",
    userName: "Harish Patel",
    userLocation: "Gujarat",
    cropTag: "Cotton",
    cropEmoji: "🌿",
    questionText: "How often should cotton be irrigated during flowering stage?",
    description: "My cotton plants are entering the flowering stage. Currently irrigating every 7 days. Is this enough or should I increase frequency? The weather has been hot lately.",
    upvotes: 9,
    repliesCount: 4,
    createdAt: "6h ago"
  },
  {
    id: "mock4",
    userName: "Lakshmi Reddy",
    userLocation: "Telangana",
    cropTag: "Rice",
    cropEmoji: "🌾",
    questionText: "Best time to apply urea fertilizer in paddy?",
    description: "My paddy crop is 25 days old. When should I apply the first dose of urea? Some farmers say to apply at tillering stage, others say earlier. What's your experience?",
    upvotes: 15,
    repliesCount: 8,
    createdAt: "8h ago"
  },
  {
    id: "mock5",
    userName: "Vijay Kumar",
    userLocation: "Karnataka",
    cropTag: "Sugarcane",
    cropEmoji: "🎋",
    questionText: "White grubs attacking sugarcane roots. Need urgent solution!",
    description: "Found white grubs in the soil damaging my sugarcane roots. Plants are yellowing. What pesticide works best? Is there any organic solution?",
    upvotes: 11,
    repliesCount: 6,
    createdAt: "10h ago"
  },
  {
    id: "mock6",
    userName: "Priya Sharma",
    userLocation: "Madhya Pradesh",
    cropTag: "Soybean",
    cropEmoji: "🫘",
    questionText: "Soybean leaves curling after recent rain. Normal or disease?",
    description: "After heavy rainfall last week, soybean leaves are curling downward. No visible pests. Soil seems waterlogged in some areas. Should I be worried?",
    upvotes: 6,
    repliesCount: 2,
    createdAt: "12h ago"
  },
  {
    id: "mock7",
    userName: "Rajesh Yadav",
    userLocation: "Uttar Pradesh",
    cropTag: "Potato",
    cropEmoji: "🥔",
    questionText: "Which potato variety gives best yield in North India?",
    description: "Planning to plant potatoes next season. Looking for variety with high yield and good disease resistance. Kufri Jyoti or Kufri Pukhraj - which is better for UP region?",
    upvotes: 13,
    repliesCount: 7,
    createdAt: "1d ago"
  },
  {
    id: "mock8",
    userName: "Anita Kaur",
    userLocation: "Haryana",
    cropTag: "Mustard",
    cropEmoji: "🌱",
    questionText: "Aphid infestation on mustard crop. Organic remedies?",
    description: "Black aphids have covered my mustard plants. Looking for organic pest control methods. Has anyone tried neem oil spray? What concentration works?",
    upvotes: 8,
    repliesCount: 5,
    createdAt: "1d ago"
  },
  {
    id: "mock9",
    userName: "Mohan Lal",
    userLocation: "Rajasthan",
    cropTag: "Bajra",
    cropEmoji: "🌾",
    questionText: "Bajra crop turning yellow despite fertilizer use. What's wrong?",
    description: "Applied DAP and urea as recommended, but bajra plants are still turning yellow from bottom leaves. Soil test pending. Could it be iron deficiency or something else?",
    upvotes: 10,
    repliesCount: 4,
    createdAt: "1d ago"
  },
  {
    id: "mock10",
    userName: "Geeta Patel",
    userLocation: "Maharashtra",
    cropTag: "Onion",
    cropEmoji: "🧅",
    questionText: "When to harvest onions for maximum storage life?",
    description: "My onion crop is ready. Some farmers say harvest when 50% tops fall, others say wait for 70%. What's the ideal time to harvest if I want to store for 3-4 months?",
    upvotes: 14,
    repliesCount: 9,
    createdAt: "2d ago"
  },
  {
    id: "mock11",
    userName: "Suresh Naik",
    userLocation: "Odisha",
    cropTag: "Rice",
    cropEmoji: "🌾",
    questionText: "Brown spots on rice leaves spreading fast. Help!",
    description: "Brown oval spots with yellow halo on rice leaves. Started from edges, now covering whole leaves. Is this blast disease? Need immediate treatment advice.",
    upvotes: 9,
    repliesCount: 3,
    createdAt: "2d ago"
  },
  {
    id: "mock12",
    userName: "Kiran Desai",
    userLocation: "Gujarat",
    cropTag: "Groundnut",
    cropEmoji: "🥜",
    questionText: "Best method to control tikka disease in groundnut?",
    description: "Small brown spots appearing on groundnut leaves. Recognized as tikka disease. What fungicide should I use? Any preventive measures for next season?",
    upvotes: 7,
    repliesCount: 2,
    createdAt: "3d ago"
  }
];
