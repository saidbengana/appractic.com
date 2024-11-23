import { useMemo } from "react";
import { usePostVersions } from "@/hooks/use-post-versions";
import { PostPreviewTwitter } from "@/components/ui/post/post-preview-twitter";
import { PostPreviewFacebook } from "@/components/ui/post/post-preview-facebook";
import { PostPreviewMastodon } from "@/components/ui/post/post-preview-mastodon";
import { Panel } from "@/components/ui/panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProviderIcon } from "@/components/ui/provider-icon";
import { ArrowTopRightSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Account {
  id: string;
  provider: string;
  name: string;
  username: string;
  image: string;
  external_url?: string;
  errors?: string[] | Record<string, string>;
  options?: Record<string, any>;
}

interface Version {
  id: string;
  account_id?: string;
  content: any[];
  options?: Record<string, any>;
}

interface PostPreviewProvidersProps {
  accounts: Account[];
  versions: Version[];
  className?: string;
  loading?: boolean;
  onAccountClick?: (account: Account) => void;
  onExternalLinkClick?: (url: string, account: Account) => void;
}

const providerComponents = {
  twitter: PostPreviewTwitter,
  facebook_page: PostPreviewFacebook,
  facebook_group: PostPreviewFacebook,
  mastodon: PostPreviewMastodon,
} as const;

function PreviewSkeleton() {
  return (
    <Panel className="mt-6">
      <div className="flex items-start animate-pulse">
        <div className="mr-3">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="w-full space-y-5">
          <div className="flex items-center space-x-1.5">
            <Skeleton className="w-2/12 h-4" />
            <Skeleton className="w-3/12 h-4" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-2/5 h-4" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function PostPreviewProviders({
  accounts,
  versions,
  className,
  loading = false,
  onAccountClick,
  onExternalLinkClick,
}: PostPreviewProvidersProps) {
  const { getOriginalVersion, getAccountVersion } = usePostVersions();

  const defaultVersion = useMemo(() => {
    return getOriginalVersion(versions);
  }, [versions]);

  const previews = useMemo(() => {
    return accounts.map((account) => {
      const accountVersion = getAccountVersion(versions, account.id);
      const content = accountVersion ? accountVersion.content : defaultVersion?.content;

      return {
        account,
        content,
        ProviderComponent: providerComponents[account.provider as keyof typeof providerComponents],
      };
    });
  }, [accounts, versions, defaultVersion]);

  const hasErrors = (errors: any): boolean => {
    if (!errors) return false;
    if (Array.isArray(errors)) return errors.length > 0;
    if (typeof errors === "object") return Object.keys(errors).length > 0;
    return false;
  };

  const formatErrors = (errors: string[] | Record<string, string>): string => {
    if (Array.isArray(errors)) {
      return errors.join(", ");
    }
    if (typeof errors === "object") {
      return Object.values(errors).join(", ");
    }
    return "";
  };

  if (loading) {
    return <PreviewSkeleton />;
  }

  if (!accounts.length) {
    return (
      <div className={className}>
        <div className="text-lg font-medium">Hi 👋</div>
        <div className="text-muted-foreground">
          Select an account and start writing your post in the left panel to start.
        </div>
        <PreviewSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {previews.map((preview) => {
        if (!preview.ProviderComponent) return null;

        return (
          <div key={preview.account.id}>
            {hasErrors(preview.account.errors) && (
              <Alert variant="destructive" className="mb-1">
                <AlertDescription className="overflow-x-auto">
                  <div className="hyphens-none">
                    {formatErrors(preview.account.errors as string[] | Record<string, string>)}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div 
              className="relative" 
              onClick={() => onAccountClick?.(preview.account)}
            >
              <preview.ProviderComponent
                name={preview.account.name}
                username={preview.account.username}
                image={preview.account.image}
                content={preview.content}
                options={preview.account.options}
              />

              <div className="absolute right-0 top-0 -mt-2 -mr-1">
                <div className="flex items-center">
                  {preview.account.external_url && (
                    <div className="mr-1.5 flex items-center justify-center p-2 w-7 h-7 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                      <a
                        href={preview.account.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExternalLinkClick?.(preview.account.external_url!, preview.account);
                        }}
                      >
                        <ArrowTopRightSquare className="w-5 h-5" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-center p-2 w-7 h-7 rounded-full bg-white border border-gray-200">
                    <ProviderIcon provider={preview.account.provider} className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
