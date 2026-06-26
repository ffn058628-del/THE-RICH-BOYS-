/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubscriptionTier = 'free' | 'plus' | 'gold' | 'platinum';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type Gender = 'male' | 'female' | 'nonbinary' | 'everyone';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'nonbinary';
  seeking: Gender;
  bio: string;
  photos: string[];
  verificationStatus: VerificationStatus;
  interests: string[];
  location: string;
  occupation: string;
  education: string;
  subscriptionTier: SubscriptionTier;
  isFake: boolean;
  onlineStatus: 'online' | 'offline' | 'away';
  lastActive: string;
  matchScore?: number; // AI compatibility score
  compatibilityNotes?: string; // AI compatibility reasoning
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  lastMessageAt: string;
  active: boolean;
}

export type MessageType = 'text' | 'image' | 'voice';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  type: MessageType;
  voiceDuration?: number; // In seconds
  imageUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface Subscription {
  userId: string;
  plan: SubscriptionTier;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  price: number;
  transactionId: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
  description: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'action_taken';
  createdAt: string;
}

export interface BlockLog {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalMatches: number;
  totalChats: number;
  revenue: number;
  tierDistribution: Record<SubscriptionTier, number>;
  activeReports: number;
  flaggedFakeProfiles: number;
}
