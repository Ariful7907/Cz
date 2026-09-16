import {
  User,
  Post,
  Story,
  StoryReply,
  Message,
  Conversation,
  AppNotification,
  Group,
  ShortVideo,
  Report,
  ReactionType,
  PostReaction,
  PostComment,
  CommentReply,
  ReferralCode,
  Referral,
  ReferralStatus,
  ReferralCampaignConfig,
  ReferralReward,
  RewardWallet,
  WalletTransaction,
  WithdrawalRequest,
  ReferralFraudFlag,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'cz_users_v1',
  CURRENT_USER_ID: 'cz_current_user_id_v1',
  POSTS: 'cz_posts_v1',
  STORIES: 'cz_stories_v1',
  CONVERSATIONS: 'cz_conversations_v1',
  MESSAGES: 'cz_messages_v1',
  NOTIFICATIONS: 'cz_notifications_v1',
  GROUPS: 'cz_groups_v1',
  SHORT_VIDEOS: 'cz_videos_v1',
  REPORTS: 'cz_reports_v1',
  THEME_MODE: 'cz_theme_mode_v1',
  REFERRAL_CODES: 'cz_referral_codes_v1',
  REFERRALS: 'cz_referrals_v1',
  REFERRAL_CAMPAIGN: 'cz_referral_campaign_v1',
  REFERRAL_REWARDS: 'cz_referral_rewards_v1',
  REWARD_WALLETS: 'cz_reward_wallets_v1',
  WALLET_TRANSACTIONS: 'cz_wallet_transactions_v1',
  WITHDRAWAL_REQUESTS: 'cz_withdrawal_requests_v1',
  REFERRAL_FRAUD_FLAGS: 'cz_referral_fraud_flags_v1',
};

// Seed initial users
export const INITIAL_USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Vance',
    username: 'alexvance',
    email: 'alex@connectzone.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Product Designer & Visual Craftsman. Exploring the frontier of modern social networks and creative interfaces.',
    location: 'San Francisco, CA',
    website: 'https://alexvance.design',
    occupation: 'Staff Product Designer',
    role: 'user',
    followers: ['user_sarah', 'user_marcus', 'user_elena'],
    following: ['user_sarah', 'user_marcus'],
    friends: ['user_sarah', 'user_marcus'],
    friendRequestsReceived: ['user_elena'],
    friendRequestsSent: [],
    blockedUsers: [],
    privacySettings: {
      isPrivate: false,
      whoCanFollow: 'everyone',
      whoCanMessage: 'everyone',
      whoCanFriend: 'everyone',
    },
    createdAt: '2025-01-15T08:00:00.000Z',
    isOnline: true,
  },
  {
    id: 'user_sarah',
    name: 'Sarah Chen',
    username: 'sarahc',
    email: 'sarah@connectzone.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Photographer & wanderer 📸 Capturing natural light and quiet moments around the globe.',
    location: 'Kyoto / Vancouver',
    website: 'https://sarahchen.photos',
    occupation: 'Documentary Photographer',
    role: 'user',
    followers: ['user_alex', 'user_marcus', 'user_elena'],
    following: ['user_alex', 'user_elena'],
    friends: ['user_alex'],
    friendRequestsReceived: [],
    friendRequestsSent: [],
    blockedUsers: [],
    privacySettings: {
      isPrivate: false,
      whoCanFollow: 'everyone',
      whoCanMessage: 'everyone',
      whoCanFriend: 'everyone',
    },
    createdAt: '2025-01-20T10:30:00.000Z',
    isOnline: true,
  },
  {
    id: 'user_marcus',
    name: 'Marcus Brody',
    username: 'marcus_dev',
    email: 'marcus@connectzone.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    bio: 'Fullstack tinkerer, open source contributor, and mechanical keyboard collector ⌨️',
    location: 'Austin, TX',
    website: 'https://github.com/marcusdev',
    occupation: 'Systems Architect',
    role: 'user',
    followers: ['user_alex', 'user_sarah'],
    following: ['user_alex'],
    friends: ['user_alex'],
    friendRequestsReceived: [],
    friendRequestsSent: [],
    blockedUsers: [],
    privacySettings: {
      isPrivate: false,
      whoCanFollow: 'everyone',
      whoCanMessage: 'everyone',
      whoCanFriend: 'everyone',
    },
    createdAt: '2025-02-01T14:15:00.000Z',
    isOnline: false,
    lastSeen: '25m ago',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    username: 'elena_art',
    email: 'elena@connectzone.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    bio: '3D motion artist, surrealist painter & generative shader lover ✨',
    location: 'Berlin, Germany',
    website: 'https://elenarostova.art',
    occupation: '3D Generalist',
    role: 'user',
    followers: ['user_sarah'],
    following: ['user_sarah', 'user_alex'],
    friends: [],
    friendRequestsReceived: [],
    friendRequestsSent: ['user_alex'],
    blockedUsers: [],
    privacySettings: {
      isPrivate: false,
      whoCanFollow: 'everyone',
      whoCanMessage: 'everyone',
      whoCanFriend: 'everyone',
    },
    createdAt: '2025-02-10T16:45:00.000Z',
    isOnline: true,
  },
  {
    id: 'user_admin',
    name: 'Admin Moderator',
    username: 'admin',
    email: 'admin@connectzone.io',
    password: 'adminpassword',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    bio: 'ConnectZone Official Security & Trust Moderator. Keeping our social community respectful and authentic.',
    location: 'Global Headquarters',
    website: 'https://connectzone.io/trust',
    occupation: 'Platform Administrator',
    role: 'admin',
    followers: ['user_alex', 'user_sarah', 'user_marcus', 'user_elena'],
    following: [],
    friends: [],
    friendRequestsReceived: [],
    friendRequestsSent: [],
    blockedUsers: [],
    privacySettings: {
      isPrivate: false,
      whoCanFollow: 'everyone',
      whoCanMessage: 'everyone',
      whoCanFriend: 'everyone',
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    isOnline: true,
  },
];

// Seed initial posts
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_sarah',
    content:
      'Golden hour in the bamboo forests of Arashiyama. The way afternoon light filters through the canopy creates pure geometry. 🎋✨ How do you find calm during busy weeks?',
    mediaType: 'image',
    mediaUrls: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
    ],
    feeling: 'peaceful 🍃',
    privacy: 'public',
    reactions: [
      { userId: 'user_alex', type: 'love', createdAt: '2026-09-15T12:00:00.000Z' },
      { userId: 'user_marcus', type: 'wow', createdAt: '2026-09-15T12:10:00.000Z' },
      { userId: 'user_elena', type: 'like', createdAt: '2026-09-15T12:15:00.000Z' },
    ],
    comments: [
      {
        id: 'c_1',
        postId: 'post_1',
        authorId: 'user_alex',
        content: 'Breathtaking exposure Sarah! The green tones and contrast are so gentle.',
        createdAt: '2026-09-15T12:05:00.000Z',
        likes: ['user_sarah'],
        replies: [
          {
            id: 'r_1',
            authorId: 'user_sarah',
            content: 'Thank you Alex! Shot with the 35mm f/1.4 prime lens at f/2.8.',
            createdAt: '2026-09-15T12:12:00.000Z',
            likes: ['user_alex'],
          },
        ],
      },
    ],
    sharesCount: 14,
    savedBy: ['user_alex'],
    isPinned: true,
    createdAt: '2026-09-15T11:45:00.000Z',
  },
  {
    id: 'post_2',
    authorId: 'user_alex',
    content:
      'Just pushed our brand new interface overhaul for ConnectZone! Notice the optical balance in cards, the reaction bar micro-interactions, and instant messaging. Feedback is welcomed 🚀💡 #uidesign #webdev #connectzone',
    mediaType: 'image',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    ],
    feeling: 'excited 🎉',
    privacy: 'public',
    reactions: [
      { userId: 'user_sarah', type: 'love', createdAt: '2026-09-16T02:00:00.000Z' },
      { userId: 'user_marcus', type: 'like', createdAt: '2026-09-16T02:05:00.000Z' },
      { userId: 'user_elena', type: 'wow', createdAt: '2026-09-16T02:20:00.000Z' },
    ],
    comments: [
      {
        id: 'c_2',
        postId: 'post_2',
        authorId: 'user_marcus',
        content: 'The smooth reaction hover animation is so clean! Loving the responsiveness.',
        createdAt: '2026-09-16T02:15:00.000Z',
        likes: ['user_alex'],
        replies: [],
      },
    ],
    sharesCount: 8,
    savedBy: [],
    isPinned: false,
    createdAt: '2026-09-16T01:30:00.000Z',
  },
  {
    id: 'post_3',
    authorId: 'user_marcus',
    content:
      'PSA: When architecting high-velocity social feeds, prioritize local-first optimistic updates with reactive synchronization. It turns 300ms network lag into instant 0ms perceived feedback for your users. Code snippet coming to the Tech group later today! 💻⚡',
    privacy: 'public',
    reactions: [
      { userId: 'user_alex', type: 'like', createdAt: '2026-09-16T04:00:00.000Z' },
      { userId: 'user_sarah', type: 'haha', createdAt: '2026-09-16T04:10:00.000Z' },
    ],
    comments: [],
    sharesCount: 5,
    savedBy: ['user_alex'],
    isPinned: false,
    createdAt: '2026-09-16T03:45:00.000Z',
  },
  {
    id: 'post_4',
    authorId: 'user_elena',
    content:
      'Working on a new series of glass morphism and procedural particle simulations. Here is a preview render! What color palette speaks to you the most?',
    mediaType: 'image',
    mediaUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    ],
    feeling: 'inspired 🎨',
    privacy: 'public',
    groupId: 'group_design',
    groupName: 'Creative UI/UX Designers',
    reactions: [
      { userId: 'user_alex', type: 'love', createdAt: '2026-09-16T06:00:00.000Z' },
      { userId: 'user_sarah', type: 'wow', createdAt: '2026-09-16T06:10:00.000Z' },
    ],
    comments: [
      {
        id: 'c_3',
        postId: 'post_4',
        authorId: 'user_alex',
        content: 'The refracted depth is stunning Elena! Would love this as a wallpaper.',
        createdAt: '2026-09-16T06:20:00.000Z',
        likes: ['user_elena'],
        replies: [],
      },
    ],
    sharesCount: 12,
    savedBy: [],
    isPinned: false,
    createdAt: '2026-09-16T05:30:00.000Z',
  },
];

// Seed initial stories (24h)
export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_sarah_1',
    userId: 'user_sarah',
    type: 'image',
    content: 'Morning coffee in Kyoto ☕ Peaceful vibes before the workshop begins.',
    mediaUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    filter: 'warm',
    sticker: '☕',
    viewers: [
      { userId: 'user_alex', viewedAt: new Date(Date.now() - 3600000).toISOString() },
      { userId: 'user_marcus', viewedAt: new Date(Date.now() - 5400000).toISOString() },
    ],
    reactions: [
      { userId: 'user_alex', type: 'love', createdAt: new Date(Date.now() - 3500000).toISOString() },
      { userId: 'user_marcus', type: 'wow', createdAt: new Date(Date.now() - 5300000).toISOString() },
    ],
    replies: [
      {
        id: 'srep_1',
        userId: 'user_alex',
        text: 'Save a matcha latte for me! Looks incredible 😍',
        createdAt: new Date(Date.now() - 3400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600000).toISOString(),
  },
  {
    id: 'story_marcus_1',
    userId: 'user_marcus',
    type: 'text',
    content: '🚀 Shipping day! Never deploy on Friday... unless you have 100% test coverage and optimistic UI 😉✨',
    backgroundGradient: 'from-amber-500 via-orange-600 to-red-600',
    fontStyle: 'font-sans',
    fontSize: 'large',
    sticker: '🚀',
    viewers: [
      { userId: 'user_alex', viewedAt: new Date(Date.now() - 2500000).toISOString() },
      { userId: 'user_elena', viewedAt: new Date(Date.now() - 2200000).toISOString() },
    ],
    reactions: [
      { userId: 'user_alex', type: 'haha', createdAt: new Date(Date.now() - 2400000).toISOString() },
      { userId: 'user_elena', type: 'love', createdAt: new Date(Date.now() - 2100000).toISOString() },
    ],
    replies: [
      {
        id: 'srep_2',
        userId: 'user_elena',
        text: 'Preach! Continuous delivery is bliss 🔥',
        createdAt: new Date(Date.now() - 2000000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 3600000).toISOString(),
  },
  {
    id: 'story_elena_1',
    userId: 'user_elena',
    type: 'video',
    content: 'Motion shader breakdown in real-time ✨ Sound on!',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    viewers: [
      { userId: 'user_sarah', viewedAt: new Date(Date.now() - 1200000).toISOString() },
      { userId: 'user_marcus', viewedAt: new Date(Date.now() - 900000).toISOString() },
    ],
    reactions: [
      { userId: 'user_sarah', type: 'wow', createdAt: new Date(Date.now() - 1100000).toISOString() },
    ],
    replies: [
      {
        id: 'srep_3',
        userId: 'user_sarah',
        text: 'The frame rate and light refraction are mesmerising!',
        createdAt: new Date(Date.now() - 1000000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 3600000).toISOString(),
  },
  {
    id: 'story_alex_1',
    userId: 'user_alex',
    type: 'image',
    content: 'Late night desk setup with ambient backlighting 🌙 Code mode activated.',
    mediaUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    filter: 'indigo',
    sticker: '💻',
    viewers: [
      { userId: 'user_sarah', viewedAt: new Date(Date.now() - 1800000).toISOString() },
      { userId: 'user_marcus', viewedAt: new Date(Date.now() - 1500000).toISOString() },
      { userId: 'user_elena', viewedAt: new Date(Date.now() - 1100000).toISOString() },
    ],
    reactions: [
      { userId: 'user_sarah', type: 'love', createdAt: new Date(Date.now() - 1700000).toISOString() },
      { userId: 'user_elena', type: 'wow', createdAt: new Date(Date.now() - 1000000).toISOString() },
    ],
    replies: [
      {
        id: 'srep_4',
        userId: 'user_sarah',
        text: 'What keyboard switches are you using there?',
        createdAt: new Date(Date.now() - 1600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 4000000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 3600000).toISOString(),
  },
];

// Seed initial short videos (Clips)
export const INITIAL_SHORT_VIDEOS: ShortVideo[] = [
  {
    id: 'clip_1',
    creatorId: 'user_sarah',
    caption: 'Rainy street reflections in Gion district. Listen to that gentle rhythm 🌧️ #travel #japan #relax',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    audioTrack: 'Original Ambient Audio - Sarah Chen',
    likes: ['user_alex', 'user_marcus'],
    comments: [
      {
        id: 'vc_1',
        authorId: 'user_alex',
        content: 'This feels like living inside an anime scene!',
        createdAt: '2026-09-16T07:00:00.000Z',
      },
    ],
    sharesCount: 38,
    viewsCount: 1420,
    createdAt: '2026-09-16T06:00:00.000Z',
  },
  {
    id: 'clip_2',
    creatorId: 'user_marcus',
    caption: 'My minimalist productivity setup for 2026. Cable management took 3 hours but worth it! ⚡ #desksetup #workspace',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    audioTrack: 'Chill Lofi Beats - Marcus Brody',
    likes: ['user_alex'],
    comments: [],
    sharesCount: 22,
    viewsCount: 980,
    createdAt: '2026-09-16T05:30:00.000Z',
  },
  {
    id: 'clip_3',
    creatorId: 'user_elena',
    caption: 'Creating fluid marble textures in real-time Blender 4.3 🌀 Which shader node is your favorite?',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    audioTrack: 'Synthetic Dreams - Elena Art',
    likes: ['user_alex', 'user_sarah'],
    comments: [],
    sharesCount: 19,
    viewsCount: 2310,
    createdAt: '2026-09-16T04:45:00.000Z',
  },
];

// Seed initial groups
export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group_tech',
    name: 'Tech & AI Innovators',
    description: 'A collaborative haven for software engineers, product thinkers, and builders experimenting with modern tech stacks.',
    category: 'Technology',
    avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    privacy: 'public',
    creatorId: 'user_marcus',
    adminIds: ['user_marcus', 'user_alex'],
    memberIds: ['user_marcus', 'user_alex', 'user_sarah'],
    rules: [
      'Be respectful and constructive in code discussions',
      'No unsolicited crypto or spam promotions',
      'Share code samples and open-source references where possible',
    ],
    createdAt: '2025-01-20T00:00:00.000Z',
  },
  {
    id: 'group_photo',
    name: 'Global Travel & Photography',
    description: 'Share your finest shots, camera gear recommendations, and travel stories from every corner of the planet.',
    category: 'Photography',
    avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
    privacy: 'public',
    creatorId: 'user_sarah',
    adminIds: ['user_sarah'],
    memberIds: ['user_sarah', 'user_alex', 'user_elena'],
    rules: [
      'Credit your camera body and lens settings when sharing shots',
      'Constructive feedback only on critique requests',
    ],
    createdAt: '2025-01-25T00:00:00.000Z',
  },
  {
    id: 'group_design',
    name: 'Creative UI/UX Designers',
    description: 'Typography lovers, design system tinkerers, and UX researchers dissecting micro-interactions and interface patterns.',
    category: 'Design',
    avatar: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    privacy: 'public',
    creatorId: 'user_alex',
    adminIds: ['user_alex'],
    memberIds: ['user_alex', 'user_elena', 'user_sarah'],
    rules: [
      'High-fidelity design showcases and constructive design reviews',
      'Share source files or Figma community links when available',
    ],
    createdAt: '2025-02-01T00:00:00.000Z',
  },
];

// Seed initial conversations & messages
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_alex_sarah',
    participantIds: ['user_alex', 'user_sarah'],
    updatedAt: '2026-09-16T08:15:00.000Z',
    lastMessage: {
      id: 'm_2',
      conversationId: 'conv_alex_sarah',
      senderId: 'user_sarah',
      receiverId: 'user_alex',
      text: 'Thanks for checking out the photo gallery! Are you free for a quick design sync later?',
      timestamp: '2026-09-16T08:15:00.000Z',
      seen: false,
    },
  },
  {
    id: 'conv_alex_marcus',
    participantIds: ['user_alex', 'user_marcus'],
    updatedAt: '2026-09-15T22:30:00.000Z',
    lastMessage: {
      id: 'm_102',
      conversationId: 'conv_alex_marcus',
      senderId: 'user_marcus',
      receiverId: 'user_alex',
      text: 'The new websocket mock layer works seamlessly. Everything syncs instantly in storage!',
      timestamp: '2026-09-15T22:30:00.000Z',
      seen: true,
    },
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm_1',
    conversationId: 'conv_alex_sarah',
    senderId: 'user_alex',
    receiverId: 'user_sarah',
    text: 'Hey Sarah! Loved your new story from Kyoto. Was that taken near Kiyomizu-dera?',
    timestamp: '2026-09-16T08:10:00.000Z',
    seen: true,
  },
  {
    id: 'm_2',
    conversationId: 'conv_alex_sarah',
    senderId: 'user_sarah',
    receiverId: 'user_alex',
    text: 'Thanks for checking out the photo gallery! Are you free for a quick design sync later?',
    timestamp: '2026-09-16T08:15:00.000Z',
    seen: false,
  },
  {
    id: 'm_101',
    conversationId: 'conv_alex_marcus',
    senderId: 'user_alex',
    receiverId: 'user_marcus',
    text: 'Marcus, did you check the updated database indexing schema?',
    timestamp: '2026-09-15T22:20:00.000Z',
    seen: true,
  },
  {
    id: 'm_102',
    conversationId: 'conv_alex_marcus',
    senderId: 'user_marcus',
    receiverId: 'user_alex',
    text: 'The new websocket mock layer works seamlessly. Everything syncs instantly in storage!',
    timestamp: '2026-09-15T22:30:00.000Z',
    seen: true,
  },
];

// Seed initial notifications
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    recipientId: 'user_alex',
    senderId: 'user_elena',
    type: 'friend_request',
    isRead: false,
    createdAt: '2026-09-16T08:00:00.000Z',
    extraText: 'sent you a friend request.',
  },
  {
    id: 'notif_2',
    recipientId: 'user_alex',
    senderId: 'user_sarah',
    type: 'reaction',
    targetId: 'post_2',
    isRead: false,
    createdAt: '2026-09-16T07:45:00.000Z',
    extraText: 'loved your post: "Just pushed our brand new interface..."',
  },
  {
    id: 'notif_3',
    recipientId: 'user_alex',
    senderId: 'user_marcus',
    type: 'comment',
    targetId: 'post_2',
    isRead: true,
    createdAt: '2026-09-16T07:30:00.000Z',
    extraText: 'commented on your post: "The smooth reaction hover animation..."',
  },
];

// Seed initial reports for admin
export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_1',
    reporterId: 'user_sarah',
    targetType: 'post',
    targetId: 'post_3',
    targetAuthorId: 'user_marcus',
    targetSnippet: 'Marcus Brody: PSA: When architecting high-velocity social feeds...',
    reason: 'False claim / verification needed',
    details: 'Flagged for moderation check to ensure accuracy of architectural advice.',
    status: 'pending',
    createdAt: '2026-09-16T08:00:00.000Z',
  },
];

// Reactive event emitter for local multi-component reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notifySubscribers = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    notifySubscribers();
  });
}

// In-memory typing indicator reactive bus
const conversationTypingUsers: Record<string, Record<string, number>> = {};
type TypingSubscriber = (conversationId: string, typingUserIds: string[]) => void;
const typingSubscribers: Set<TypingSubscriber> = new Set();

export const subscribeToTyping = (subscriber: TypingSubscriber) => {
  typingSubscribers.add(subscriber);
  return () => typingSubscribers.delete(subscriber);
};

const notifyTypingSubscribers = (conversationId: string) => {
  const activeMap = conversationTypingUsers[conversationId] || {};
  const now = Date.now();
  const activeIds = Object.entries(activeMap)
    .filter(([_, ts]) => now - ts < 4000)
    .map(([uid]) => uid);

  typingSubscribers.forEach((fn) => {
    try {
      fn(conversationId, activeIds);
    } catch (e) {
      console.error(e);
    }
  });
};

// Storage Engine
class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_alex');
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(INITIAL_STORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHORT_VIDEOS)) {
      localStorage.setItem(STORAGE_KEYS.SHORT_VIDEOS, JSON.stringify(INITIAL_SHORT_VIDEOS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    }
  }

  public resetAllData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_alex');
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(INITIAL_STORIES));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    localStorage.setItem(STORAGE_KEYS.SHORT_VIDEOS, JSON.stringify(INITIAL_SHORT_VIDEOS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    notifySubscribers();
  }

  // --- Users & Authentication ---
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifySubscribers();
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getCurrentUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_alex';
  }

  public setCurrentUserId(id: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    notifySubscribers();
  }

  public getCurrentUser(): User {
    const id = this.getCurrentUserId();
    const user = this.getUserById(id);
    if (user) return user;
    return this.getUsers()[0] || INITIAL_USERS[0];
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    this.evaluateReferralQualification(id);
    return users[index];
  }

  public createUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  public deleteUser(id: string) {
    let users = this.getUsers();
    users = users.filter((u) => u.id !== id);
    this.saveUsers(users);
    if (this.getCurrentUserId() === id) {
      this.setCurrentUserId('user_alex');
    }
  }

  public toggleBanUser(id: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      user.isBanned = !user.isBanned;
      this.saveUsers(users);
    }
  }

  // --- Posts ---
  public getPosts(): Post[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTS);
      return data ? JSON.parse(data) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  }

  public getPostById(id: string): Post | undefined {
    return this.getPosts().find((p) => p.id === id);
  }

  public savePosts(posts: Post[]) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    notifySubscribers();
  }

  public createPost(postData: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'sharesCount' | 'savedBy'>): Post {
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      reactions: [],
      comments: [],
      sharesCount: 0,
      savedBy: [],
      createdAt: new Date().toISOString(),
    };
    const posts = [newPost, ...this.getPosts()];
    this.savePosts(posts);
    this.evaluateReferralQualification(newPost.authorId);
    return newPost;
  }

  public updatePost(id: string, updates: Partial<Post>): Post {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Post not found');
    posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
    this.savePosts(posts);
    return posts[index];
  }

  public deletePost(id: string) {
    const posts = this.getPosts().filter((p) => p.id !== id);
    this.savePosts(posts);
  }

  public toggleReaction(postId: string, userId: string, reactionType: ReactionType) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const existingReactionIndex = post.reactions.findIndex((r) => r.userId === userId);

    if (existingReactionIndex > -1) {
      if (post.reactions[existingReactionIndex].type === reactionType) {
        // Remove reaction
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change reaction type
        post.reactions[existingReactionIndex].type = reactionType;
      }
    } else {
      // Add reaction
      post.reactions.push({
        userId,
        type: reactionType,
        createdAt: new Date().toISOString(),
      });

      // Trigger notification if reacting to someone else's post
      if (post.authorId !== userId) {
        this.createNotification({
          recipientId: post.authorId,
          senderId: userId,
          type: 'reaction',
          targetId: post.id,
          extraText: `reacted to your post.`,
        });
      }
    }

    this.savePosts(posts);
  }

  public addComment(postId: string, authorId: string, content: string, mediaUrl?: string): PostComment | null {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return null;

    const newComment: PostComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      postId,
      authorId,
      content,
      mediaUrl,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    };

    post.comments.push(newComment);
    this.savePosts(posts);

    if (post.authorId !== authorId) {
      this.createNotification({
        recipientId: post.authorId,
        senderId: authorId,
        type: 'comment',
        targetId: postId,
        extraText: `commented: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
      });
    }

    return newComment;
  }

  public addReply(postId: string, commentId: string, authorId: string, content: string): CommentReply | null {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return null;

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) return null;

    const newReply: CommentReply = {
      id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      authorId,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };

    comment.replies.push(newReply);
    this.savePosts(posts);

    if (comment.authorId !== authorId) {
      this.createNotification({
        recipientId: comment.authorId,
        senderId: authorId,
        type: 'reply',
        targetId: postId,
        extraText: `replied to your comment: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
      });
    }

    return newReply;
  }

  public toggleCommentLike(postId: string, commentId: string, userId: string) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) return;

    const idx = comment.likes.indexOf(userId);
    if (idx > -1) {
      comment.likes.splice(idx, 1);
    } else {
      comment.likes.push(userId);
    }
    this.savePosts(posts);
  }

  public deleteComment(postId: string, commentId: string) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    post.comments = post.comments.filter((c) => c.id !== commentId);
    this.savePosts(posts);
  }

  public toggleSavePost(postId: string, userId: string) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const idx = post.savedBy.indexOf(userId);
    if (idx > -1) {
      post.savedBy.splice(idx, 1);
    } else {
      post.savedBy.push(userId);
    }
    this.savePosts(posts);
  }

  public incrementShare(postId: string) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    post.sharesCount = (post.sharesCount || 0) + 1;
    this.savePosts(posts);
  }

  // --- Stories ---
  public getStories(): Story[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORIES);
      const stories: Story[] = data ? JSON.parse(data) : INITIAL_STORIES;
      // Filter out stories expired older than 24h
      const now = new Date().getTime();
      return stories.filter((s) => new Date(s.expiresAt).getTime() > now);
    } catch {
      return INITIAL_STORIES;
    }
  }

  public saveStories(stories: Story[]) {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    notifySubscribers();
  }

  public createStory(
    storyData: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'viewers' | 'reactions' | 'replies'>
  ): Story {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const newStory: Story = {
      ...storyData,
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      viewers: [],
      reactions: [],
      replies: [],
      createdAt: now.toISOString(),
      expiresAt,
    };
    const stories = [newStory, ...this.getStories()];
    this.saveStories(stories);
    return newStory;
  }

  public viewStory(storyId: string, userId: string) {
    const stories = this.getStories();
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    if (!story.viewers.some((v) => v.userId === userId)) {
      story.viewers.push({ userId, viewedAt: new Date().toISOString() });
      this.saveStories(stories);
    }
  }

  public reactStory(storyId: string, userId: string, type: ReactionType) {
    const stories = this.getStories();
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    const existing = story.reactions.find((r) => r.userId === userId);
    if (existing) {
      existing.type = type;
    } else {
      story.reactions.push({ userId, type, createdAt: new Date().toISOString() });
    }
    this.saveStories(stories);

    if (story.userId !== userId) {
      this.createNotification({
        recipientId: story.userId,
        senderId: userId,
        type: 'reaction',
        extraText: `reacted to your story.`,
      });
    }
  }

  public replyStory(storyId: string, userId: string, text: string): StoryReply | null {
    const stories = this.getStories();
    const story = stories.find((s) => s.id === storyId);
    if (!story) return null;

    if (!story.replies) {
      story.replies = [];
    }

    const newReply: StoryReply = {
      id: `srep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    story.replies.push(newReply);
    this.saveStories(stories);

    // Also send as direct message in conversation
    if (story.userId !== userId) {
      const convo = this.getOrCreateConversation(userId, story.userId);
      const snippet =
        story.type === 'text'
          ? `"${story.content?.slice(0, 30) || 'Story'}"`
          : `[${story.type.toUpperCase()} STORY]`;

      this.sendMessage(
        convo.id,
        userId,
        story.userId,
        `Replied to story ${snippet}: ${text.trim()}`
      );

      this.createNotification({
        recipientId: story.userId,
        senderId: userId,
        type: 'reply',
        extraText: `replied to your story: "${text.trim().slice(0, 35)}${
          text.trim().length > 35 ? '...' : ''
        }"`,
      });
    }

    return newReply;
  }

  public deleteStory(storyId: string) {
    const stories = this.getStories().filter((s) => s.id !== storyId);
    this.saveStories(stories);
  }

  // --- Friends & Following ---
  public sendFriendRequest(senderId: string, receiverId: string) {
    const users = this.getUsers();
    const sender = users.find((u) => u.id === senderId);
    const receiver = users.find((u) => u.id === receiverId);
    if (!sender || !receiver) return;

    if (!sender.friendRequestsSent.includes(receiverId)) {
      sender.friendRequestsSent.push(receiverId);
    }
    if (!receiver.friendRequestsReceived.includes(senderId)) {
      receiver.friendRequestsReceived.push(senderId);
    }

    this.saveUsers(users);

    this.createNotification({
      recipientId: receiverId,
      senderId,
      type: 'friend_request',
      extraText: 'sent you a friend request.',
    });
  }

  public acceptFriendRequest(userId: string, senderId: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    const sender = users.find((u) => u.id === senderId);
    if (!user || !sender) return;

    user.friendRequestsReceived = user.friendRequestsReceived.filter((id) => id !== senderId);
    sender.friendRequestsSent = sender.friendRequestsSent.filter((id) => id !== userId);

    if (!user.friends.includes(senderId)) user.friends.push(senderId);
    if (!sender.friends.includes(userId)) sender.friends.push(userId);
    if (!user.following.includes(senderId)) user.following.push(senderId);
    if (!sender.following.includes(userId)) sender.following.push(userId);
    if (!user.followers.includes(senderId)) user.followers.push(senderId);
    if (!sender.followers.includes(userId)) sender.followers.push(userId);

    this.saveUsers(users);

    this.createNotification({
      recipientId: senderId,
      senderId: userId,
      type: 'friend_accept',
      extraText: 'accepted your friend request. You are now friends!',
    });
  }

  public rejectFriendRequest(userId: string, senderId: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    const sender = users.find((u) => u.id === senderId);
    if (user) {
      user.friendRequestsReceived = user.friendRequestsReceived.filter((id) => id !== senderId);
    }
    if (sender) {
      sender.friendRequestsSent = sender.friendRequestsSent.filter((id) => id !== userId);
    }
    this.saveUsers(users);
  }

  public removeFriend(userId: string, friendId: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    const friend = users.find((u) => u.id === friendId);
    if (user) {
      user.friends = user.friends.filter((id) => id !== friendId);
    }
    if (friend) {
      friend.friends = friend.friends.filter((id) => id !== userId);
    }
    this.saveUsers(users);
  }

  public toggleFollow(userId: string, targetId: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    const target = users.find((u) => u.id === targetId);
    if (!user || !target) return;

    const isFollowing = user.following.includes(targetId);
    if (isFollowing) {
      user.following = user.following.filter((id) => id !== targetId);
      target.followers = target.followers.filter((id) => id !== userId);
    } else {
      user.following.push(targetId);
      target.followers.push(userId);

      this.createNotification({
        recipientId: targetId,
        senderId: userId,
        type: 'follow',
        extraText: 'started following your updates.',
      });
    }
    this.saveUsers(users);
  }

  // --- Messaging & Conversations ---
  public getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  }

  public saveConversations(conversations: Conversation[]) {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    notifySubscribers();
  }

  public getMessages(conversationId?: string): Message[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const all: Message[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
      if (conversationId) {
        return all.filter((m) => m.conversationId === conversationId);
      }
      return all;
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  public saveMessages(messages: Message[]) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    notifySubscribers();
  }

  public getOrCreateConversation(userA: string, userB: string): Conversation {
    const convos = this.getConversations();
    const existing = convos.find(
      (c) => c.participantIds.includes(userA) && c.participantIds.includes(userB)
    );
    if (existing) return existing;

    const newConvo: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      participantIds: [userA, userB],
      updatedAt: new Date().toISOString(),
    };
    convos.unshift(newConvo);
    this.saveConversations(convos);
    return newConvo;
  }

  public setTyping(conversationId: string, userId: string, isTyping: boolean) {
    if (!conversationTypingUsers[conversationId]) {
      conversationTypingUsers[conversationId] = {};
    }
    if (isTyping) {
      conversationTypingUsers[conversationId][userId] = Date.now();
    } else {
      delete conversationTypingUsers[conversationId][userId];
    }
    notifyTypingSubscribers(conversationId);
  }

  public getTypingUsers(conversationId: string): string[] {
    const activeMap = conversationTypingUsers[conversationId] || {};
    const now = Date.now();
    return Object.entries(activeMap)
      .filter(([_, ts]) => now - ts < 4000)
      .map(([uid]) => uid);
  }

  public setUserOnlineStatus(userId: string, isOnline: boolean) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = isOnline ? 'Just now' : new Date().toISOString();
      this.saveUsers(users);
    }
  }

  public sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    mediaUrl?: string,
    triggerAutoReply: boolean = true
  ): Message {
    const messages = this.getMessages();
    const newMessage: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      conversationId,
      senderId,
      receiverId,
      text,
      mediaUrl,
      timestamp: new Date().toISOString(),
      seen: false,
      status: 'delivered',
      reactions: [],
    };
    messages.push(newMessage);
    this.saveMessages(messages);

    // Update conversation last message
    const convos = this.getConversations();
    const convo = convos.find((c) => c.id === conversationId);
    if (convo) {
      convo.lastMessage = newMessage;
      convo.updatedAt = newMessage.timestamp;
      this.saveConversations(convos);
    }

    this.createNotification({
      recipientId: receiverId,
      senderId,
      type: 'message',
      targetId: conversationId,
      extraText: `sent you a message: "${(text || 'Sent an image').slice(0, 30)}${
        (text || '').length > 30 ? '...' : ''
      }"`,
    });

    // Simulated authentic live response for one-to-one real-time chat feeling
    if (triggerAutoReply && typeof window !== 'undefined') {
      setTimeout(() => {
        // Step 1: Receiver marks message as seen
        this.markMessagesSeen(conversationId, receiverId);

        // Step 2: Receiver starts typing
        setTimeout(() => {
          this.setTyping(conversationId, receiverId, true);

          // Step 3: Receiver sends realistic reply
          setTimeout(() => {
            this.setTyping(conversationId, receiverId, false);

            let replyText = 'Thanks for the message! Always great to stay in touch.';
            const lower = (text || '').toLowerCase().trim();

            if (mediaUrl) {
              const photoReplies = [
                'Awesome photo! Thanks for sharing this 📸',
                'Whoa that looks stunning! ✨',
                'Love this shot! Great composition.',
              ];
              replyText = photoReplies[Math.floor(Math.random() * photoReplies.length)];
            } else if (lower.includes('?') || lower.startsWith('how') || lower.startsWith('what')) {
              const questionReplies = [
                'Great question! Everything is going smoothly on my end. How about you?',
                'I was just thinking about that earlier today! Let’s definitely discuss more.',
                'Doing really well, thanks for asking! Hope you are having a productive day.',
              ];
              replyText = questionReplies[Math.floor(Math.random() * questionReplies.length)];
            } else if (lower.includes('hi') || lower.includes('hey') || lower.includes('hello')) {
              const greetings = [
                'Hey! Great to hear from you. Hope you are having a wonderful day! 😊',
                'Hello there! What have you been working on lately?',
                'Hey! Thanks for reaching out. How is everything going?',
              ];
              replyText = greetings[Math.floor(Math.random() * greetings.length)];
            } else if (/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(lower)) {
              replyText = 'Haha love that! 😄🙌✨';
            } else {
              const genericReplies = [
                'Totally agree with you on that! 🙌',
                'Sounds awesome! Let me know if there is anything I can help with.',
                'Thanks for the update, really appreciate you letting me know! 👍',
                'That is so cool! Let’s keep each other posted.',
              ];
              replyText = genericReplies[Math.floor(Math.random() * genericReplies.length)];
            }

            this.sendMessage(conversationId, receiverId, senderId, replyText, undefined, false);
          }, 1800);
        }, 800);
      }, 700);
    }

    return newMessage;
  }

  public markMessagesSeen(conversationId: string, currentUserId: string) {
    const messages = this.getMessages();
    let updated = false;
    const now = new Date().toISOString();

    messages.forEach((m) => {
      if (m.conversationId === conversationId && m.receiverId === currentUserId && !m.seen) {
        m.seen = true;
        m.seenAt = now;
        m.status = 'seen';
        updated = true;
      }
    });

    if (updated) {
      this.saveMessages(messages);

      // Update conversation's last message seen flag if applicable
      const convos = this.getConversations();
      const convo = convos.find((c) => c.id === conversationId);
      if (convo?.lastMessage && convo.lastMessage.receiverId === currentUserId) {
        convo.lastMessage.seen = true;
        convo.lastMessage.seenAt = now;
        convo.lastMessage.status = 'seen';
        this.saveConversations(convos);
      }
    }
  }

  public toggleMessageReaction(messageId: string, userId: string, emoji: string) {
    const messages = this.getMessages();
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) {
      msg.reactions = [];
    }

    const existingIndex = msg.reactions.findIndex((r) => r.userId === userId);
    if (existingIndex > -1) {
      if (msg.reactions[existingIndex].emoji === emoji) {
        // Remove reaction
        msg.reactions.splice(existingIndex, 1);
      } else {
        // Change emoji
        msg.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // Add reaction
      msg.reactions.push({ userId, emoji });
    }

    this.saveMessages(messages);
  }

  public deleteMessage(messageId: string) {
    const messages = this.getMessages();
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const filtered = messages.filter((m) => m.id !== messageId);
    this.saveMessages(filtered);

    // Update conversation last message if needed
    const convos = this.getConversations();
    const convo = convos.find((c) => c.id === msg.conversationId);
    if (convo && convo.lastMessage?.id === messageId) {
      const convoRemainingMsgs = filtered.filter((m) => m.conversationId === convo.id);
      convo.lastMessage = convoRemainingMsgs[convoRemainingMsgs.length - 1];
      this.saveConversations(convos);
    }
  }

  public clearConversation(conversationId: string) {
    const messages = this.getMessages().filter((m) => m.conversationId !== conversationId);
    this.saveMessages(messages);

    const convos = this.getConversations();
    const convo = convos.find((c) => c.id === conversationId);
    if (convo) {
      convo.lastMessage = undefined;
      convo.updatedAt = new Date().toISOString();
      this.saveConversations(convos);
    }
  }

  // --- Notifications ---
  public getNotifications(userId?: string): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const all: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
      if (userId) {
        return all.filter((n) => n.recipientId === userId);
      }
      return all;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public saveNotifications(notifications: AppNotification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    notifySubscribers();
  }

  public createNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): AppNotification {
    const newNotif: AppNotification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const notifs = [newNotif, ...this.getNotifications()];
    this.saveNotifications(notifs);
    return newNotif;
  }

  public markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const notif = notifs.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveNotifications(notifs);
    }
  }

  public markAllNotificationsRead(userId: string) {
    const notifs = this.getNotifications();
    notifs.forEach((n) => {
      if (n.recipientId === userId) {
        n.isRead = true;
      }
    });
    this.saveNotifications(notifs);
  }

  // --- Groups ---
  public getGroups(): Group[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return data ? JSON.parse(data) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  }

  public saveGroups(groups: Group[]) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    notifySubscribers();
  }

  public createGroup(data: Omit<Group, 'id' | 'createdAt' | 'memberIds' | 'adminIds' | 'creatorId'>, creatorId: string): Group {
    const newGroup: Group = {
      ...data,
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      creatorId,
      adminIds: [creatorId],
      memberIds: [creatorId],
      createdAt: new Date().toISOString(),
    };
    const groups = [newGroup, ...this.getGroups()];
    this.saveGroups(groups);
    return newGroup;
  }

  public toggleJoinGroup(groupId: string, userId: string) {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const idx = group.memberIds.indexOf(userId);
    if (idx > -1) {
      group.memberIds.splice(idx, 1);
    } else {
      group.memberIds.push(userId);
    }
    this.saveGroups(groups);
  }

  // --- Short Videos (Clips) ---
  public getShortVideos(): ShortVideo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHORT_VIDEOS);
      return data ? JSON.parse(data) : INITIAL_SHORT_VIDEOS;
    } catch {
      return INITIAL_SHORT_VIDEOS;
    }
  }

  public saveShortVideos(videos: ShortVideo[]) {
    localStorage.setItem(STORAGE_KEYS.SHORT_VIDEOS, JSON.stringify(videos));
    notifySubscribers();
  }

  public createShortVideo(data: Omit<ShortVideo, 'id' | 'createdAt' | 'likes' | 'comments' | 'sharesCount' | 'viewsCount'>): ShortVideo {
    const newVid: ShortVideo = {
      ...data,
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      likes: [],
      comments: [],
      sharesCount: 0,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };
    const videos = [newVid, ...this.getShortVideos()];
    this.saveShortVideos(videos);
    return newVid;
  }

  public toggleLikeShortVideo(videoId: string, userId: string) {
    const videos = this.getShortVideos();
    const vid = videos.find((v) => v.id === videoId);
    if (!vid) return;

    const idx = vid.likes.indexOf(userId);
    if (idx > -1) {
      vid.likes.splice(idx, 1);
    } else {
      vid.likes.push(userId);
    }
    this.saveShortVideos(videos);
  }

  public addCommentShortVideo(videoId: string, authorId: string, content: string) {
    const videos = this.getShortVideos();
    const vid = videos.find((v) => v.id === videoId);
    if (!vid) return;

    vid.comments.push({
      id: `vc_${Date.now()}`,
      authorId,
      content,
      createdAt: new Date().toISOString(),
    });
    this.saveShortVideos(videos);
  }

  public incrementVideoView(videoId: string) {
    const videos = this.getShortVideos();
    const vid = videos.find((v) => v.id === videoId);
    if (!vid) return;
    vid.viewsCount = (vid.viewsCount || 0) + 1;
    this.saveShortVideos(videos);
  }

  // --- Reports (Admin & Moderation) ---
  public getReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  }

  public saveReports(reports: Report[]) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    notifySubscribers();
  }

  public createReport(data: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
    const newReport: Report = {
      ...data,
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const reports = [newReport, ...this.getReports()];
    this.saveReports(reports);
    return newReport;
  }

  public updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      this.saveReports(reports);
    }
  }

  public resolveReport(reportId: string, action: 'dismiss' | 'action_taken') {
    this.updateReportStatus(reportId, action === 'dismiss' ? 'dismissed' : 'resolved');
  }

  public blockUser(userId: string, targetId: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (!user.blockedUsers.includes(targetId)) {
      user.blockedUsers.push(targetId);
      // Also remove friendship if exists
      user.friends = user.friends.filter((id) => id !== targetId);
      user.following = user.following.filter((id) => id !== targetId);
      this.saveUsers(users);
    }
  }

  public unblockUser(userId: string, targetId: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    user.blockedUsers = user.blockedUsers.filter((id) => id !== targetId);
    this.saveUsers(users);
  }

  // ==========================================
  // REFERRAL & REWARDS SYSTEM SERVICE METHODS
  // ==========================================

  public getReferralCampaign(): ReferralCampaignConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRAL_CAMPAIGN);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing referral campaign', e);
      }
    }
    const defaultCampaign: ReferralCampaignConfig = {
      id: 'camp_cz_growth_2026',
      name: 'ConnectZone Global Referral & Rewards Program',
      rewardType: 'cash',
      rewardAmount: 0.1, // Configurable: $0.10 default as requested
      currency: '$',
      rewardStatus: 'active',
      minimumQualification: {
        requireEmailVerified: true,
        requireProfileComplete: true,
        requireFirstPost: true,
        requireMinActiveDays: 0,
      },
      maxReferralsPerUser: 50,
      campaignStartDate: '2026-01-01T00:00:00.000Z',
      campaignEndDate: '2026-12-31T23:59:59.000Z',
      minimumWithdrawal: 10,
      withdrawalMethods: [
        'USD (PayPal)',
        'USD (Bank Wire)',
        'USD (Stripe Direct)',
        'USDC (Crypto)',
      ],
    };
    this.saveReferralCampaign(defaultCampaign);
    return defaultCampaign;
  }

  public saveReferralCampaign(campaign: ReferralCampaignConfig) {
    localStorage.setItem(STORAGE_KEYS.REFERRAL_CAMPAIGN, JSON.stringify(campaign));
    notifySubscribers();
  }

  public updateReferralCampaign(updates: Partial<ReferralCampaignConfig>): ReferralCampaignConfig {
    const current = this.getReferralCampaign();
    const updated = { ...current, ...updates };
    this.saveReferralCampaign(updated);
    return updated;
  }

  public getReferralCodes(): ReferralCode[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRAL_CODES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing referral codes', e);
      }
    }
    // Seed initial referral codes
    const initialCodes: ReferralCode[] = [
      {
        id: 'code_alex',
        userId: 'user_alex',
        code: 'CZ8K4P2',
        createdAt: '2025-01-16T10:00:00.000Z',
        totalUses: 3,
        isActive: true,
      },
      {
        id: 'code_sarah',
        userId: 'user_sarah',
        code: 'CZ9M7X1',
        createdAt: '2025-01-21T12:00:00.000Z',
        totalUses: 1,
        isActive: true,
      },
      {
        id: 'code_marcus',
        userId: 'user_marcus',
        code: 'CZ2B5R9',
        createdAt: '2025-01-22T14:00:00.000Z',
        totalUses: 0,
        isActive: true,
      },
      {
        id: 'code_elena',
        userId: 'user_elena',
        code: 'CZ5V3Q8',
        createdAt: '2025-01-25T11:00:00.000Z',
        totalUses: 0,
        isActive: true,
      },
    ];
    this.saveReferralCodes(initialCodes);
    return initialCodes;
  }

  public saveReferralCodes(codes: ReferralCode[]) {
    localStorage.setItem(STORAGE_KEYS.REFERRAL_CODES, JSON.stringify(codes));
    notifySubscribers();
  }

  public getUserReferralCode(userId: string): ReferralCode {
    const codes = this.getReferralCodes();
    let existing = codes.find((c) => c.userId === userId && c.isActive);
    if (existing) {
      return existing;
    }

    // Generate unique code CZ + 5 alphanumeric characters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newCode = 'CZ';
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness
    while (codes.some((c) => c.code === newCode)) {
      newCode = 'CZ';
      for (let i = 0; i < 5; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    const created: ReferralCode = {
      id: `code_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      code: newCode,
      createdAt: new Date().toISOString(),
      totalUses: 0,
      isActive: true,
    };

    const updatedCodes = [...codes, created];
    this.saveReferralCodes(updatedCodes);

    // Also link to user record
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.referralCode = newCode;
      this.saveUsers(users);
    }

    return created;
  }

  public getReferrals(): Referral[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing referrals', e);
      }
    }

    // Seed realistic initial referrals for Alex and Sarah
    const initialReferrals: Referral[] = [
      {
        id: 'ref_seed_1',
        referrerId: 'user_alex',
        referredUserId: 'user_sarah',
        referralCode: 'CZ8K4P2',
        status: 'rewarded',
        registeredAt: '2025-01-20T10:30:00.000Z',
        qualificationDate: '2025-01-21T11:00:00.000Z',
        rewardId: 'rew_seed_1',
        rewardAmount: 0.1,
        rewardStatus: 'credited',
        qualificationChecklist: {
          accountVerified: true,
          emailVerified: true,
          profileCompleted: true,
          firstPostMade: true,
          activeDaysCompleted: true,
        },
      },
      {
        id: 'ref_seed_2',
        referrerId: 'user_alex',
        referredUserId: 'user_marcus',
        referralCode: 'CZ8K4P2',
        status: 'rewarded',
        registeredAt: '2025-01-22T09:15:00.000Z',
        qualificationDate: '2025-01-23T14:20:00.000Z',
        rewardId: 'rew_seed_2',
        rewardAmount: 0.1,
        rewardStatus: 'credited',
        qualificationChecklist: {
          accountVerified: true,
          emailVerified: true,
          profileCompleted: true,
          firstPostMade: true,
          activeDaysCompleted: true,
        },
      },
      {
        id: 'ref_seed_3',
        referrerId: 'user_alex',
        referredUserId: 'user_elena',
        referralCode: 'CZ8K4P2',
        status: 'pending_qualification',
        registeredAt: '2025-01-25T11:00:00.000Z',
        rewardStatus: 'none',
        qualificationChecklist: {
          accountVerified: true,
          emailVerified: true,
          profileCompleted: true,
          firstPostMade: false,
          activeDaysCompleted: true,
        },
      },
    ];

    this.saveReferrals(initialReferrals);
    return initialReferrals;
  }

  public saveReferrals(referrals: Referral[]) {
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
    notifySubscribers();
  }

  public getUserReferrals(userId: string): Referral[] {
    return this.getReferrals().filter((r) => r.referrerId === userId);
  }

  public getWallets(): RewardWallet[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REWARD_WALLETS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing reward wallets', e);
      }
    }

    // Seed initial wallets
    const initialWallets: RewardWallet[] = [
      {
        id: 'wall_alex',
        userId: 'user_alex',
        availableBalance: 12.5,
        pendingRewards: 0,
        totalEarned: 22.5,
        totalWithdrawn: 10.0,
        currency: '$',
        updatedAt: '2025-02-01T12:00:00.000Z',
      },
      {
        id: 'wall_sarah',
        userId: 'user_sarah',
        availableBalance: 5.2,
        pendingRewards: 0,
        totalEarned: 5.2,
        totalWithdrawn: 0,
        currency: '$',
        updatedAt: '2025-02-01T12:00:00.000Z',
      },
      {
        id: 'wall_marcus',
        userId: 'user_marcus',
        availableBalance: 0,
        pendingRewards: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        currency: '$',
        updatedAt: '2025-02-01T12:00:00.000Z',
      },
    ];

    this.saveWallets(initialWallets);
    return initialWallets;
  }

  public saveWallets(wallets: RewardWallet[]) {
    localStorage.setItem(STORAGE_KEYS.REWARD_WALLETS, JSON.stringify(wallets));
    notifySubscribers();
  }

  public getUserWallet(userId: string): RewardWallet {
    const wallets = this.getWallets();
    let existing = wallets.find((w) => w.userId === userId);
    if (existing) return existing;

    const campaign = this.getReferralCampaign();
    const newWallet: RewardWallet = {
      id: `wall_${userId}`,
      userId,
      availableBalance: 0,
      pendingRewards: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      currency: campaign.currency,
      updatedAt: new Date().toISOString(),
    };

    const updated = [...wallets, newWallet];
    this.saveWallets(updated);
    return newWallet;
  }

  public getWalletTransactions(userId?: string): WalletTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET_TRANSACTIONS);
    let txs: WalletTransaction[] = [];
    if (raw) {
      try {
        txs = JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing wallet transactions', e);
      }
    } else {
      // Seed initial transactions for Alex
      txs = [
        {
          id: 'tx_seed_1',
          userId: 'user_alex',
          amount: 10.0,
          type: 'bonus',
          status: 'completed',
          description: 'Welcome creator ambassador bonus',
          createdAt: '2025-01-16T12:00:00.000Z',
        },
        {
          id: 'tx_seed_2',
          userId: 'user_alex',
          amount: 0.1,
          type: 'referral_reward',
          status: 'completed',
          description: 'Referral reward for @sarahc qualification',
          referenceId: 'ref_seed_1',
          createdAt: '2025-01-21T11:00:00.000Z',
        },
        {
          id: 'tx_seed_3',
          userId: 'user_alex',
          amount: 0.1,
          type: 'referral_reward',
          status: 'completed',
          description: 'Referral reward for @marcus_dev qualification',
          referenceId: 'ref_seed_2',
          createdAt: '2025-01-23T14:20:00.000Z',
        },
        {
          id: 'tx_seed_4',
          userId: 'user_alex',
          amount: 10.0,
          type: 'withdrawal',
          status: 'completed',
          description: 'Payout via PayPal (USD) to alex@connectzone.io',
          createdAt: '2025-01-30T16:00:00.000Z',
        },
      ];
      this.saveWalletTransactions(txs);
    }

    if (userId) {
      return txs.filter((t) => t.userId === userId);
    }
    return txs;
  }

  public saveWalletTransactions(txs: WalletTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(txs));
    notifySubscribers();
  }

  public getWithdrawalRequests(userId?: string): WithdrawalRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS);
    let reqs: WithdrawalRequest[] = [];
    if (raw) {
      try {
        reqs = JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing withdrawal requests', e);
      }
    } else {
      reqs = [
        {
          id: 'with_seed_1',
          userId: 'user_alex',
          amount: 10.0,
          paymentMethod: 'USD (PayPal)',
          payoutDetails: 'alex@connectzone.io',
          status: 'paid',
          requestedAt: '2025-01-30T15:00:00.000Z',
          processedAt: '2025-01-30T16:00:00.000Z',
          processedByAdminId: 'user_sarah',
          adminNotes: 'Transaction batch #CZ-PAY-9812 paid.',
        },
      ];
      this.saveWithdrawalRequests(reqs);
    }

    if (userId) {
      return reqs.filter((r) => r.userId === userId);
    }
    return reqs;
  }

  public saveWithdrawalRequests(reqs: WithdrawalRequest[]) {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS, JSON.stringify(reqs));
    notifySubscribers();
  }

  public getFraudFlags(): ReferralFraudFlag[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRAL_FRAUD_FLAGS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing fraud flags', e);
      }
    }
    return [];
  }

  public saveFraudFlags(flags: ReferralFraudFlag[]) {
    localStorage.setItem(STORAGE_KEYS.REFERRAL_FRAUD_FLAGS, JSON.stringify(flags));
    notifySubscribers();
  }

  /**
   * Register a new referral when User B signs up with User A's code
   */
  public registerReferral(
    referralCode: string,
    newUserId: string,
    meta?: { ip?: string; deviceFingerprint?: string }
  ): { success: boolean; error?: string; referral?: Referral } {
    const cleanCode = referralCode.trim().toUpperCase();
    const codes = this.getReferralCodes();
    const codeRecord = codes.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!codeRecord) {
      return { success: false, error: 'Referral code not recognized or inactive.' };
    }

    // Prevent self-referral
    if (codeRecord.userId === newUserId) {
      return { success: false, error: 'Self-referral is not allowed.' };
    }

    const campaign = this.getReferralCampaign();
    if (campaign.rewardStatus !== 'active') {
      return { success: false, error: 'Referral campaign is currently paused.' };
    }

    // Check if user is already referred
    const referrals = this.getReferrals();
    if (referrals.some((r) => r.referredUserId === newUserId)) {
      return { success: false, error: 'User is already associated with a referral.' };
    }

    // Check max referrals per user
    const referrerExistingCount = referrals.filter((r) => r.referrerId === codeRecord.userId).length;
    if (referrerExistingCount >= campaign.maxReferralsPerUser) {
      return { success: false, error: 'Referrer has reached the maximum referral cap.' };
    }

    // Anti-Fraud Detection:
    // Check rapid repeat registrations from same device or within 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentFromSameReferrer = referrals.filter(
      (r) =>
        r.referrerId === codeRecord.userId &&
        new Date(r.registeredAt).getTime() > tenMinutesAgo
    );

    let initialStatus: ReferralStatus = 'pending_qualification';
    let isFlagged = false;
    let fraudReason = '';

    if (recentFromSameReferrer.length >= 3) {
      initialStatus = 'fraud_review';
      isFlagged = true;
      fraudReason = 'Abnormally rapid referral activity (>3 accounts in 10 minutes).';
    }

    const newUser = this.getUserById(newUserId);
    const newReferral: Referral = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      referrerId: codeRecord.userId,
      referredUserId: newUserId,
      referralCode: cleanCode,
      status: initialStatus,
      registeredAt: new Date().toISOString(),
      rewardStatus: 'none',
      ip: meta?.ip || '127.0.0.1',
      deviceFingerprint: meta?.deviceFingerprint || 'browser_client_v1',
      qualificationChecklist: {
        accountVerified: Boolean(newUser && !newUser.isBanned),
        emailVerified: Boolean(newUser?.isEmailVerified ?? true),
        profileCompleted: Boolean(newUser?.avatar && newUser?.bio && newUser.bio.length > 5),
        firstPostMade: this.getPosts().some((p) => p.authorId === newUserId),
        activeDaysCompleted: true,
      },
      fraudNotes: isFlagged ? fraudReason : undefined,
    };

    const updatedReferrals = [newReferral, ...referrals];
    this.saveReferrals(updatedReferrals);

    // Increment code uses
    codeRecord.totalUses += 1;
    this.saveReferralCodes(codes);

    // Update user referredBy
    if (newUser) {
      const users = this.getUsers();
      const u = users.find((user) => user.id === newUserId);
      if (u) {
        u.referredBy = codeRecord.userId;
        this.saveUsers(users);
      }
    }

    // Log fraud flag if detected
    if (isFlagged) {
      const flags = this.getFraudFlags();
      const newFlag: ReferralFraudFlag = {
        id: `flag_${Date.now()}`,
        referralId: newReferral.id,
        userId: codeRecord.userId,
        targetUserId: newUserId,
        reason: fraudReason,
        details: `Referral registered under code ${cleanCode}. Flagged for review before reward qualification.`,
        severity: 'medium',
        status: 'flagged',
        createdAt: new Date().toISOString(),
      };
      this.saveFraudFlags([newFlag, ...flags]);

      this.createNotification({
        recipientId: codeRecord.userId,
        senderId: 'user_sarah',
        type: 'referral_flagged',
        extraText: 'A recent referral was flagged for verification check.',
      });
    } else {
      // Normal notification to referrer
      this.createNotification({
        recipientId: codeRecord.userId,
        senderId: newUserId,
        type: 'referral_registered',
        extraText: `${newUser?.name || 'Someone'} registered using your referral code (${cleanCode})!`,
      });
    }

    // Evaluate qualification immediately
    this.evaluateReferralQualification(newUserId);

    return { success: true, referral: newReferral };
  }

  /**
   * Evaluate whether a referred user has fulfilled qualification rules
   */
  public evaluateReferralQualification(referredUserId: string) {
    const referrals = this.getReferrals();
    const referralIndex = referrals.findIndex((r) => r.referredUserId === referredUserId);
    if (referralIndex === -1) return;

    const referral = referrals[referralIndex];
    if (referral.status === 'qualified' || referral.status === 'rewarded' || referral.status === 'rejected') {
      return;
    }

    const user = this.getUserById(referredUserId);
    if (!user) return;

    const campaign = this.getReferralCampaign();
    const posts = this.getPosts().filter((p) => p.authorId === referredUserId);

    // Check conditions
    const accountVerified = !user.isBanned;
    const emailVerified = user.isEmailVerified !== false;
    const profileCompleted = Boolean(user.avatar && user.bio && user.bio.trim().length > 5);
    const firstPostMade = posts.length > 0;
    const activeDaysCompleted = true; // Simulated in test environment

    referral.qualificationChecklist = {
      accountVerified,
      emailVerified,
      profileCompleted,
      firstPostMade,
      activeDaysCompleted,
    };

    // Check if conditions match campaign requirements
    const reqs = campaign.minimumQualification;
    const isEmailOk = !reqs.requireEmailVerified || emailVerified;
    const isProfileOk = !reqs.requireProfileComplete || profileCompleted;
    const isPostOk = !reqs.requireFirstPost || firstPostMade;

    const isFullyQualified = accountVerified && isEmailOk && isProfileOk && isPostOk && activeDaysCompleted;

    if (isFullyQualified) {
      if (referral.status === 'fraud_review') {
        // Leave in fraud review for admin investigation
        this.saveReferrals(referrals);
        return;
      }

      referral.status = 'qualified';
      referral.qualificationDate = new Date().toISOString();

      // Issue reward if campaign is active
      if (campaign.rewardStatus === 'active' && referral.rewardStatus !== 'credited') {
        const rewardAmount = Number(campaign.rewardAmount.toFixed(2));
        referral.rewardAmount = rewardAmount;
        referral.rewardStatus = 'credited';
        referral.status = 'rewarded';

        // Credit referrer wallet
        const wallets = this.getWallets();
        let wallet = wallets.find((w) => w.userId === referral.referrerId);
        if (!wallet) {
          wallet = {
            id: `wall_${referral.referrerId}`,
            userId: referral.referrerId,
            availableBalance: 0,
            pendingRewards: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            currency: campaign.currency,
            updatedAt: new Date().toISOString(),
          };
          wallets.push(wallet);
        }

        wallet.availableBalance = Number((wallet.availableBalance + rewardAmount).toFixed(2));
        wallet.totalEarned = Number((wallet.totalEarned + rewardAmount).toFixed(2));
        wallet.updatedAt = new Date().toISOString();
        this.saveWallets(wallets);

        // Record transaction
        const txs = this.getWalletTransactions();
        const newTx: WalletTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          userId: referral.referrerId,
          amount: rewardAmount,
          type: 'referral_reward',
          status: 'completed',
          description: `Referral reward for @${user.username} qualification (${referral.referralCode})`,
          referenceId: referral.id,
          createdAt: new Date().toISOString(),
        };
        this.saveWalletTransactions([newTx, ...txs]);

        // Send notifications
        this.createNotification({
          recipientId: referral.referrerId,
          senderId: referredUserId,
          type: 'referral_qualified',
          extraText: `@${user.username} has qualified! Referral conditions met.`,
        });

        this.createNotification({
          recipientId: referral.referrerId,
          senderId: 'user_sarah',
          type: 'reward_credited',
          extraText: `+${campaign.currency}${rewardAmount} referral reward added to your wallet balance!`,
        });
      }
    }

    this.saveReferrals(referrals);
  }

  /**
   * Request a balance withdrawal
   */
  public requestWithdrawal(
    userId: string,
    amount: number,
    paymentMethod: string,
    payoutDetails: string
  ): { success: boolean; error?: string; request?: WithdrawalRequest } {
    const campaign = this.getReferralCampaign();
    const wallet = this.getUserWallet(userId);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Please specify a valid withdrawal amount.' };
    }

    if (numAmount < campaign.minimumWithdrawal) {
      return {
        success: false,
        error: `Minimum withdrawal amount is ${campaign.currency}${campaign.minimumWithdrawal}.`,
      };
    }

    if (numAmount > wallet.availableBalance) {
      return {
        success: false,
        error: `Insufficient balance. Your available balance is ${campaign.currency}${wallet.availableBalance.toFixed(2)}.`,
      };
    }

    if (!payoutDetails || payoutDetails.trim().length < 3) {
      return { success: false, error: 'Please provide valid payout details (account/email).' };
    }

    // Deduct from available balance, add to pending
    const wallets = this.getWallets();
    const userWall = wallets.find((w) => w.userId === userId);
    if (userWall) {
      userWall.availableBalance = Number((userWall.availableBalance - numAmount).toFixed(2));
      userWall.pendingRewards = Number((userWall.pendingRewards + numAmount).toFixed(2));
      userWall.updatedAt = new Date().toISOString();
      this.saveWallets(wallets);
    }

    const newReq: WithdrawalRequest = {
      id: `with_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      amount: numAmount,
      paymentMethod,
      payoutDetails: payoutDetails.trim(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const allReqs = this.getWithdrawalRequests();
    this.saveWithdrawalRequests([newReq, ...allReqs]);

    // Record transaction
    const txs = this.getWalletTransactions();
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      amount: numAmount,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request via ${paymentMethod} to ${payoutDetails.trim()}`,
      referenceId: newReq.id,
      createdAt: new Date().toISOString(),
    };
    this.saveWalletTransactions([newTx, ...txs]);

    // Notification
    this.createNotification({
      recipientId: userId,
      senderId: 'user_sarah',
      type: 'withdrawal_submitted',
      extraText: `Withdrawal request for ${campaign.currency}${numAmount.toFixed(2)} submitted for admin processing.`,
    });

    return { success: true, request: newReq };
  }

  /**
   * Admin approve withdrawal request
   */
  public approveWithdrawal(
    withdrawalId: string,
    adminId: string,
    notes?: string
  ): boolean {
    const reqs = this.getWithdrawalRequests();
    const req = reqs.find((r) => r.id === withdrawalId);
    if (!req || req.status !== 'pending') return false;

    req.status = 'approved';
    req.processedAt = new Date().toISOString();
    req.processedByAdminId = adminId;
    if (notes) req.adminNotes = notes;
    this.saveWithdrawalRequests(reqs);

    // Update transaction
    const txs = this.getWalletTransactions();
    const tx = txs.find((t) => t.referenceId === withdrawalId);
    if (tx) {
      tx.status = 'completed';
      this.saveWalletTransactions(txs);
    }

    // Send notification
    this.createNotification({
      recipientId: req.userId,
      senderId: adminId,
      type: 'withdrawal_approved',
      extraText: `Your withdrawal of $${req.amount.toFixed(2)} has been approved by administrator.`,
    });

    return true;
  }

  /**
   * Admin mark withdrawal paid (only when real or confirmed integration completes)
   */
  public markWithdrawalPaid(withdrawalId: string, adminId: string): boolean {
    const reqs = this.getWithdrawalRequests();
    const req = reqs.find((r) => r.id === withdrawalId);
    if (!req) return false;

    req.status = 'paid';
    req.processedAt = new Date().toISOString();
    req.processedByAdminId = adminId;
    this.saveWithdrawalRequests(reqs);

    // Move pendingRewards to totalWithdrawn in wallet
    const wallets = this.getWallets();
    const wallet = wallets.find((w) => w.userId === req.userId);
    if (wallet) {
      wallet.pendingRewards = Math.max(0, Number((wallet.pendingRewards - req.amount).toFixed(2)));
      wallet.totalWithdrawn = Number((wallet.totalWithdrawn + req.amount).toFixed(2));
      wallet.updatedAt = new Date().toISOString();
      this.saveWallets(wallets);
    }

    this.createNotification({
      recipientId: req.userId,
      senderId: adminId,
      type: 'withdrawal_approved',
      extraText: `Payment sent! $${req.amount.toFixed(2)} was successfully disbursed to ${req.payoutDetails}.`,
    });

    return true;
  }

  /**
   * Admin reject withdrawal request and refund wallet
   */
  public rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string
  ): boolean {
    const reqs = this.getWithdrawalRequests();
    const req = reqs.find((r) => r.id === withdrawalId);
    if (!req || req.status === 'rejected' || req.status === 'paid') return false;

    req.status = 'rejected';
    req.processedAt = new Date().toISOString();
    req.processedByAdminId = adminId;
    req.adminNotes = reason;
    this.saveWithdrawalRequests(reqs);

    // Refund wallet balance
    const wallets = this.getWallets();
    const wallet = wallets.find((w) => w.userId === req.userId);
    if (wallet) {
      wallet.availableBalance = Number((wallet.availableBalance + req.amount).toFixed(2));
      wallet.pendingRewards = Math.max(0, Number((wallet.pendingRewards - req.amount).toFixed(2)));
      wallet.updatedAt = new Date().toISOString();
      this.saveWallets(wallets);
    }

    // Update transaction
    const txs = this.getWalletTransactions();
    const tx = txs.find((t) => t.referenceId === withdrawalId);
    if (tx) {
      tx.status = 'rejected';
      tx.description = `${tx.description} (Rejected: ${reason})`;
      this.saveWalletTransactions(txs);
    }

    // Send notification
    this.createNotification({
      recipientId: req.userId,
      senderId: adminId,
      type: 'withdrawal_rejected',
      extraText: `Withdrawal of $${req.amount.toFixed(2)} was rejected: ${reason}. Funds refunded to balance.`,
    });

    return true;
  }

  /**
   * Manually qualify referral (admin testing tool)
   */
  public qualifyReferralManually(referralId: string, adminId: string): boolean {
    const referrals = this.getReferrals();
    const ref = referrals.find((r) => r.id === referralId);
    if (!ref) return false;

    ref.qualificationChecklist = {
      accountVerified: true,
      emailVerified: true,
      profileCompleted: true,
      firstPostMade: true,
      activeDaysCompleted: true,
    };
    ref.status = 'qualified';
    ref.qualificationDate = new Date().toISOString();

    const campaign = this.getReferralCampaign();
    if (ref.rewardStatus !== 'credited') {
      const rewardAmount = Number(campaign.rewardAmount.toFixed(2));
      ref.rewardAmount = rewardAmount;
      ref.rewardStatus = 'credited';
      ref.status = 'rewarded';

      const wallets = this.getWallets();
      let wallet = wallets.find((w) => w.userId === ref.referrerId);
      if (wallet) {
        wallet.availableBalance = Number((wallet.availableBalance + rewardAmount).toFixed(2));
        wallet.totalEarned = Number((wallet.totalEarned + rewardAmount).toFixed(2));
        wallet.updatedAt = new Date().toISOString();
        this.saveWallets(wallets);
      }

      const txs = this.getWalletTransactions();
      const newTx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: ref.referrerId,
        amount: rewardAmount,
        type: 'referral_reward',
        status: 'completed',
        description: `Manual admin qualification reward (${ref.referralCode})`,
        referenceId: ref.id,
        createdAt: new Date().toISOString(),
      };
      this.saveWalletTransactions([newTx, ...txs]);

      this.createNotification({
        recipientId: ref.referrerId,
        senderId: adminId,
        type: 'reward_credited',
        extraText: `+${campaign.currency}${rewardAmount} credited! Referral manually verified by admin.`,
      });
    }

    this.saveReferrals(referrals);
    return true;
  }

  /**
   * Reverse a fraudulent reward
   */
  public reverseReward(referralId: string, adminId: string, reason: string): boolean {
    const referrals = this.getReferrals();
    const ref = referrals.find((r) => r.id === referralId);
    if (!ref || ref.rewardStatus !== 'credited') return false;

    const amount = ref.rewardAmount || 0;
    ref.rewardStatus = 'reversed';
    ref.status = 'rejected';
    ref.fraudNotes = `Reward reversed: ${reason}`;
    this.saveReferrals(referrals);

    // Deduct from wallet
    const wallets = this.getWallets();
    const wallet = wallets.find((w) => w.userId === ref.referrerId);
    if (wallet) {
      wallet.availableBalance = Math.max(0, Number((wallet.availableBalance - amount).toFixed(2)));
      wallet.totalEarned = Math.max(0, Number((wallet.totalEarned - amount).toFixed(2)));
      wallet.updatedAt = new Date().toISOString();
      this.saveWallets(wallets);
    }

    // Record adjustment transaction
    const txs = this.getWalletTransactions();
    const revTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: ref.referrerId,
      amount: -amount,
      type: 'refund_reversal',
      status: 'completed',
      description: `Reward reversal for referral ${ref.referralCode}: ${reason}`,
      referenceId: ref.id,
      createdAt: new Date().toISOString(),
    };
    this.saveWalletTransactions([revTx, ...txs]);

    this.createNotification({
      recipientId: ref.referrerId,
      senderId: adminId,
      type: 'admin_alert',
      extraText: `A referral reward of $${amount} was reversed due to policy verification: ${reason}`,
    });

    return true;
  }

  /**
   * Resolve a fraud flag
   */
  public resolveFraudFlag(flagId: string, action: 'clear' | 'confirm_fraud'): boolean {
    const flags = this.getFraudFlags();
    const flag = flags.find((f) => f.id === flagId);
    if (!flag) return false;

    flag.status = action === 'clear' ? 'cleared' : 'confirmed_fraud';
    flag.resolvedAt = new Date().toISOString();
    this.saveFraudFlags(flags);

    if (flag.referralId) {
      const referrals = this.getReferrals();
      const ref = referrals.find((r) => r.id === flag.referralId);
      if (ref) {
        if (action === 'clear') {
          ref.status = 'pending_qualification';
          ref.fraudNotes = 'Fraud flag reviewed and cleared by admin.';
          this.saveReferrals(referrals);
          if (ref.referredUserId) {
            this.evaluateReferralQualification(ref.referredUserId);
          }
        } else {
          ref.status = 'rejected';
          ref.fraudNotes = 'Confirmed referral policy violation.';
          this.saveReferrals(referrals);
          if (ref.rewardStatus === 'credited') {
            this.reverseReward(ref.id, 'admin', 'Confirmed fraud flag resolution');
          }
        }
      }
    }

    return true;
  }
}

export const storage = new StorageService();
