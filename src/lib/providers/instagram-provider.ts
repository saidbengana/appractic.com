import { BaseSocialProvider, SocialProviderConfig, PostContent } from './base-provider';
import axios from 'axios';

export class InstagramProvider extends BaseSocialProvider {
  private baseUrl = 'https://graph.instagram.com';
  private graphUrl = 'https://graph.facebook.com/v17.0';

  constructor(config: SocialProviderConfig) {
    super(config);
  }

  getAuthUrl(): string {
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_engagement',
      'instagram_manage_insights',
    ].join(',');

    return `https://www.facebook.com/v17.0/dialog/oauth?client_id=${
      this.config.clientId
    }&redirect_uri=${encodeURIComponent(
      this.config.redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
  }

  async getAccessToken(code: string) {
    // First, get Facebook access token
    const response = await axios.get(
      `${this.graphUrl}/oauth/access_token`,
      {
        params: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
        },
      }
    );

    const fbAccessToken = response.data.access_token;

    // Get Instagram business account
    const accountResponse = await axios.get(
      `${this.graphUrl}/me/accounts`,
      {
        params: {
          access_token: fbAccessToken,
          fields: 'instagram_business_account{id,name,username}',
        },
      }
    );

    const pages = accountResponse.data.data;
    const page = pages.find((p: any) => p.instagram_business_account);

    if (!page) {
      throw new Error('No Instagram business account found');
    }

    return {
      accessToken: fbAccessToken,
      instagramAccountId: page.instagram_business_account.id,
    };
  }

  async getProfile(accessToken: string) {
    const response = await axios.get(
      `${this.graphUrl}/me`,
      {
        params: {
          access_token: accessToken,
          fields: 'instagram_business_account{id,name,username,profile_picture_url}',
        },
      }
    );

    const account = response.data.instagram_business_account;
    return {
      id: account.id,
      name: account.name,
      username: account.username,
      picture: account.profile_picture_url,
    };
  }

  async publishPost(accessToken: string, content: PostContent) {
    // First, create a container
    const containerResponse = await axios.post(
      `${this.graphUrl}/me/media`,
      null,
      {
        params: {
          access_token: accessToken,
          caption: content.text,
          ...(content.media?.[0] && { image_url: content.media[0].url }),
        },
      }
    );

    const containerId = containerResponse.data.id;

    // Then publish the container
    const publishResponse = await axios.post(
      `${this.graphUrl}/me/media_publish`,
      null,
      {
        params: {
          access_token: accessToken,
          creation_id: containerId,
        },
      }
    );

    return {
      id: publishResponse.data.id,
      text: content.text,
    };
  }

  async getMetrics(accessToken: string, startDate: Date, endDate: Date) {
    const metrics = [
      'impressions',
      'reach',
      'profile_views',
      'website_clicks',
    ].join(',');

    const response = await axios.get(
      `${this.graphUrl}/me/insights`,
      {
        params: {
          access_token: accessToken,
          metric: metrics,
          period: 'day',
          since: Math.floor(startDate.getTime() / 1000),
          until: Math.floor(endDate.getTime() / 1000),
        },
      }
    );

    const aggregatedMetrics = {
      impressions: 0,
      reach: 0,
      profileViews: 0,
      websiteClicks: 0,
    };

    response.data.data.forEach((metric: any) => {
      const values = metric.values.reduce(
        (sum: number, value: any) => sum + (value.value || 0),
        0
      );

      switch (metric.name) {
        case 'impressions':
          aggregatedMetrics.impressions += values;
          break;
        case 'reach':
          aggregatedMetrics.reach += values;
          break;
        case 'profile_views':
          aggregatedMetrics.profileViews += values;
          break;
        case 'website_clicks':
          aggregatedMetrics.websiteClicks += values;
          break;
      }
    });

    return aggregatedMetrics;
  }

  async getAudience(accessToken: string) {
    const response = await axios.get(
      `${this.graphUrl}/me`,
      {
        params: {
          access_token: accessToken,
          fields: 'followers_count,follows_count',
        },
      }
    );

    return {
      followers: response.data.followers_count,
      following: response.data.follows_count,
    };
  }
}
