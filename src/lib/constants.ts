export const COLOR_PALETTE = {
  'slate-400': '#94a3b8',
  'stone-400': '#a8a29e',
  'gray-900': '#111827',
  'red-500': '#ef4444',
  'red-600': '#e11923',
  'orange-400': '#fb923c',
  'orange-700': '#c2410c',
  'amber-400': '#fbbf24',
  'yellow-400': '#facc15',
  'lime-400': '#a3e635',
  'green-400': '#4ade80',
  'emerald-400': '#34d399',
  'teal-400': '#2dd4bf',
  'cyan-400': '#22d3ee',
  'cyan-600': '#0891b2',
  'sky-400': '#38bdf8',
  'sky-700': '#0369a1',
  'blue-400': '#60a5fa',
  'indigo-400': '#818cf8',
  'violet-400': '#a78bfa',
  'purple-400': '#c084fc',
  'fuchsia-400': '#e879f9',
  'pink-400': '#f472b6',
  'rose-400': '#fb7185',
} as const

export const COLOR_PALETTE_LIST = Object.values(COLOR_PALETTE)

export const SOCIAL_PROVIDERS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  MASTODON: 'mastodon',
} as const

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHING: 'PUBLISHING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
} as const

export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  GIF: 'gif',
} as const

export const TIME_FORMATS = {
  '12': '12-hour',
  '24': '24-hour',
} as const

export const WEEK_STARTS = {
  '0': 'Sunday',
  '1': 'Monday',
  '6': 'Saturday',
} as const

export const MEDIA_QUALITY = {
  ORIGINAL: 'original',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
]

export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  MEDIA: '/api/media',
  SETTINGS: '/api/settings',
  SERVICES: '/api/services',
  ACCOUNTS: '/api/accounts',
} as const

// Navigation
export const DASHBOARD_LINKS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Posts',
    href: '/posts',
    icon: 'posts',
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: 'calendar',
  },
  {
    title: 'Media',
    href: '/media',
    icon: 'media',
  },
  {
    title: 'Services',
    href: '/services',
    icon: 'services',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
  },
] as const

// Form validation
export const VALIDATION = {
  POST: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
} as const
