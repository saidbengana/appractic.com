import { useMemo } from 'react'
import { SOCIAL_PROVIDERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export type Provider = keyof typeof SOCIAL_PROVIDERS | 'facebook_page' | 'facebook_group'

type ProviderClasses = Record<Provider, string>

const textClasses: Partial<ProviderClasses> = {
  twitter: 'text-twitter',
  facebook: 'text-facebook',
  facebook_page: 'text-facebook',
  facebook_group: 'text-facebook',
  mastodon: 'text-mastodon',
  instagram: 'text-instagram',
  linkedin: 'text-linkedin',
} as const

const borderClasses: Partial<ProviderClasses> = {
  twitter: 'border-twitter',
  facebook: 'border-facebook',
  facebook_page: 'border-facebook',
  facebook_group: 'border-facebook',
  mastodon: 'border-mastodon',
  instagram: 'border-instagram',
  linkedin: 'border-linkedin',
} as const

const bgClasses: Partial<ProviderClasses> = {
  twitter: 'bg-twitter',
  facebook: 'bg-facebook',
  facebook_page: 'bg-facebook',
  facebook_group: 'bg-facebook',
  mastodon: 'bg-mastodon',
  instagram: 'bg-instagram',
  linkedin: 'bg-linkedin',
} as const

export const useProviderClasses = (provider: Provider, className?: string) => {
  const textClass = useMemo(() => {
    return cn(textClasses[provider] || '', className)
  }, [provider, className])

  const borderClass = useMemo(() => {
    return cn(borderClasses[provider] || '', className)
  }, [provider, className])

  const bgClass = useMemo(() => {
    return cn(bgClasses[provider] || '', className)
  }, [provider, className])

  return {
    textClass,
    borderClass,
    bgClass,
  }
}
