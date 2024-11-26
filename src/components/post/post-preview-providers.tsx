import { ProviderIcon } from '@/components/account/provider-icon'
import { cn } from '@/lib/utils'

interface PostPreviewProvidersProps {
  providers: string[]
  className?: string
}

export function PostPreviewProviders({
  providers,
  className = '',
}: PostPreviewProvidersProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {providers.map((provider) => (
        <ProviderIcon key={provider} provider={provider} className="h-5 w-5" />
      ))}
    </div>
  )
}
