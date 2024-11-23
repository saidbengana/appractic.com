import { TwitterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddTwitterAccount() {
  const handleAddTwitterAccount = async () => {
    try {
      const response = await fetch("/api/accounts/add/twitter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to add X profile");
      }
      
      // Handle successful response
      window.location.href = response.url;
    } catch (error) {
      console.error("Error adding X profile:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full flex items-center px-4 py-4 hover:bg-twitter/20 transition-colors"
      onClick={handleAddTwitterAccount}
    >
      <span className="flex mr-4">
        <TwitterIcon className="text-twitter h-5 w-5" />
      </span>
      <span className="flex flex-col items-start">
        <span className="font-semibold">X</span>
        <span className="text-sm text-muted-foreground">
          Connect a new X profile
        </span>
      </span>
    </Button>
  );
}
