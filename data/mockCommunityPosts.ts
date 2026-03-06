export interface Reply {
  id: string;
  author: string;
  content_en: string;
  content_hi: string;
}

export interface Post {
  id: string;
  author: string;
  location?: string;
  cropTag_en?: string;
  cropTag_hi?: string;
  content_en: string;
  content_hi: string;
  upvotes: number;
  replies: Reply[];
  createdAt: string;
}

export const mockCommunityPosts: Post[] = [
  {
    id: "1",
    author: "Ramesh Kumar",
    location: "Punjab",
    cropTag_en: "Wheat",
    cropTag_hi: "गेहूँ",
    content_en: "Yellow spots appearing on wheat leaves. Is this rust disease?",
    content_hi: "गेहूं की पत्तियों पर पीले धब्बे दिख रहे हैं। क्या यह जंग रोग है?",
    upvotes: 2,
    createdAt: "2h ago",
    replies: [
      {
        id: "r1",
        author: "Agri Expert",
        content_en: "Yes it looks like early rust. Spray propiconazole fungicide.",
        content_hi: "हाँ, यह प्रारंभिक जंग है। प्रोपिकोनाज़ोल कवकनाशी का छिड़काव करें।"
      },
      {
        id: "r2",
        author: "Farmer Raj",
        content_en: "Same issue last year. Fungicide worked well.",
        content_hi: "पिछले साल भी यही समस्या थी। कवकनाशी बहुत अच्छी तरह काम आया।"
      }
    ]
  },
  {
    id: "2",
    author: "Sunita Devi",
    location: "UP",
    cropTag_en: "Rice",
    cropTag_hi: "धान",
    content_en: "Best time to transplant paddy in eastern UP?",
    content_hi: "पूर्वी उत्तर प्रदेश में धान का रोपण करने का सर्वश्रेष्ठ समय?",
    upvotes: 1,
    createdAt: "4h ago",
    replies: [
      {
        id: "r3",
        author: "Krishi Advisor",
        content_en: "Ideal time is late June to early July depending on rainfall.",
        content_hi: "आदर्श समय जून के अंत से जुलाई की शुरुआत तक है, वर्षा के आधार पर।"
      }
    ]
  },
  {
    id: "3",
    author: "Mahesh Patel",
    location: "Gujarat",
    cropTag_en: "Vegetables",
    cropTag_hi: "सब्जियाँ",
    content_en: "Tomato plants are flowering but not fruiting properly. Any tips?",
    content_hi: "टमाटर के पौधे फूल तो दे रहे हैं पर फल नहीं बन रहे। कोई सुझाव?",
    upvotes: 0,
    replies: [],
    createdAt: "5h ago"
  },
  {
    id: "4",
    author: "Harpreet Singh",
    location: "Punjab",
    cropTag_en: "Irrigation",
    cropTag_hi: "सिंचाई",
    content_en: "Is drip irrigation worth it for 2 acres of vegetables?",
    content_hi: "क्या 2 एकड़ की सब्जियों के लिए ड्रिप सिंचाई लायक है?",
    upvotes: 1,
    createdAt: "6h ago",
    replies: [
      {
        id: "r4",
        author: "Agri Officer",
        content_en: "Yes, government subsidy can cover up to 60% cost.",
        content_hi: "हाँ, सरकारी सहायता 60% तक लागत को कवर कर सकती है।"
      }
    ]
  },
  {
    id: "5",
    author: "Ravi Sharma",
    cropTag_en: "Pest Control",
    cropTag_hi: "कीट नियंत्रण",
    content_en: "Best organic solution for aphids on chilli plants?",
    content_hi: "मिर्च के पौधों पर जैसिड़ों के लिए सर्वश्रेष्ठ जैविक समाधान?",
    upvotes: 0,
    replies: [],
    createdAt: "8h ago"
  },
  {
    id: "6",
    author: "Sanjay Verma",
    cropTag_en: "Rice",
    cropTag_hi: "धान",
    content_en: "Which rice variety gives good yield in Bihar?",
    content_hi: "बिहार में कौन सी धान की किस्म अच्छी पैदावार देती है?",
    upvotes: 1,
    replies: [],
    createdAt: "9h ago"
  },
  {
    id: "7",
    author: "Deepak Yadav",
    cropTag_en: "Vegetables",
    cropTag_hi: "सब्जियाँ",
    content_en: "How often should we water cucumber plants in summer?",
    content_hi: "गर्मियों में खीरे के पौधों को कितनी बार पानी देना चाहिए?",
    upvotes: 0,
    replies: [],
    createdAt: "10h ago"
  },
  {
    id: "8",
    author: "Lakshmi Nair",
    cropTag_en: "Fruits",
    cropTag_hi: "फल",
    content_en: "Any tips to improve mango flowering this season?",
    content_hi: "इस मौसम में आम के फूलों को बेहतर करने के लिए कोई सुझाव?",
    upvotes: 1,
    replies: [],
    createdAt: "11h ago"
  },
  {
    id: "9",
    author: "Farmer Raj",
    cropTag_en: "Wheat",
    cropTag_hi: "गेहूँ",
    content_en: "Which fertilizer is best during wheat tillering stage?",
    content_hi: "गेहूं के कल्ले बनने के चरण में कौन सी खाद सर्वश्रेष्ठ है?",
    upvotes: 0,
    replies: [],
    createdAt: "12h ago"
  },
  {
    id: "10",
    author: "Anil Kumar",
    cropTag_en: "Pest Control",
    cropTag_hi: "कीट नियंत्रण",
    content_en: "Whiteflies attacking cotton crop. What should I spray?",
    content_hi: "सफेद मक्खियां कपास की फसल पर हमला कर रही हैं। क्या छिड़काव करूँ?",
    upvotes: 2,
    replies: [
      {
        id: "r5",
        author: "Krishi Expert",
        content_en: "Use imidacloprid spray early morning.",
        content_hi: "सुबह जल्दी इमिडाक्लोप्रिड का छिड़काव करें।"
      }
    ],
    createdAt: "1d ago"
  }
];
