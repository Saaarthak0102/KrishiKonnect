export interface MockCommunityReply {
  user: string;
  message: string;
  time: string;
}

export interface MockCommunityPost {
  id: number;
  user: string;
  location: string;
  category: 'Wheat' | 'Rice' | 'Vegetables' | 'Fruits' | 'Irrigation' | 'Pest Control';
  message: string;
  time: string;
  likes: number;
  replies: MockCommunityReply[];
}

export const mockCommunityPosts: MockCommunityPost[] = [
  // Wheat
  {
    id: 1,
    user: 'Ramesh',
    location: 'Punjab',
    category: 'Wheat',
    message: 'Leaves turning yellow in my wheat field, what fertilizer should I apply now?',
    time: '2h ago',
    likes: 7,
    replies: [
      { user: 'Suresh', message: 'This looks like nitrogen deficiency. Try urea in split dose.', time: '1h ago' },
    ],
  },
  {
    id: 2,
    user: 'Amit',
    location: 'Haryana',
    category: 'Wheat',
    message: 'When should first irrigation be done after sowing wheat this season?',
    time: '3h ago',
    likes: 4,
    replies: [],
  },
  {
    id: 3,
    user: 'Vijay',
    location: 'Uttar Pradesh',
    category: 'Wheat',
    message: 'Is rust disease common this year in western UP? Seeing orange powder on leaves.',
    time: '5h ago',
    likes: 6,
    replies: [
      { user: 'Prakash', message: 'Yes this happened in my farm too. Spray fungicide quickly.', time: '3h ago' },
      { user: 'Rahul', message: 'Keep field scouting every 3 days to avoid spread.', time: '2h ago' },
    ],
  },
  {
    id: 4,
    user: 'Mahesh',
    location: 'Madhya Pradesh',
    category: 'Wheat',
    message: 'Can I apply zinc with second irrigation in wheat at tillering stage?',
    time: '8h ago',
    likes: 2,
    replies: [],
  },
  {
    id: 5,
    user: 'Manoj',
    location: 'Rajasthan',
    category: 'Wheat',
    message: 'Any recommendation for weed control in wheat after 25 days of sowing?',
    time: '11h ago',
    likes: 1,
    replies: [],
  },

  // Rice
  {
    id: 6,
    user: 'Sunita',
    location: 'Bihar',
    category: 'Rice',
    message: 'Best fertilizer plan during tillering stage in paddy?',
    time: '1h ago',
    likes: 10,
    replies: [
      { user: 'Kiran', message: 'Use balanced NPK and avoid too much nitrogen in one shot.', time: '45m ago' },
    ],
  },
  {
    id: 7,
    user: 'Pooja',
    location: 'Tamil Nadu',
    category: 'Rice',
    message: 'What should be the water level for paddy in the early growth stage?',
    time: '4h ago',
    likes: 5,
    replies: [],
  },
  {
    id: 8,
    user: 'Rahul',
    location: 'Karnataka',
    category: 'Rice',
    message: 'Any quick solution for brown spot disease in rice nursery?',
    time: '6h ago',
    likes: 3,
    replies: [
      { user: 'Lakshmi', message: 'Try seed treatment and avoid dense nursery beds.', time: '4h ago' },
      { user: 'Amit', message: 'You should consult the local agriculture officer too.', time: '3h ago' },
    ],
  },
  {
    id: 9,
    user: 'Deepak',
    location: 'Maharashtra',
    category: 'Rice',
    message: 'Which short-duration paddy variety performs well in low rainfall areas?',
    time: '9h ago',
    likes: 2,
    replies: [],
  },
  {
    id: 10,
    user: 'Arjun',
    location: 'Gujarat',
    category: 'Rice',
    message: 'Can I reduce standing water during cloudy days in paddy fields?',
    time: '13h ago',
    likes: 0,
    replies: [],
  },

  // Vegetables
  {
    id: 11,
    user: 'Navya',
    location: 'Karnataka',
    category: 'Vegetables',
    message: 'My tomato plants are wilting suddenly in afternoon. What can be the reason?',
    time: '2h ago',
    likes: 8,
    replies: [
      { user: 'Ramesh', message: 'Check for root rot and improve drainage immediately.', time: '1h ago' },
    ],
  },
  {
    id: 12,
    user: 'Suresh',
    location: 'Madhya Pradesh',
    category: 'Vegetables',
    message: 'Best pesticide for aphids in brinjal crop without harming flowers?',
    time: '5h ago',
    likes: 4,
    replies: [],
  },
  {
    id: 13,
    user: 'Lakshmi',
    location: 'Tamil Nadu',
    category: 'Vegetables',
    message: 'How often should I irrigate cucumber crop in sandy soil?',
    time: '7h ago',
    likes: 6,
    replies: [
      { user: 'Prakash', message: 'Light irrigation every 2 days worked for me.', time: '5h ago' },
      { user: 'Sunita', message: 'Use mulch to reduce moisture loss in heat.', time: '4h ago' },
    ],
  },
  {
    id: 14,
    user: 'Prakash',
    location: 'Rajasthan',
    category: 'Vegetables',
    message: 'Leaf curl increasing in chilli plants after recent temperature rise.',
    time: '10h ago',
    likes: 2,
    replies: [],
  },
  {
    id: 15,
    user: 'Kiran',
    location: 'Uttar Pradesh',
    category: 'Vegetables',
    message: 'Is foliar spray of calcium useful during fruit set in tomato?',
    time: '1d ago',
    likes: 1,
    replies: [],
  },

  // Fruits
  {
    id: 16,
    user: 'Vijay',
    location: 'Maharashtra',
    category: 'Fruits',
    message: 'Mango flowering started early this year. Should I change fertilizer schedule?',
    time: '3h ago',
    likes: 9,
    replies: [
      { user: 'Pooja', message: 'Use potash-rich dose and avoid excess nitrogen now.', time: '2h ago' },
    ],
  },
  {
    id: 17,
    user: 'Manoj',
    location: 'Gujarat',
    category: 'Fruits',
    message: 'How to protect guava from fruit fly attack before harvest?',
    time: '6h ago',
    likes: 7,
    replies: [],
  },
  {
    id: 18,
    user: 'Amit',
    location: 'Bihar',
    category: 'Fruits',
    message: 'Best fertilizer combination for banana plants after 3 months?',
    time: '9h ago',
    likes: 4,
    replies: [
      { user: 'Deepak', message: 'Apply in split doses and include micronutrients.', time: '8h ago' },
      { user: 'Navya', message: 'Drip fertigation gives better response in banana.', time: '7h ago' },
    ],
  },
  {
    id: 19,
    user: 'Sunita',
    location: 'Punjab',
    category: 'Fruits',
    message: 'Any practical method to reduce fruit drop in kinnow orchard?',
    time: '12h ago',
    likes: 2,
    replies: [],
  },
  {
    id: 20,
    user: 'Arjun',
    location: 'Haryana',
    category: 'Fruits',
    message: 'Papaya leaves showing mosaic pattern, is this viral infection?',
    time: '1d ago',
    likes: 0,
    replies: [],
  },

  // Irrigation
  {
    id: 21,
    user: 'Deepak',
    location: 'Madhya Pradesh',
    category: 'Irrigation',
    message: 'Approximate drip irrigation cost for 1 acre vegetable farm?',
    time: '2h ago',
    likes: 12,
    replies: [
      { user: 'Mahesh', message: 'I got subsidy support, final cost was much lower.', time: '1h ago' },
    ],
  },
  {
    id: 22,
    user: 'Ramesh',
    location: 'Punjab',
    category: 'Irrigation',
    message: 'How often should wheat be irrigated in sandy loam fields?',
    time: '4h ago',
    likes: 5,
    replies: [],
  },
  {
    id: 23,
    user: 'Lakshmi',
    location: 'Tamil Nadu',
    category: 'Irrigation',
    message: 'Is sprinkler irrigation suitable for leafy vegetables in summer?',
    time: '7h ago',
    likes: 3,
    replies: [
      { user: 'Vijay', message: 'It is good, but schedule in morning to avoid scorch.', time: '6h ago' },
      { user: 'Kiran', message: 'Try short cycles to prevent runoff and water loss.', time: '5h ago' },
    ],
  },
  {
    id: 24,
    user: 'Mahesh',
    location: 'Rajasthan',
    category: 'Irrigation',
    message: 'Can mulching help reduce irrigation frequency in chilli crop?',
    time: '10h ago',
    likes: 1,
    replies: [],
  },

  // Pest Control
  {
    id: 25,
    user: 'Prakash',
    location: 'Maharashtra',
    category: 'Pest Control',
    message: 'Whiteflies attacking cotton leaves heavily after rain. What should I spray first?',
    time: '1h ago',
    likes: 11,
    replies: [
      { user: 'Rahul', message: 'Use yellow sticky traps and spray in evening.', time: '40m ago' },
    ],
  },
  {
    id: 26,
    user: 'Pooja',
    location: 'Uttar Pradesh',
    category: 'Pest Control',
    message: 'Best organic pesticide for vegetables against sucking pests?',
    time: '3h ago',
    likes: 6,
    replies: [],
  },
  {
    id: 27,
    user: 'Rahul',
    location: 'Karnataka',
    category: 'Pest Control',
    message: 'How to control armyworms in maize at early stage?',
    time: '6h ago',
    likes: 4,
    replies: [
      { user: 'Manoj', message: 'Scout at night and remove egg masses where possible.', time: '4h ago' },
      { user: 'Suresh', message: 'Neem oil spray every 5 days helped in my field.', time: '3h ago' },
    ],
  },
  {
    id: 28,
    user: 'Navya',
    location: 'Gujarat',
    category: 'Pest Control',
    message: 'Thrips increasing in onion crop, any effective integrated control method?',
    time: '9h ago',
    likes: 2,
    replies: [],
  },
];
