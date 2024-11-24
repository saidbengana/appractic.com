import { BaseSocialProvider, SocialProviderConfig, PostContent } from './base-provider';
import { TwitterApi } from 'twitter-api-v2';

export class TwitterProvider extends BaseSocialProvider {
  private client: TwitterApi;

  constructor(config: SocialProviderConfig) {
    super(config);
    this.client = new TwitterApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  }

  getAuthUrl(): string {
    return this.client.generateOAuth2AuthLink(this.config.redirectUri, {
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    }).url;
  }

  async getAccessToken(code: string) {
    const { accessToken, refreshToken } = await this.client.loginWithOAuth2({
      code,
      redirectUri: this.config.redirectUri,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(accessToken: string) {
    const client = new TwitterApi(accessToken);
    const me = await client.v2.me();
    return {
      id: me.data.id,
      name: me.data.name,
      username: me.data.username,
    };
  }

  async publishPost(accessToken: string, content: PostContent) {
    const client = new TwitterApi(accessToken);
    const mediaIds = [];

    // Upload media if present
    if (content.media?.length) {
      for (const media of content.media) {
        const mediaId = await client.v1.uploadMedia(media.url);
        mediaIds.push(mediaId);
      }
    }

    // Create tweet
    const tweet = await client.v2.tweet({
      text: content.text,
      ...(mediaIds.length && { media: { media_ids: mediaIds } }),
    });

    return {
      id: tweet.data.id,
      text: tweet.data.text,
    };
  }

  async getMetrics(accessToken: string, startDate: Date, endDate: Date) {
    const client = new TwitterApi(accessToken);
    const me = await client.v2.me();
    const tweets = await client.v2.userTimeline(me.data.id, {
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      "tweet.fields": ['public_metrics'],
    });

    const metrics = {
      likes: 0,
      retweets: 0,
      replies: 0,
      impressions: 0,
    };

    for (const tweet of tweets.data.data) {
      const { public_metrics } = tweet;
      metrics.likes += public_metrics.like_count;
      metrics.retweets += public_metrics.retweet_count;
      metrics.replies += public_metrics.reply_count;
      metrics.impressions += public_metrics.impression_count;
    }

    return metrics;
  }

  async getAudience(accessToken: string) {
    const client = new TwitterApi(accessToken);
    const me = await client.v2.me();
    const user = await client.v2.user(me.data.id, {
      "user.fields": ['public_metrics'],
    });

    return {
      followers: user.data.public_metrics.followers_count,
      following: user.data.public_metrics.following_count,
    };
  }
}
