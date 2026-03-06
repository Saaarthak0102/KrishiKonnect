export interface Reply {
  id: string;
  author: string;
  content: string;
}

export interface Post {
  id: string;
  author: string;
  location?: string;
  cropTag?: string;
  content: string;
  upvotes: number;
  replies: Reply[];
  createdAt: string;
}

export const mockCommunityPosts: Post[] = [
  {
    id: "1",
    author: "Ramesh Kumar",
    location: "Punjab",
    cropTag: "Wheat",
    content: "Yellow spots appearing on wheat leaves. Is this rust disease?",
    upvotes: 2,
    createdAt: "2h ago",
    replies: [
      {
        id: "r1",
        author: "Agri Expert",
        content: "Yes it looks like early rust. Spray propiconazole fungicide."
      },
      {
        id: "r2",
        author: "Farmer Raj",
        content: "Same issue last year. Fungicide worked well."
      }
    ]
  },
  {
    id: "2",
    author: "Sunita Devi",
    location: "UP",
    cropTag: "Rice",
    content: "Best time to transplant paddy in eastern UP?",
    upvotes: 1,
    createdAt: "4h ago",
    replies: [
      {
        id: "r3",
        author: "Krishi Advisor",
        content: "Ideal time is late June to early July depending on rainfall."
      }
    ]
  },
  {
    id: "3",
    author: "Mahesh Patel",
    location: "Gujarat",
    cropTag: "Vegetables",
    content: "Tomato plants are flowering but not fruiting properly. Any tips?",
    upvotes: 0,
    replies: [],
    createdAt: "5h ago"
  },
  {
    id: "4",
    author: "Harpreet Singh",
    location: "Punjab",
    cropTag: "Irrigation",
    content: "Is drip irrigation worth it for 2 acres of vegetables?",
    upvotes: 1,
    createdAt: "6h ago",
    replies: [
      {
        id: "r4",
        author: "Agri Officer",
        content: "Yes, government subsidy can cover up to 60% cost."
      }
    ]
  },
  {
    id: "5",
    author: "Ravi Sharma",
    cropTag: "Pest Control",
    content: "Best organic solution for aphids on chilli plants?",
    upvotes: 0,
    replies: [],
    createdAt: "8h ago"
  },
  {
    id: "6",
    author: "Sanjay Verma",
    cropTag: "Rice",
    content: "Which rice variety gives good yield in Bihar?",
    upvotes: 1,
    replies: [],
    createdAt: "9h ago"
  },
  {
    id: "7",
    author: "Deepak Yadav",
    cropTag: "Vegetables",
    content: "How often should we water cucumber plants in summer?",
    upvotes: 0,
    replies: [],
    createdAt: "10h ago"
  },
  {
    id: "8",
    author: "Lakshmi Nair",
    cropTag: "Fruits",
    content: "Any tips to improve mango flowering this season?",
    upvotes: 1,
    replies: [],
    createdAt: "11h ago"
  },
  {
    id: "9",
    author: "Farmer Raj",
    cropTag: "Wheat",
    content: "Which fertilizer is best during wheat tillering stage?",
    upvotes: 0,
    replies: [],
    createdAt: "12h ago"
  },
  {
    id: "10",
    author: "Anil Kumar",
    cropTag: "Pest Control",
    content: "Whiteflies attacking cotton crop. What should I spray?",
    upvotes: 2,
    replies: [
      {
        id: "r5",
        author: "Krishi Expert",
        content: "Use imidacloprid spray early morning."
      }
    ],
    createdAt: "1d ago"
  }
];
