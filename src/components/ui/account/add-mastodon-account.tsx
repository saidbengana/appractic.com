import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { MastodonIcon } from "@/components/icons/mastodon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function AddMastodonAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [server, setServer] = useState("");
  const { toast } = useToast();

  const createApp = async () => {
    try {
      const response = await fetch("/api/services/mastodon/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ server }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create Mastodon app");
      }
    } catch (error) {
      throw error;
    }
  };

  const oAuthRedirect = async () => {
    try {
      const response = await fetch("/api/accounts/add/mastodon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ server }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect Mastodon account");
      }

      window.location.href = response.url;
    } catch (error) {
      throw error;
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      await createApp();
      await oAuthRedirect();
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.response.data.errors,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to connect Mastodon account",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(isOpen && "bg-mastodon/20")}>
      <Button
        variant="ghost"
        className="w-full flex items-center px-4 py-4 hover:bg-mastodon/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex mr-4">
          <MastodonIcon className="text-mastodon h-5 w-5" />
        </span>
        <span className="flex flex-col items-start">
          <span className="font-semibold">Mastodon</span>
          <span className="text-sm text-muted-foreground">
            Connect a new Mastodon profile
          </span>
        </span>
      </Button>

      {isOpen && (
        <div className="px-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="server"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enter your Mastodon server
              </label>
              <Input
                id="server"
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="example.server"
                className="max-w-sm"
              />
            </div>

            <Button
              onClick={handleConnect}
              disabled={!server || isLoading}
              className="mt-2"
            >
              <span className="mr-2">Next</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
