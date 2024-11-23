import { FacebookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AddFacebookGroupProps {
  metaAppVersion?: string;
}

export function AddFacebookGroup({ metaAppVersion }: AddFacebookGroupProps) {
  const isDeprecated = metaAppVersion === "v19.0";

  const handleAddFacebookGroup = async () => {
    if (isDeprecated) {
      return;
    }

    try {
      const response = await fetch("/api/accounts/add/facebook_group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to add Facebook group");
      }
      
      // Handle successful response
      window.location.href = response.url;
    } catch (error) {
      console.error("Error adding Facebook group:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full flex items-center px-4 py-4 hover:bg-facebook/20 transition-colors"
      onClick={handleAddFacebookGroup}
      disabled={isDeprecated}
    >
      <span className="flex mr-4">
        <FacebookIcon className="text-facebook h-5 w-5" />
      </span>
      <span className="flex flex-col items-start">
        <span className="flex items-center gap-2 font-semibold">
          Facebook Group
          {isDeprecated && (
            <Badge variant="destructive" className="text-xs">
              Deprecated in v19
            </Badge>
          )}
        </span>
        <span className="text-sm text-muted-foreground">
          Connect a new Facebook group
        </span>
        {isDeprecated && (
          <span className="text-xs text-destructive">
            The Facebook Groups API is deprecated in v19.
          </span>
        )}
      </span>
    </Button>
  );
}
