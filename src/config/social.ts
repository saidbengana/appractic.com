export const SOCIAL_CONFIG = {
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    scopes: ['tweet.read', 'tweet.write', 'users.read']
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']
  },
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || '',
    appSecret: process.env.INSTAGRAM_APP_SECRET || '',
    scopes: ['instagram_basic', 'instagram_content_publish']
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    scopes: ['w_member_social']
  }
}
