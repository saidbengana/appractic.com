import { useMemo, useState } from "react";
import { usePost } from "@/hooks/use-post";
import { usePostVersions } from "@/hooks/use-post-versions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Account } from "@/components/ui/account";
import { ProviderIcon } from "@/components/ui/provider-icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  provider: string;
  image: string;
}

interface Version {
  account_id: string;
  is_original?: boolean;
  content: any[];
  options: Record<string, any>;
  account?: Account;
}

interface PostVersionsTabProps {
  versions: Version[];
  activeVersion: string;
  accounts: Account[];
  selectedAccounts: string[];
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
  onSelect: (accountId: string) => void;
  className?: string;
}

export function PostVersionsTab({
  versions,
  activeVersion,
  accounts,
  selectedAccounts,
  onAdd,
  onRemove,
  onSelect,
  className,
}: PostVersionsTabProps) {
  const { editAllowed } = usePost();
  const { getOriginalVersion } = usePostVersions();
  const [confirmationRemoval, setConfirmationRemoval] = useState<Version | null>(null);

  const availableAccounts = useMemo(() => {
    return accounts.filter(
      (account) =>
        selectedAccounts.includes(account.id) &&
        !versions.map((version) => version.account_id).includes(account.id)
    );
  }, [accounts, selectedAccounts, versions]);

  const nameOfLastAvailableAccount = useMemo(() => {
    if (availableAccounts.length === 1) {
      return availableAccounts[0].name;
    }
    return null;
  }, [availableAccounts]);

  const versionsWithAccountData = useMemo(() => {
    const defaultVersion = {
      ...getOriginalVersion(versions),
      account: { name: "Original" },
    };

    const versionsBelongsToAccount = versions
      .map((version) => {
        const account = accounts.find((account) => account.id === version.account_id);
        return account ? { ...version, account } : null;
      })
      .filter((version): version is Version & { account: Account } => version !== null);

    return [defaultVersion, ...versionsBelongsToAccount];
  }, [versions, accounts, getOriginalVersion]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-start">
        <Tabs
          value={activeVersion}
          onValueChange={onSelect}
          className="mr-2"
        >
          <TabsList>
            {versionsWithAccountData.map((version, index) => (
              <TabsTrigger
                key={version.account_id}
                value={version.account_id}
                className="relative mb-1 group"
              >
                <div className="flex items-center">
                  {!version.is_original && (
                    <ProviderIcon
                      provider={version.account.provider}
                      className="w-4 h-4 mr-2"
                    />
                  )}
                  
                  {version.is_original && nameOfLastAvailableAccount ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="mr-2">{version.account.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{nameOfLastAvailableAccount}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="mr-2">{version.account.name}</span>
                  )}

                  {!version.is_original && (
                    <div className="absolute hidden group-hover:flex items-center top-0 right-0 pb-2 pl-0.5 h-full bg-white">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmationRemoval(version);
                        }}
                        className="inline-flex text-gray-300 group-hover:text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {editAllowed && availableAccounts.length > 1 && (
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create version</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent className="w-64">
              <div className="px-2 py-1.5 text-sm font-semibold">
                Create version for
              </div>
              <ScrollArea className="h-[var(--radix-dropdown-menu-content-available-height)] max-h-72">
                {availableAccounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => onAdd(account.id)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">
                        <Account
                          provider={account.provider}
                          imgUrl={account.image}
                          active={true}
                        />
                      </span>
                      <span className="text-left">{account.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AlertDialog
        open={confirmationRemoval !== null}
        onOpenChange={() => setConfirmationRemoval(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove version</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationRemoval && (
                <span>
                  Are you sure you would like to delete version for{" "}
                  <span className="capitalize">
                    [{confirmationRemoval.account?.provider}]
                  </span>{" "}
                  {confirmationRemoval.account?.name}?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmationRemoval) {
                  onRemove(confirmationRemoval.account_id);
                  setConfirmationRemoval(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
