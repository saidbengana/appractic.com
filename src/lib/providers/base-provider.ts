export interface SocialProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface MediaFile {
  url: string;
  type: string;
  size: number;
}

export interface PostContent {
  text: string;
  media?: MediaFile[];
}

export abstract class BaseSocialProvider {
  protected config: SocialProviderConfig;

  constructor(config: SocialProviderConfig) {
    this.config = config;
  }

  abstract getAuthUrl(): string;
  abstract getAccessToken(code: string): Promise<any>;
  abstract getProfile(accessToken: string): Promise<any>;
  abstract publishPost(accessToken: string, content: PostContent): Promise<any>;
  abstract getMetrics(accessToken: string, startDate: Date, endDate: Date): Promise<any>;
  abstract getAudience(accessToken: string): Promise<any>;
}
