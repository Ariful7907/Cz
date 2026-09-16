export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface UserPrivacySettings {
  isPrivate: boolean;
  whoCanFollow: 'everyone' | 'friends';
  whoCanMessage: 'everyone' | 'friends';
  whoCanFriend: 'everyone' | 'friends';
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  coverPhoto: string;
  bio: string;
  location?: string;
  website?: string;
  occupation?: string;
  role: 'user' | 'admin';
  isBanned?: boolean;
  followers: string[]; // userIds
  following: string[]; // userIds
  friends: string[]; // userIds
  friendRequestsReceived: string[]; // userIds
  friendRequestsSent: string[]; // userIds
  blockedUsers: string[]; // userIds
  savedPostIds?: string[]; // userIds
  privacySettings: UserPrivacySettings;
  createdAt: string;
  isOnline?: boolean;
  lastSeen?: string;
  referralCode?: string;
  referredBy?: string;
  isEmailVerified?: boolean;
}

export interface PostReaction {
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export interface CommentReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[]; // userIds
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likes: string[]; // userIds
  replies: CommentReply[];
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaUrls?: string[];
  tags?: string[];
  feeling?: string;
  privacy: 'public' | 'friends' | 'only_me';
  groupId?: string;
  groupName?: string;
  reactions: PostReaction[];
  comments: PostComment[];
  sharesCount: number;
  savedBy: string[]; // userIds
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StoryReply {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  type: 'text' | 'image' | 'video';
  content?: string;
  mediaUrl?: string;
  backgroundGradient?: string;
  fontStyle?: string;
  fontSize?: 'normal' | 'large' | 'huge';
  filter?: string;
  sticker?: string;
  viewers: {
    userId: string;
    viewedAt: string;
  }[];
  reactions: {
    userId: string;
    type: ReactionType;
    createdAt: string;
  }[];
  replies?: StoryReply[];
  createdAt: string;
  expiresAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  timestamp: string;
  seen: boolean;
  seenAt?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
  reactions?: {
    userId: string;
    emoji: string;
  }[];
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  updatedAt: string;
  isMuted?: boolean;
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accept'
  | 'like'
  | 'reaction'
  | 'comment'
  | 'reply'
  | 'share'
  | 'follow'
  | 'message'
  | 'group_invite'
  | 'admin_alert'
  | 'referral_registered'
  | 'referral_verified'
  | 'referral_qualified'
  | 'reward_credited'
  | 'withdrawal_submitted'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'referral_flagged';

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  type: NotificationType;
  targetId?: string; // postId or groupId or userId
  extraText?: string;
  isRead: boolean;
  createdAt: string;
}

export type Notification = AppNotification;

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  coverImage: string;
  privacy: 'public' | 'private';
  creatorId: string;
  adminIds: string[];
  memberIds: string[];
  rules: string[];
  createdAt: string;
}

export interface ShortVideo {
  id: string;
  creatorId: string;
  caption: string;
  videoUrl: string;
  thumbnail?: string;
  audioTrack: string;
  likes: string[]; // userIds
  comments: {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
  }[];
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'comment';
  targetId: string;
  targetAuthorId?: string;
  targetSnippet?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export type ActiveTab =
  | 'feed'
  | 'clips'
  | 'groups'
  | 'friends'
  | 'saved'
  | 'settings'
  | 'admin'
  | 'profile'
  | 'referrals';

// ==========================================
// REFERRAL & REWARDS SYSTEM DATABASE MODELS
// ==========================================

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  createdAt: string;
  totalUses: number;
  isActive: boolean;
}

export type ReferralStatus =
  | 'clicked'
  | 'registered'
  | 'verified'
  | 'pending_qualification'
  | 'qualified'
  | 'rewarded'
  | 'rejected'
  | 'fraud_review';

export type ReferralRewardStatus = 'none' | 'pending' | 'credited' | 'reversed' | 'rejected';

export interface QualificationChecklist {
  accountVerified: boolean;
  emailVerified: boolean;
  profileCompleted: boolean;
  firstPostMade: boolean;
  activeDaysCompleted: boolean;
}

export interface Referral {
  id: string;
  referrerId: string; // User A
  referredUserId: string; // User B
  referralCode: string;
  status: ReferralStatus;
  registeredAt: string;
  qualificationDate?: string;
  rewardId?: string;
  rewardAmount?: number;
  rewardStatus: ReferralRewardStatus;
  ip?: string;
  deviceFingerprint?: string;
  qualificationChecklist: QualificationChecklist;
  fraudNotes?: string;
}

export interface ReferralCampaignConfig {
  id: string;
  name: string;
  rewardType: 'cash' | 'points';
  rewardAmount: number; // Configurable (e.g. 0.1)
  currency: string; // e.g. '$', 'USD', 'PTS'
  rewardStatus: 'active' | 'paused';
  minimumQualification: {
    requireEmailVerified: boolean;
    requireProfileComplete: boolean;
    requireFirstPost: boolean;
    requireMinActiveDays: number;
  };
  maxReferralsPerUser: number;
  campaignStartDate: string;
  campaignEndDate: string;
  minimumWithdrawal: number; // e.g. 10
  withdrawalMethods: string[];
}

export interface ReferralReward {
  id: string;
  referralId: string;
  referrerId: string;
  referredUserId: string;
  amount: number;
  rewardType: 'cash' | 'points';
  status: 'pending' | 'credited' | 'reversed' | 'rejected';
  createdAt: string;
  creditedAt?: string;
}

export interface RewardWallet {
  id: string;
  userId: string;
  availableBalance: number;
  pendingRewards: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
  updatedAt: string;
}

export type WalletTransactionType =
  | 'referral_reward'
  | 'bonus'
  | 'withdrawal'
  | 'adjustment'
  | 'refund_reversal';

export type WalletTransactionStatus = 'completed' | 'pending' | 'rejected' | 'reversed';

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  payoutDetails: string; // e.g. PayPal email, crypto address, bank routing
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  processedByAdminId?: string;
  adminNotes?: string;
}

export interface ReferralFraudFlag {
  id: string;
  referralId?: string;
  userId: string;
  targetUserId?: string;
  reason: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'flagged' | 'cleared' | 'confirmed_fraud';
  createdAt: string;
  resolvedAt?: string;
}
