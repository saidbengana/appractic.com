import { z } from 'zod';

export const postSchema = z.object({
  text: z
    .string()
    .min(1, 'Post text is required')
    .max(280, 'Post text must be less than 280 characters'),
  media: z
    .array(
      z.object({
        url: z.string().url('Invalid media URL'),
        type: z.string().regex(/^image\/.+|^video\/.+/, 'Invalid media type'),
      })
    )
    .optional(),
  scheduledAt: z.date().optional(),
  platforms: z
    .array(z.enum(['twitter', 'facebook', 'instagram', 'linkedin']))
    .min(1, 'At least one platform must be selected'),
});

export const accountSchema = z.object({
  provider: z.enum(['twitter', 'facebook', 'instagram', 'linkedin']),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  providerAccountId: z.string(),
  name: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

export const mediaSchema = z.object({
  file: z.instanceof(File),
  type: z.string().regex(/^image\/.+|^video\/.+/, 'Invalid media type'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
});

export const metricSchema = z.object({
  accountId: z.string(),
  timestamp: z.date(),
  impressions: z.number().int().nonnegative(),
  engagement: z.number().nonnegative(),
  clicks: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
  shares: z.number().int().nonnegative(),
});

export const audienceSchema = z.object({
  accountId: z.string(),
  timestamp: z.date(),
  followers: z.number().int().nonnegative(),
  demographics: z
    .record(z.string(), z.number().nonnegative())
    .optional(),
});
