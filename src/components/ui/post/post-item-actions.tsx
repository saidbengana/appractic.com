import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { useEventEmitter } from "@/hooks/use-event-emitter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PencilSquare,
  MoreVertical,
  Copy,
  Trash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface PostItemActionsProps {
  itemId: string;
  filterStatus?: string | null;
  onDelete?: () => void;
}

export function PostItemActions({
  itemId,
  filterStatus = null,
  onDelete,
}: PostItemActionsProps) {
  const router = useRouter();
  const { emit } = useEventEmitter();
  const [confirmationDeletion, setConfirmationDeletion] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(\`/api/posts/\${itemId}?status=\${filterStatus}\`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setConfirmationDeletion(false);
      toast({
        title: "Success",
        description: "Post deleted",
      });
      onDelete?.();
      emit("postDelete", itemId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(\`/api/posts/\${itemId}/duplicate\`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate post");
      }

      toast({
        title: "Success",
        description: "Post duplicated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate post",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-row items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/posts/${itemId}/edit`}>
                <Button variant="ghost" size="icon">
                  <PencilSquare className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="mt-1">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-32">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-5 w-5 mr-1" />
              Duplicate
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setConfirmationDeletion(true)}
              className="text-red-500 focus:text-red-500"
            >
              <Trash className="h-5 w-5 mr-1" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog
        open={confirmationDeletion}
        onOpenChange={setConfirmationDeletion}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
