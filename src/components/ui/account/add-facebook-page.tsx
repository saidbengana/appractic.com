import { FacebookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddFacebookPage() {
  const handleAddFacebookPage = async () => {
    try {
      const response = await fetch("/api/accounts/add/facebook_page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to add Facebook page");
      }
      
      // Handle successful response
      window.location.href = response.url;
    } catch (error) {
      console.error("Error adding Facebook page:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full flex items-center px-4 py-4 hover:bg-facebook/20 transition-colors"
      onClick={handleAddFacebookPage}
    >
      <span className="flex mr-4">
        <FacebookIcon className="text-facebook h-5 w-5" />
      </span>
      <span className="flex flex-col items-start">
        <span className="font-semibold">Facebook Page</span>
        <span className="text-sm text-muted-foreground">
          Connect a new Facebook page
        </span>
      </span>
    </Button>
  );
}
