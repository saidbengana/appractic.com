import { BaseSocialProvider, SocialProviderConfig, PostContent } from './base-provider';
import axios from 'axios';

export class FacebookProvider extends BaseSocialProvider {
  private baseUrl = 'https://graph.facebook.com/v17.0';

  constructor(config: SocialProviderConfig) {
    super(config);
  }

  getAuthUrl(): string {
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
      'pages_read_user_content',
      'public_profile',
    ].join(',');

    return `https://www.facebook.com/v17.0/dialog/oauth?client_id=${
      this.config.clientId
    }&redirect_uri=${encodeURIComponent(
      this.config.redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
  }

  async getAccessToken(code: string) {
    const response = await axios.get(
      `${this.baseUrl}/oauth/access_token`,
      {
        params: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      // Facebook tokens are long-lived by default
    };
  }

  async getProfile(accessToken: string) {
    // Get user's pages first
    const pagesResponse = await axios.get(
      `${this.baseUrl}/me/accounts`,
      {
        params: { access_token: accessToken },
      }
    );

    const pages = pagesResponse.data.data;
    if (!pages.length) {
      throw new Error('No Facebook pages found');
    }

    // Use the first page
    const page = pages[0];
    const pageAccessToken = page.access_token;

    // Get page details
    const pageResponse = await axios.get(
      `${this.baseUrl}/${page.id}`,
      {
        params: {
          access_token: pageAccessToken,
          fields: 'id,name,username,picture',
        },
      }
    );

    return {
      id: pageResponse.data.id,
      name: pageResponse.data.name,
      username: pageResponse.data.username,
      accessToken: pageAccessToken, // Store page access token for future use
      picture: pageResponse.data.picture?.data?.url,
    };
  }

  async publishPost(accessToken: string, content: PostContent) {
    const mediaIds = [];

    // Upload media if present
    if (content.media?.length) {
      for (const media of content.media) {
        const uploadResponse = await axios.post(
          `${this.baseUrl}/me/photos`,
          {
            url: media.url,
            published: false,
          },
          {
            params: { access_token: accessToken },
          }
        );
        mediaIds.push(uploadResponse.data.id);
      }
    }

    // Create post
    const postData: any = {
      message: content.text,
    };

    if (mediaIds.length) {
      if (mediaIds.length === 1) {
        postData.photo_id = mediaIds[0];
      } else {
        postData.attached_media = mediaIds.map(id => ({
          media_fbid: id,
        }));
      }
    }

    const response = await axios.post(
      `${this.baseUrl}/me/feed`,
      postData,
      {
        params: { access_token: accessToken },
      }
    );

    return {
      id: response.data.id,
      text: content.text,
    };
  }

  async getMetrics(accessToken: string, startDate: Date, endDate: Date) {
    const metrics = [
      'page_impressions',
      'page_engaged_users',
      'page_post_engagements',
      'page_posts_impressions',
    ].join(',');

    const response = await axios.get(
      `${this.baseUrl}/me/insights`,
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
      engagements: 0,
      reactions: 0,
      shares: 0,
    };

    response.data.data.forEach((metric: any) => {
      const values = metric.values.reduce(
        (sum: number, value: any) => sum + (value.value || 0),
        0
      );

      switch (metric.name) {
        case 'page_impressions':
          aggregatedMetrics.impressions += values;
          break;
        case 'page_engaged_users':
          aggregatedMetrics.engagements += values;
          break;
        case 'page_post_engagements':
          aggregatedMetrics.reactions += values;
          break;
      }
    });

    return aggregatedMetrics;
  }

  async getAudience(accessToken: string) {
    const response = await axios.get(
      `${this.baseUrl}/me`,
      {
        params: {
          access_token: accessToken,
          fields: 'fan_count,followers_count',
        },
      }
    );

    return {
      likes: response.data.fan_count,
      followers: response.data.followers_count,
    };
  }
}
