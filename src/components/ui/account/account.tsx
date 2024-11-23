import { cn } from "@/lib/utils";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProviderIcon } from "./provider-icon";

interface AccountProps {
  imgUrl: string | null;
  provider: string;
  active?: boolean;
  size?: "md" | "lg";
  warningMessage?: string;
  className?: string;
}

const useProviderClasses = (provider: string) => {
  const borderClasses = {
    twitter: "border-twitter",
    facebook: "border-facebook",
    instagram: "border-instagram",
    linkedin: "border-linkedin",
    mastodon: "border-mastodon",
  }[provider] || "border-stone-600";

  const activeBgClasses = {
    twitter: "bg-twitter/10",
    facebook: "bg-facebook/10",
    instagram: "bg-instagram/10",
    linkedin: "bg-linkedin/10",
    mastodon: "bg-mastodon/10",
  }[provider] || "bg-stone-600/10";

  return { borderClasses, activeBgClasses };
};

export function Account({
  imgUrl,
  provider,
  active = false,
  size = "md",
  warningMessage = "",
  className,
}: AccountProps) {
  const { borderClasses, activeBgClasses } = useProviderClasses(provider);

  const border = active ? borderClasses : "border-stone-600";

  const sizeImgClasses = {
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }[size];

  const iconWrapperClasses = {
    md: "w-5 h-5 -mb-11 -mr-5",
    lg: "w-8 h-8 -mb-16 -mr-9",
  }[size];

  const iconClasses = {
    md: "!w-4 !h-4",
  }[size];

  return (
    <span className={cn("flex items-center justify-center", className)}>
      <span
        className={cn(
          border,
          "flex items-center justify-center relative border-2 p-1 rounded-full bg-white"
        )}
      >
        <span
          className={cn(
            activeBgClasses,
            sizeImgClasses,
            "inline-flex justify-center items-center flex-shrink-0 rounded-full",
            !active && "grayscale"
          )}
        >
          <img
            src={imgUrl || ""}
            className="object-cover w-full h-full rounded-full"
            alt=""
          />
        </span>
        {warningMessage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-center rounded-full absolute top-0 -ml-12 bg-orange-500 text-white">
                  <ExclamationCircleIcon className={iconClasses} />
                </span>
              </TooltipTrigger>
              <TooltipContent>{warningMessage}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span
          className={cn(
            iconWrapperClasses,
            "flex items-center justify-center absolute bg-white p-md rounded-full",
            !active && "grayscale"
          )}
        >
          <span>
            <ProviderIcon provider={provider} />
          </span>
        </span>
      </span>
    </span>
  );
}
