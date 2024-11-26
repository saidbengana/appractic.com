import Image from 'next/image'

interface ProviderIconProps {
  provider: string
  className?: string
}

const providerIcons = {
  twitter: '/twitter.svg',
  instagram: '/instagram.svg',
  facebook: '/facebook.svg',
  linkedin: '/linkedin.svg',
  tiktok: '/tiktok.svg',
  youtube: '/youtube.svg',
}

export function ProviderIcon({ provider, className = '' }: ProviderIconProps) {
  const iconPath = providerIcons[provider.toLowerCase() as keyof typeof providerIcons]

  if (!iconPath) {
    return null
  }

  return (
    <Image
      src={iconPath}
      alt={`${provider} icon`}
      width={24}
      height={24}
      className={className}
    />
  )
}
