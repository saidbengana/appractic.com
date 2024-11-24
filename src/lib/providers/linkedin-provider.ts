import { BaseSocialProvider, SocialProviderConfig, PostContent } from './base-provider';
import axios from 'axios';

export class LinkedInProvider extends BaseSocialProvider {
  private baseUrl = 'https://api.linkedin.com/v2';
  private authUrl = 'https://www.linkedin.com/oauth/v2';

  constructor(config: SocialProviderConfig) {
    super(config);
  }

  getAuthUrl(): string {
    const scopes = [
      'r_liteprofile',
      'r_organization_social',
      'w_member_social',
      'w_organization_social',
      'r_organization_admin',
    ].join(' ');

    return `${this.authUrl}/authorization?response_type=code&client_id=${
      this.config.clientId
    }&redirect_uri=${encodeURIComponent(
      this.config.redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
  }

  async getAccessToken(code: string) {
    const response = await axios.post(
      `${this.authUrl}/accessToken`,
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  async getProfile(accessToken: string) {
    // Get user profile
    const meResponse = await axios.get(
      `${this.baseUrl}/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          projection: '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
        },
      }
    );

    // Get organizations (company pages)
    const orgsResponse = await axios.get(
      `${this.baseUrl}/organizationalEntityAcls`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          q: 'roleAssignee',
          role: 'ADMINISTRATOR',
        },
      }
    );

    const organizations = orgsResponse.data.elements;
    if (!organizations.length) {
      throw new Error('No LinkedIn company pages found');
    }

    // Use the first organization
    const org = organizations[0];

    return {
      id: org.organizationalTarget,
      name: `${meResponse.data.localizedFirstName} ${meResponse.data.localizedLastName}`,
      picture: meResponse.data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      organizationId: org.organizationalTarget,
    };
  }

  async publishPost(accessToken: string, content: PostContent) {
    const profile = await this.getProfile(accessToken);
    const orgId = profile.organizationId;

    let mediaIds = [];
    if (content.media?.length) {
      // Upload media assets
      for (const media of content.media) {
        const registerResponse = await axios.post(
          `${this.baseUrl}/assets?action=registerUpload`,
          {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: `urn:li:organization:${orgId}`,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerResponse.data.value.asset;

        // Upload the image
        await axios.put(
          uploadUrl,
          media.url,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': media.type,
            },
          }
        );

        mediaIds.push(asset);
      }
    }

    // Create the post
    const postData: any = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: mediaIds.length ? 'IMAGE' : 'NONE',
          media: mediaIds.map(id => ({
            status: 'READY',
            media: id,
          })),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/ugcPosts`,
      postData,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return {
      id: response.data.id,
      text: content.text,
    };
  }

  async getMetrics(accessToken: string, startDate: Date, endDate: Date) {
    const profile = await this.getProfile(accessToken);
    const orgId = profile.organizationId;

    const response = await axios.get(
      `${this.baseUrl}/organizationalEntityShareStatistics`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          q: 'organizationalEntity',
          organizationalEntity: `urn:li:organization:${orgId}`,
          timeIntervals: `(timeRange:(start:${startDate.getTime()},end:${endDate.getTime()}))`,
        },
      }
    );

    const stats = response.data.elements[0]?.totalShareStatistics || {};

    return {
      impressions: stats.impressionCount || 0,
      engagement: stats.engagement || 0,
      clicks: stats.clickCount || 0,
      likes: stats.likeCount || 0,
      comments: stats.commentCount || 0,
      shares: stats.shareCount || 0,
    };
  }

  async getAudience(accessToken: string) {
    const profile = await this.getProfile(accessToken);
    const orgId = profile.organizationId;

    const response = await axios.get(
      `${this.baseUrl}/organizations/${orgId}/followingStatistics`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return {
      followers: response.data.elements[0]?.totalFollowerCount || 0,
    };
  }
}
