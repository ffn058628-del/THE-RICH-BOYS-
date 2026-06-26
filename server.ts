/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { 
  UserProfile, Match, Message, Subscription, Coupon, Report, SystemStats, SubscriptionTier 
} from './src/types';

dotenv.config();

// Initialize Gemini SDK with named parameters & User-Agent for telemetry
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini API:', err);
  }
} else {
  console.log('No GEMINI_API_KEY found. Using rule-based fallback generators.');
}

const app = express();
app.use(express.json());

const PORT = 3000;

// ==========================================
// SEED DATABASE STATE (In-Memory Database)
// ==========================================

// Current logged-in user profile
let currentUserProfile: UserProfile = {
  id: 'current_user',
  name: 'Alex Mercer',
  age: 26,
  gender: 'male',
  seeking: 'female',
  bio: 'Product Designer who loves matcha lattes, brutalist architecture, and searching for the perfect record store. Looking for someone to explore hidden cafes with!',
  photos: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600'
  ],
  verificationStatus: 'verified',
  interests: ['Coffee', 'Design', 'Vinyl Records', 'Modern Art', 'Hiking', 'Architecture'],
  location: 'San Francisco, CA',
  occupation: 'Lead Product Designer',
  education: 'RISD (BFA)',
  subscriptionTier: 'free',
  isFake: false,
  onlineStatus: 'online',
  lastActive: new Date().toISOString()
};

// Seed profiles
let seededProfiles: UserProfile[] = [
  {
    id: 'user_sarah',
    name: 'Sarah Chen',
    age: 25,
    gender: 'female',
    seeking: 'male',
    bio: 'Travel photographer & tea lover. Always chasing golden hour. Tell me your favorite destination, and let’s plan an adventure! 📸✈️',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'verified',
    interests: ['Photography', 'Travel', 'Tea Culture', 'Hiking', 'Sushi', 'Indie Rock'],
    location: 'Oakland, CA',
    occupation: 'Freelance Photographer',
    education: 'UC Berkeley',
    subscriptionTier: 'gold',
    isFake: false,
    onlineStatus: 'online',
    lastActive: new Date().toISOString()
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    age: 24,
    gender: 'female',
    seeking: 'male',
    bio: 'Curator at a contemporary art gallery. Passionate about minimalism, ceramic sculpture, and indie cinema. Can usually be found reading in a park on Sunday mornings.',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'verified',
    interests: ['Modern Art', 'Reading', 'Cinema', 'Design', 'Wine Tasting', 'Yoga'],
    location: 'San Francisco, CA',
    occupation: 'Gallery Curator',
    education: 'Stanford University (MA)',
    subscriptionTier: 'platinum',
    isFake: false,
    onlineStatus: 'online',
    lastActive: new Date().toISOString()
  },
  {
    id: 'user_chloe',
    name: 'Chloe Jenkins',
    age: 27,
    gender: 'female',
    seeking: 'everyone',
    bio: 'Architect. I design buildings by day and sketch urban spaces by night. Dog mom to a golden retriever named Bauhaus. Let’s grab a craft beer and talk spatial theories!',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'verified',
    interests: ['Architecture', 'Dogs', 'Craft Beer', 'Sketching', 'Brunch', 'Live Music'],
    location: 'San Francisco, CA',
    occupation: 'Senior Architect',
    education: 'Cornell University',
    subscriptionTier: 'plus',
    isFake: false,
    onlineStatus: 'away',
    lastActive: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'user_olivia',
    name: 'Olivia Martinez',
    age: 26,
    gender: 'female',
    seeking: 'male',
    bio: 'Food truck owner and self-proclaimed hot sauce sommelier. Let’s skip the small talk and discuss the best tacos in Northern California. 🌮🔥',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'unverified',
    interests: ['Cooking', 'Tacos', 'Hot Sauce', 'Farmers Markets', 'Live Comedy', 'Camping'],
    location: 'San Jose, CA',
    occupation: 'Culinary Entrepreneur',
    education: 'Culinary Institute of America',
    subscriptionTier: 'free',
    isFake: false,
    onlineStatus: 'offline',
    lastActive: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'user_mia',
    name: 'Mia Thorne',
    age: 28,
    gender: 'female',
    seeking: 'male',
    bio: 'Hello! I am a full-time tech investor. I love cycling, playing tennis, skiing in Lake Tahoe, and exploring start-up ideas. Looking for someone active, motivated, and open to deep conversations.',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'verified',
    interests: ['Tennis', 'Skiing', 'Cycling', 'Tech', 'Startup Ideas', 'Espresso'],
    location: 'Palo Alto, CA',
    occupation: 'Venture Capital Associate',
    education: 'Stanford GSB',
    subscriptionTier: 'gold',
    isFake: false,
    onlineStatus: 'online',
    lastActive: new Date().toISOString()
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    age: 28,
    gender: 'male',
    seeking: 'female',
    bio: 'Full Stack Engineer. If I’m not coding, I’m probably mountain biking or brewing my own IPAs. Looking for a partner-in-crime for coastal road trips! 🚴‍♂️🍻',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'verified',
    interests: ['Tech', 'Mountain Biking', 'Home Brewing', 'Road Trips', 'Indie Rock', 'Coffee'],
    location: 'Marin, CA',
    occupation: 'Software Engineer',
    education: 'UCLA (Computer Science)',
    subscriptionTier: 'free',
    isFake: false,
    onlineStatus: 'online',
    lastActive: new Date().toISOString()
  },
  {
    id: 'user_david',
    name: 'David Thorne',
    age: 31,
    gender: 'male',
    seeking: 'female',
    bio: 'Michelin star chef who cooks far simpler meals at home. Love outdoor fire pits, old-school vinyl, and late night highway drives. Feed your soul!',
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'verified',
    interests: ['Cooking', 'Vinyl Records', 'Fine Dining', 'Stargazing', 'Camping', 'Road Trips'],
    location: 'Napa, CA',
    occupation: 'Head Chef',
    education: 'Le Cordon Bleu',
    subscriptionTier: 'gold',
    isFake: false,
    onlineStatus: 'away',
    lastActive: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: 'user_scammer_bot',
    name: 'Crypto_Princess_99',
    age: 22,
    gender: 'female',
    seeking: 'everyone',
    bio: 'Hi! I do not check this app often. Add my whatsapp +1-555-0199 or telegram for direct chat! I can teach you how to make $10k per week doing crypto trade. Fast, 100% legal, no risk! 💸📈❤️',
    photos: [
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=600'
    ],
    verificationStatus: 'unverified',
    interests: ['Tech', 'Startup Ideas', 'Tacos', 'Hot Sauce'],
    location: 'Miami, FL',
    occupation: 'Crypto Trader',
    education: 'High School of Finance',
    subscriptionTier: 'free',
    isFake: true, // Tagged as fake profile for moderation detection
    onlineStatus: 'online',
    lastActive: new Date().toISOString()
  }
];

// In-memory collections
let userSwipes: Record<string, 'like' | 'dislike' | 'superlike'> = {}; // TargetUserId -> action
let userMatches: Match[] = [];
let matchMessages: Record<string, Message[]> = {};
let activeSubscriptions: Subscription[] = [];
let userReports: Report[] = [];
let blockedUserIds: string[] = [];

// Pre-populate one match so the user has someone to chat with immediately!
const initialMatchId = 'match_sarah_chen';
userMatches.push({
  id: initialMatchId,
  user1Id: 'current_user',
  user2Id: 'user_sarah',
  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  active: true
});

matchMessages[initialMatchId] = [
  {
    id: 'msg_initial_1',
    matchId: initialMatchId,
    senderId: 'user_sarah',
    text: 'Hey Alex! I saw on your profile that you love vinyl records. What kind of genres do you collect?',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    read: true
  },
  {
    id: 'msg_initial_2',
    matchId: initialMatchId,
    senderId: 'current_user',
    text: 'Hey Sarah! I gather mostly 70s funk, soul, and a fair share of ambient indie rock. What about you? Your travel pictures look stunning!',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString(),
    read: true
  },
  {
    id: 'msg_initial_3',
    matchId: initialMatchId,
    senderId: 'user_sarah',
    text: 'Oh, funk and soul is amazing on vinyl! The warmth is unbeatable. For me, I love capturing local street scenes in East Asia, especially late-night markets.',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000 * 2.0).toISOString(),
    read: true
  }
];

// Support coupons
const systemCoupons: Coupon[] = [
  { code: 'AURA50', discountPercent: 50, active: true, description: 'Get 50% off any premium subscription plan' },
  { code: 'LOVEFREE', discountPercent: 100, active: true, description: '100% off - 1 month trial tier' },
  { code: 'VIP25', discountPercent: 25, active: true, description: '25% off priority premium pass' }
];

// Billing logs
interface BillingInvoice {
  id: string;
  plan: SubscriptionTier;
  amount: number;
  date: string;
  couponCode?: string;
  status: 'paid' | 'refunded';
}
let billingInvoices: Record<string, BillingInvoice[]> = {
  'current_user': []
};

// Seed some reports for admin moderation demo
userReports.push({
  id: 'rep_1',
  reporterId: 'user_mia',
  reportedId: 'user_scammer_bot',
  reason: 'Financial Scam/Spam',
  description: 'Promoting dangerous crypto investments in bio and sending suspicious WhatsApp links.',
  status: 'pending',
  createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
});

// ==========================================
// GEMINI API UTILITY FUNCTIONS
// ==========================================

/**
 * AI Profile Suggestions & Mutual Compatibility Explainer
 */
async function generateAiCompatibility(userProfile: UserProfile, targetProfile: UserProfile): Promise<{ score: number; reasoning: string }> {
  if (!aiClient) {
    // Elegant offline rule-based generator
    const mutualInterests = userProfile.interests.filter(item => targetProfile.interests.includes(item));
    let score = 65 + Math.floor(Math.random() * 20); // base score 65-85
    if (mutualInterests.length > 0) {
      score += Math.min(mutualInterests.length * 6, 15);
    }
    score = Math.min(score, 99);

    const reasons = [
      `Aura AI detected highly aligned interests in ${mutualInterests.join(', ') || 'aesthetic lifestyle'}.`,
      `Your creative focus on '${userProfile.occupation}' pairs beautifully with their background as '${targetProfile.occupation}'.`,
      `Both profiles share a modern design sensibility and value curiosity.`
    ];

    return {
      score,
      reasoning: reasons.join(' ')
    };
  }

  try {
    const prompt = `Analyze compatibility between User A and User B.
    User A: Name: ${userProfile.name}, Bio: "${userProfile.bio}", Interests: [${userProfile.interests.join(', ')}], Occupation: "${userProfile.occupation}".
    User B: Name: ${targetProfile.name}, Bio: "${targetProfile.bio}", Interests: [${targetProfile.interests.join(', ')}], Occupation: "${targetProfile.occupation}".
    
    Provide a compatibility report in JSON format with two properties:
    - "score": A compatibility rating between 1 and 100.
    - "reasoning": A 1-2 sentence description explaining exactly why they fit (mentioning mutual interests or complementary backgrounds).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Compatibility score out of 100' },
            reasoning: { type: Type.STRING, description: 'Explanation of compatibility' }
          },
          required: ['score', 'reasoning']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return {
        score: Number(data.score) || 75,
        reasoning: data.reasoning || 'Highly compatible based on matching lifestyle profiles.'
      };
    }
  } catch (err) {
    console.error('Gemini compatibility error:', err);
  }

  return { score: 82, reasoning: 'Strong visual and interest pairing detected.' };
}

/**
 * AI Icebreaker Generator
 */
async function generateIcebreakers(userProfile: UserProfile, targetProfile: UserProfile): Promise<string[]> {
  const fallbackIcebreakers = [
    `Hey ${targetProfile.name}! I love that you are into ${targetProfile.interests[0] || 'exploring'}. What got you interested in that?`,
    `Hi ${targetProfile.name}, ${targetProfile.bio.includes('dog') || targetProfile.bio.includes('pet') ? "Your pet is absolutely adorable! What's their name?" : "I see both of us share a love for " + (targetProfile.interests[1] || 'coffee') + "!"}`,
    `As a ${userProfile.occupation}, I really appreciate your background as a ${targetProfile.occupation}. Let's find some mutual ground!`
  ];

  if (!aiClient) return fallbackIcebreakers;

  try {
    const prompt = `You are a conversational dating wingman for a high-end social app called Aura.
    Generate exactly 3 creative, engaging, and witty icebreaker openers from ${userProfile.name} to ${targetProfile.name}.
    Context:
    ${userProfile.name}'s bio: "${userProfile.bio}", Interests: [${userProfile.interests.join(', ')}]
    ${targetProfile.name}'s bio: "${targetProfile.bio}", Interests: [${targetProfile.interests.join(', ')}]
    Make sure the icebreakers mention a specific shared interest or a cool element from ${targetProfile.name}'s bio. Keep each under 120 characters. Return a clean JSON array of strings.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 icebreaker messages'
        }
      }
    });

    if (response.text) {
      const arr = JSON.parse(response.text.trim());
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (err) {
    console.error('Gemini icebreaker error:', err);
  }

  return fallbackIcebreakers;
}

/**
 * AI Conversation Assistant: Suggest engaging reply
 */
async function generateSuggestedReply(userProfile: UserProfile, targetProfile: UserProfile, chatHistory: Message[]): Promise<string> {
  const lastMessageText = chatHistory[chatHistory.length - 1]?.text || '';
  const fallbackReply = `That sounds incredible, ${targetProfile.name}! I'd love to chat more about that over coffee sometime. ☕`;

  if (!aiClient) return fallbackReply;

  try {
    const historyFormatted = chatHistory.slice(-5).map(m => `${m.senderId === 'current_user' ? 'Me' : targetProfile.name}: "${m.text}"`).join('\n');
    const prompt = `You are the chat assistant on a premium dating app.
    Recommend one natural, witty, and engaging reply for Me (${userProfile.name}) to send to ${targetProfile.name}.
    
    My profile details: "${userProfile.bio}"
    Their profile details: "${targetProfile.bio}"
    Recent Chat History:
    ${historyFormatted}

    Analyze ${targetProfile.name}'s last message and draft a charming response. Keep it short, authentic, and ending with an open-ended question to keep the conversation going. Avoid cheesy pick-up lines. Return JSON with a single key "reply".`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: 'Charismatic, natural text reply' }
          },
          required: ['reply']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return data.reply || fallbackReply;
    }
  } catch (err) {
    console.error('Gemini suggested reply error:', err);
  }

  return fallbackReply;
}

/**
 * AI Fake Profile Detection Audit Tool
 */
async function auditFakeProfile(targetProfile: UserProfile): Promise<{ isSuspicious: boolean; suspicionScore: number; reason: string }> {
  const offlineCheck = targetProfile.isFake || targetProfile.bio.toLowerCase().includes('whatsapp') || targetProfile.bio.toLowerCase().includes('$') || targetProfile.bio.toLowerCase().includes('crypto');
  
  const fallback = {
    isSuspicious: offlineCheck,
    suspicionScore: offlineCheck ? 92 : 12,
    reason: offlineCheck 
      ? 'High alert: Contains off-platform contact handles, financial promotion (crypto trading guarantees), and atypical social dating bio patterns.' 
      : 'Clean: Solid interest mapping, coherent career path, and typical social behavior patterns.'
  };

  if (!aiClient) return fallback;

  try {
    const prompt = `Perform a security review on a social dating profile to flag scammers, bots, and fakes.
    Profile details to audit:
    Name: "${targetProfile.name}"
    Age: ${targetProfile.age}
    Occupation: "${targetProfile.occupation}"
    Education: "${targetProfile.education}"
    Location: "${targetProfile.location}"
    Bio: "${targetProfile.bio}"
    Verification Gesture: "${targetProfile.verificationStatus}"

    Look for warning signs:
    - High-pressure sales pitches, cryptocurrency, financial guarantees.
    - Redirecting to off-platform channels immediately (WhatsApp, Telegram links, snap/kik in bio).
    - Extremely generic or robotic descriptions.
    - Contradictory information.

    Return a structured JSON output:
    - "isSuspicious": boolean (true/false)
    - "suspicionScore": number between 0 and 100.
    - "reason": A detailed 2-sentence rationale for the verdict.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSuspicious: { type: Type.BOOLEAN },
            suspicionScore: { type: Type.INTEGER },
            reason: { type: Type.STRING }
          },
          required: ['isSuspicious', 'suspicionScore', 'reason']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (err) {
    console.error('Gemini audit fake profile error:', err);
  }

  return fallback;
}

/**
 * AI Matched Persona Response Emulator
 * Simulates real-time messaging by generating custom automated chat replies based on user messages.
 */
async function generateSimulatedMatchReply(matchProfile: UserProfile, userMessageText: string, chatHistory: Message[]): Promise<string> {
  const fallbackReplies = [
    `That is so interesting! I completely agree. Let’s talk more about that!`,
    `Oh really? Haha, I love that! What else do you like to do on weekends?`,
    `I would love to tell you more about it! Maybe over a drink sometime? 😉`,
    `Thanks Alex! Your recommendation is noted. I am definitely looking forward to seeing where this goes.`
  ];
  const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

  if (!aiClient) return randomFallback;

  try {
    const historyFormatted = chatHistory.slice(-6).map(m => `${m.senderId === 'current_user' ? 'Alex' : matchProfile.name}: "${m.text}"`).join('\n');
    const prompt = `You are roleplaying as ${matchProfile.name}, a real dating app user.
    Roleplay guidelines:
    - Age: ${matchProfile.age}
    - Profession: ${matchProfile.occupation}
    - Bio: "${matchProfile.bio}"
    - Interests: [${matchProfile.interests.join(', ')}]
    - Tone: Charismatic, friendly, modern, slightly playful, uses emojis occasionally.
    - Rule: Keep your reply brief (1-2 sentences), like a realistic SMS/chat message. Never sound like an AI assistant. Stay in character!

    Alex sent you a message: "${userMessageText}"
    Recent Chat History context:
    ${historyFormatted}

    Draft your reply now as ${matchProfile.name}:`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    if (response.text) {
      return response.text.trim();
    }
  } catch (err) {
    console.error('Gemini roleplay reply error:', err);
  }

  return randomFallback;
}


// ==========================================
// API ENDPOINTS
// ==========================================

// Authenticated User Profile
app.get('/api/user/profile', (req: Request, res: Response) => {
  res.json(currentUserProfile);
});

app.post('/api/user/profile', (req: Request, res: Response) => {
  const { name, age, gender, seeking, bio, interests, location, occupation, education, photos } = req.body;
  
  currentUserProfile = {
    ...currentUserProfile,
    name: name || currentUserProfile.name,
    age: age ? Number(age) : currentUserProfile.age,
    gender: gender || currentUserProfile.gender,
    seeking: seeking || currentUserProfile.seeking,
    bio: bio || currentUserProfile.bio,
    interests: interests || currentUserProfile.interests,
    location: location || currentUserProfile.location,
    occupation: occupation || currentUserProfile.occupation,
    education: education || currentUserProfile.education,
    photos: photos || currentUserProfile.photos
  };

  res.json({ success: true, profile: currentUserProfile });
});

// Profile Verification Flow
app.post('/api/user/verify', (req: Request, res: Response) => {
  currentUserProfile.verificationStatus = 'verified';
  res.json({ success: true, verificationStatus: 'verified' });
});

// Fetch Swiping Cards Deck
app.get('/api/profiles', async (req: Request, res: Response) => {
  // Filters
  const genderFilter = req.query.gender as string;
  const ageMin = Number(req.query.ageMin) || 18;
  const ageMax = Number(req.query.ageMax) || 50;
  const searchInterests = req.query.interests ? (req.query.interests as string).split(',') : [];
  const queryLocation = req.query.location as string; // Premium passport feature

  // Filter out:
  // 1. Swiped users
  // 2. Blocked users
  // 3. User itself
  const swipedTargetIds = Object.keys(userSwipes);
  
  let filtered = seededProfiles.filter(p => {
    if (p.id === 'current_user' || swipedTargetIds.includes(p.id) || blockedUserIds.includes(p.id)) {
      return false;
    }

    // Seek filter
    if (currentUserProfile.seeking !== 'everyone') {
      if (p.gender !== currentUserProfile.seeking) return false;
    }

    // Age filter
    if (p.age < ageMin || p.age > ageMax) return false;

    // Interest Filter
    if (searchInterests.length > 0) {
      const match = p.interests.some(i => searchInterests.includes(i));
      if (!match) return false;
    }

    // Location (if Passport not active, matches local; if active, matches passport location)
    const activeLoc = queryLocation || currentUserProfile.location;
    if (activeLoc && !p.isFake) {
      // Just a simple local mock check: same city or same state
      const targetState = p.location.split(',')[1]?.trim();
      const userState = activeLoc.split(',')[1]?.trim();
      if (targetState && userState && targetState !== userState && !queryLocation) {
        // If not explicit premium passport change, filter out of state
        return false;
      }
    }

    return true;
  });

  // Calculate AI suggestions dynamically if requested, or populate random scores
  const results = await Promise.all(filtered.map(async (p) => {
    // Generate/cache compatibility score
    const comp = await generateAiCompatibility(currentUserProfile, p);
    return {
      ...p,
      matchScore: comp.score,
      compatibilityNotes: comp.reasoning
    };
  }));

  // Sort by highest match score
  results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  res.json(results);
});

// AI Profile Recommendations Summary
app.post('/api/profiles/ai-suggestions', async (req: Request, res: Response) => {
  // Analyze top 3 seeded profiles and return structured AI explanations
  const deck = seededProfiles.filter(p => p.id !== 'user_scammer_bot');
  const suggestions = await Promise.all(deck.slice(0, 3).map(async (p) => {
    const comp = await generateAiCompatibility(currentUserProfile, p);
    return {
      userId: p.id,
      name: p.name,
      photo: p.photos[0],
      matchScore: comp.score,
      reason: comp.reasoning
    };
  }));

  res.json({ success: true, suggestions });
});

// Swipe Trigger
app.post('/api/swipe', async (req: Request, res: Response) => {
  const { targetId, action } = req.body as { targetId: string; action: 'like' | 'dislike' | 'superlike' };
  
  if (!targetId || !action) {
    return res.status(400).json({ error: 'Missing targetId or action' });
  }

  userSwipes[targetId] = action;

  // Find target profile
  const targetProfile = seededProfiles.find(p => p.id === targetId);
  if (!targetProfile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Matching algorithm:
  // Sarah Chen & Elena always reciprocate a "like" to let the user play with Chat immediately!
  // Scammer bot also always matches to show moderation triggers!
  // Others have a 50% match chance for organic feeling.
  const isSarahOrElena = targetId === 'user_sarah' || targetId === 'user_elena' || targetId === 'user_scammer_bot';
  const forceMatch = isSarahOrElena || action === 'superlike' || Math.random() > 0.5;

  if ((action === 'like' || action === 'superlike') && forceMatch) {
    const matchId = `match_${targetId}_${Date.now()}`;
    const newMatch: Match = {
      id: matchId,
      user1Id: 'current_user',
      user2Id: targetId,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      active: true
    };

    userMatches.push(newMatch);
    matchMessages[matchId] = [];

    // Trigger an AI onboarding icebreaker!
    const openers = await generateIcebreakers(currentUserProfile, targetProfile);

    return res.json({
      isMatch: true,
      match: newMatch,
      matchedProfile: targetProfile,
      aiOpeners: openers
    });
  }

  res.json({ isMatch: false });
});

// Get Matches
app.get('/api/matches', (req: Request, res: Response) => {
  const list = userMatches.filter(m => m.active && !blockedUserIds.includes(m.user2Id));
  const results = list.map(m => {
    const partnerId = m.user1Id === 'current_user' ? m.user2Id : m.user1Id;
    const partnerProfile = seededProfiles.find(p => p.id === partnerId) || currentUserProfile;
    const history = matchMessages[m.id] || [];
    const lastMessage = history[history.length - 1];

    return {
      matchId: m.id,
      partnerProfile,
      lastMessage,
      createdAt: m.createdAt,
      lastMessageAt: m.lastMessageAt
    };
  });

  // Sort by latest message
  results.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  res.json(results);
});

// Get Private Chat Messages
app.get('/api/matches/:matchId/messages', (req: Request, res: Response) => {
  const { matchId } = req.params;
  const list = matchMessages[matchId] || [];
  res.json(list);
});

// Send Chat Message with AI Simulator Response
app.post('/api/matches/:matchId/messages', async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { text, type, voiceDuration, imageUrl } = req.body;

  if (!text && !imageUrl) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  // Append user's message
  const userMsg: Message = {
    id: `msg_user_${Date.now()}`,
    matchId,
    senderId: 'current_user',
    text: text || '',
    type: type || 'text',
    voiceDuration,
    imageUrl,
    timestamp: new Date().toISOString(),
    read: true
  };

  if (!matchMessages[matchId]) {
    matchMessages[matchId] = [];
  }
  matchMessages[matchId].push(userMsg);

  // Update match last action
  const match = userMatches.find(m => m.id === matchId);
  if (match) {
    match.lastMessageAt = new Date().toISOString();
  }

  // Trigger simulated typing indicator and partner response!
  const partnerId = match ? (match.user1Id === 'current_user' ? match.user2Id : match.user1Id) : null;
  const partnerProfile = seededProfiles.find(p => p.id === partnerId);

  if (partnerProfile) {
    // Schedule a background response (Simulated server event / delay)
    // In our full-stack container, we can queue this to run after 2.5 seconds
    setTimeout(async () => {
      try {
        const history = matchMessages[matchId] || [];
        // Generate AI response in character
        let replyText = '';
        if (partnerProfile.isFake) {
          replyText = `Hey honey! Did you check my profile? Let's chat on WhatsApp for fast text +1-555-0199 or Telegram. I am ready to show you how I make $10k online! Click this link to register: http://crypto-win-aura.com`;
        } else {
          replyText = await generateSimulatedMatchReply(partnerProfile, text || '[Shared an item]', history);
        }

        const partnerMsg: Message = {
          id: `msg_partner_${Date.now()}`,
          matchId,
          senderId: partnerProfile.id,
          text: replyText,
          type: 'text',
          timestamp: new Date().toISOString(),
          read: false
        };

        matchMessages[matchId].push(partnerMsg);
        if (match) {
          match.lastMessageAt = new Date().toISOString();
        }
      } catch (err) {
        console.error('Error generating simulator reply:', err);
      }
    }, 2500);
  }

  res.json(userMsg);
});

// Match AI Icebreakers Suggestion
app.post('/api/matches/:matchId/ai-icebreakers', async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const match = userMatches.find(m => m.id === matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const partnerId = match.user1Id === 'current_user' ? match.user2Id : match.user1Id;
  const partnerProfile = seededProfiles.find(p => p.id === partnerId);

  if (!partnerProfile) return res.status(404).json({ error: 'Partner not found' });

  const icebreakers = await generateIcebreakers(currentUserProfile, partnerProfile);
  res.json({ success: true, icebreakers });
});

// Chat AI Reply Suggestion Helper
app.post('/api/matches/:matchId/ai-reply-helper', async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const history = matchMessages[matchId] || [];
  const match = userMatches.find(m => m.id === matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const partnerId = match.user1Id === 'current_user' ? match.user2Id : match.user1Id;
  const partnerProfile = seededProfiles.find(p => p.id === partnerId);

  if (!partnerProfile) return res.status(404).json({ error: 'Partner profile not found' });

  const suggested = await generateSuggestedReply(currentUserProfile, partnerProfile, history);
  res.json({ success: true, suggestedReply: suggested });
});

// AI Fake Audit Check
app.post('/api/profiles/:profileId/fake-audit', async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const profile = seededProfiles.find(p => p.id === profileId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const audit = await auditFakeProfile(profile);
  res.json({ success: true, ...audit });
});

// Block/Report User Actions
app.post('/api/user/block', (req: Request, res: Response) => {
  const { targetId } = req.body;
  if (!targetId) return res.status(400).json({ error: 'Missing targetId' });

  if (!blockedUserIds.includes(targetId)) {
    blockedUserIds.push(targetId);
  }

  // Deactivate mutual matches
  userMatches = userMatches.map(m => {
    if ((m.user1Id === 'current_user' && m.user2Id === targetId) || (m.user2Id === 'current_user' && m.user1Id === targetId)) {
      return { ...m, active: false };
    }
    return m;
  });

  res.json({ success: true, blockedUserIds });
});

app.post('/api/user/report', (req: Request, res: Response) => {
  const { targetId, reason, description } = req.body;
  if (!targetId || !reason) return res.status(400).json({ error: 'Missing targetId or reason' });

  const newReport: Report = {
    id: `rep_${Date.now()}`,
    reporterId: 'current_user',
    reportedId: targetId,
    reason,
    description: description || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  userReports.push(newReport);
  res.json({ success: true, report: newReport });
});


// ==========================================
// BILLING / SUBSCRIPTION SANDBOX ENDPOINTS
// ==========================================

// Validate Coupon Code
app.get('/api/billing/coupon/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const found = systemCoupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (found) {
    res.json({ valid: true, coupon: found });
  } else {
    res.json({ valid: false, error: 'Invalid or expired coupon code' });
  }
});

// Stripe Checkout Session simulation
app.post('/api/billing/checkout', (req: Request, res: Response) => {
  const { plan, billingCycle, couponCode } = req.body as { plan: SubscriptionTier; billingCycle: 'monthly' | 'quarterly' | 'yearly'; couponCode?: string };
  
  if (!plan || !billingCycle) {
    return res.status(400).json({ error: 'Missing subscription details' });
  }

  // Plan pricing
  const basePrices: Record<SubscriptionTier, number> = {
    free: 0,
    plus: 9.99,
    gold: 19.99,
    platinum: 29.99
  };

  let multiplier = 1;
  if (billingCycle === 'quarterly') multiplier = 2.4; // 20% discount
  if (billingCycle === 'yearly') multiplier = 8.0; // ~33% discount

  let rawPrice = basePrices[plan] * multiplier;
  let finalPrice = Number(rawPrice.toFixed(2));
  let discountAmount = 0;

  if (couponCode) {
    const coupon = systemCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (coupon) {
      discountAmount = Number((finalPrice * (coupon.discountPercent / 100)).toFixed(2));
      finalPrice = Number((finalPrice - discountAmount).toFixed(2));
    }
  }

  // Create a pending session log to stream back
  const sessionId = `stripe_sess_${Date.now()}`;
  res.json({
    success: true,
    sessionId,
    plan,
    billingCycle,
    basePrice: rawPrice,
    discountAmount,
    price: finalPrice,
    couponApplied: couponCode || null,
    checkoutUrl: `/billing/checkout/${sessionId}`
  });
});

// Confirm Simulated Stripe payment
app.post('/api/billing/confirm', (req: Request, res: Response) => {
  const { plan, billingCycle, price, couponApplied } = req.body;

  // Upgrade current user tier
  currentUserProfile.subscriptionTier = plan;

  // Track subscription details
  const months = billingCycle === 'monthly' ? 1 : (billingCycle === 'quarterly' ? 3 : 12);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  const newSub: Subscription = {
    userId: 'current_user',
    plan,
    billingCycle,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString(),
    price: Number(price),
    transactionId: `stripe_txn_${Date.now().toString().slice(-6)}`
  };

  activeSubscriptions = activeSubscriptions.filter(s => s.userId !== 'current_user');
  activeSubscriptions.push(newSub);

  // Generate billing invoice
  const newInvoice: BillingInvoice = {
    id: `INV-${Date.now().toString().slice(-5)}`,
    plan,
    amount: Number(price),
    date: new Date().toLocaleDateString(),
    couponCode: couponApplied || undefined,
    status: 'paid'
  };

  if (!billingInvoices['current_user']) {
    billingInvoices['current_user'] = [];
  }
  billingInvoices['current_user'].push(newInvoice);

  res.json({
    success: true,
    subscription: newSub,
    invoice: newInvoice,
    profile: currentUserProfile
  });
});

// Subscription history
app.get('/api/billing/history', (req: Request, res: Response) => {
  const invoices = billingInvoices['current_user'] || [];
  const activeSub = activeSubscriptions.find(s => s.userId === 'current_user') || {
    userId: 'current_user',
    plan: currentUserProfile.subscriptionTier,
    billingCycle: 'monthly',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000 * 24 * 365).toISOString(),
    price: 0,
    transactionId: 'N/A'
  };

  res.json({
    invoices,
    activeSubscription: activeSub
  });
});

// Cancel subscription
app.post('/api/billing/cancel', (req: Request, res: Response) => {
  currentUserProfile.subscriptionTier = 'free';
  const sub = activeSubscriptions.find(s => s.userId === 'current_user');
  if (sub) {
    sub.status = 'cancelled';
  }
  res.json({ success: true, profile: currentUserProfile });
});


// ==========================================
// ADMIN DASHBOARD & SYSTEM MONITOR ENDPOINTS
// ==========================================

app.get('/api/admin/stats', (req: Request, res: Response) => {
  // Aggregate stats
  const totalUsers = seededProfiles.length + 1; // seed + user
  const totalMatches = userMatches.length;
  let totalChats = Object.keys(matchMessages).length;

  // Calculate gross revenue
  let revenue = 0;
  Object.values(billingInvoices).forEach(invList => {
    invList.forEach(inv => {
      if (inv.status === 'paid') revenue += inv.amount;
    });
  });

  // Default seed revenue to show aesthetic charts!
  revenue += 1845.50; // Seed revenue for visual aesthetics

  // Distribution
  const tierDistribution: Record<SubscriptionTier, number> = {
    free: 2,
    plus: 1,
    gold: 3,
    platinum: 2
  };

  // Adjust for active user
  tierDistribution[currentUserProfile.subscriptionTier] = (tierDistribution[currentUserProfile.subscriptionTier] || 0) + 1;

  const stats: SystemStats = {
    totalUsers,
    totalMatches,
    totalChats,
    revenue,
    tierDistribution,
    activeReports: userReports.filter(r => r.status === 'pending').length,
    flaggedFakeProfiles: seededProfiles.filter(p => p.isFake).length
  };

  res.json(stats);
});

// Get user list (Admin Management)
app.get('/api/admin/users', (req: Request, res: Response) => {
  const all = [currentUserProfile, ...seededProfiles];
  res.json(all);
});

// Toggle block on user (Admin Action)
app.post('/api/admin/users/:userId/toggle-block', (req: Request, res: Response) => {
  const { userId } = req.params;
  const index = blockedUserIds.indexOf(userId);

  if (index > -1) {
    blockedUserIds.splice(index, 1);
    res.json({ success: true, status: 'unblocked', blockedUserIds });
  } else {
    blockedUserIds.push(userId);
    res.json({ success: true, status: 'blocked', blockedUserIds });
  }
});

// Get admin reports queue
app.get('/api/admin/reports', (req: Request, res: Response) => {
  const reports = userReports.map(r => {
    const reporter = [currentUserProfile, ...seededProfiles].find(p => p.id === r.reporterId);
    const reported = [currentUserProfile, ...seededProfiles].find(p => p.id === r.reportedId);
    return {
      ...r,
      reporterName: reporter?.name || 'Unknown User',
      reportedName: reported?.name || 'Unknown User',
      reportedPhoto: reported?.photos[0] || ''
    };
  });
  res.json(reports);
});

// Take action on report
app.post('/api/admin/reports/:reportId/action', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const { action } = req.body as { action: 'resolve' | 'block' | 'dismiss' };

  const report = userReports.find(r => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  if (action === 'block') {
    if (!blockedUserIds.includes(report.reportedId)) {
      blockedUserIds.push(report.reportedId);
    }
    report.status = 'action_taken';
  } else if (action === 'resolve') {
    report.status = 'resolved';
  } else {
    report.status = 'resolved'; // dismiss
  }

  res.json({ success: true, report });
});


// ==========================================
// VITE AND ASSETS ROUTING CONFIGURATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
