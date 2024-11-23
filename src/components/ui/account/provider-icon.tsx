import { cn } from "@/lib/utils";
import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon } from "lucide-react";
import { MastodonIcon } from "@/components/icons/mastodon";

interface ProviderIconProps {
  provider: string;
  className?: string;
}

const useProviderClasses = (provider: string) => {
  const textClasses = {
    twitter: "text-twitter",
    facebook: "text-facebook",
    facebook_page: "text-facebook",
    facebook_group: "text-facebook",
    instagram: "text-instagram",
    linkedin: "text-linkedin",
    mastodon: "text-mastodon",
  }[provider] || "text-stone-600";

  return { textClasses };
};

const providers: Record<string, React.ComponentType<any>> = {
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  facebook_page: FacebookIcon,
  facebook_group: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  mastodon: MastodonIcon,
};

export function ProviderIcon({ provider, className }: ProviderIconProps) {
  const { textClasses } = useProviderClasses(provider);
  const Icon = providers[provider] || providers.twitter;

  return (
    <Icon className={cn("h-4 w-4", textClasses, className)} />
  );
}
