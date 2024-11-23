import { useState, useContext } from "react";
import { uniqBy } from "lodash";
import { ClockIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProviderIcon } from "@/components/ui/account/provider-icon";
import { PostStatus } from "@/components/ui/post/post-status";
import { PostItemActions } from "@/components/ui/post/post-item-actions";
import { PostPreviewProviders } from "@/components/ui/post/post-preview-providers";
import { CalendarFilterContext } from "@/contexts/calendar-filter-context";
import { useSettings } from "@/hooks/use-settings";
import { usePostVersions } from "@/hooks/use-post-versions";
import { convertTime24to12 } from "@/lib/utils";

interface Tag {
  id: string;
  hex_color: string;
}

interface Account {
  id: string;
  name: string;
  provider: string;
}

interface Version {
  id: string;
  account_id?: string;
  content: Array<{
    excerpt: string;
  }>;
}

interface CalendarPostItem {
  id: string;
  versions: Version[];
  accounts: Account[];
  tags: Tag[];
  status: string;
  scheduled_at: {
    time: string;
  };
}

interface CalendarPostItemProps {
  item: CalendarPostItem;
}

export function CalendarPostItem({ item }: CalendarPostItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { timeFormat } = useSettings();
  const { getOriginalVersion, getAccountVersion } = usePostVersions();
  const { calendarFilter } = useContext(CalendarFilterContext);

  const content = (() => {
    if (!item.versions.length) {
      return { excerpt: "" };
    }

    let accounts = item.accounts;

    if (calendarFilter.accounts.length) {
      accounts = accounts.filter((account) =>
        calendarFilter.accounts.includes(account.id)
      );
    }

    const accountVersions = accounts.map((account) => {
      const accountVersion = getAccountVersion(item.versions, account.id);
      return accountVersion
        ? accountVersion.content[0]
        : getOriginalVersion(item.versions).content[0];
    });

    const record = accountVersions.length
      ? accountVersions[0]
      : item.versions[0].content[0];

    return { excerpt: record.excerpt };
  })();

  const uniqueAccounts = uniqBy(item.accounts, "provider");

  const time = timeFormat === 12
    ? convertTime24to12(item.scheduled_at.time)
    : item.scheduled_at.time;

  return (
    <>
      <div
        className="w-full relative flex rounded-md overflow-hidden border border-gray-200 hover:border-primary transition-colors cursor-pointer"
        onClick={() => setIsPreviewOpen(true)}
        role="button"
        tabIndex={0}
      >
        {item.tags.length > 0 && (
          <div className="flex flex-col h-full">
            {item.tags.map((tag, index) => (
              <div
                key={tag.id}
                className={cn(
                  "w-2 h-full",
                  index === 0 && "rounded-tl-md",
                  index === item.tags.length - 1 && "rounded-bl-md"
                )}
                style={{ backgroundColor: tag.hex_color }}
              />
            ))}
          </div>
        )}

        <div className="w-full h-full p-1 md:p-3 bg-white">
          <div className="text-left text-sm md:text-base">{content.excerpt}</div>

          {uniqueAccounts.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mt-2">
              {uniqueAccounts.map((account) => (
                <TooltipProvider key={account.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <ProviderIcon
                        provider={account.provider}
                        className="h-4 w-4"
                      />
                    </TooltipTrigger>
                    <TooltipContent>{account.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-muted-foreground">
              <ClockIcon className="hidden md:block mr-1 h-5 w-5" />
              <span className="text-sm">{time}</span>
            </div>
            <div className="hidden md:block">
              <PostStatus value={item.status} showName={false} />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <div className="mb-6">
            <PostStatus value={item.status} />
          </div>

          {isPreviewOpen && (
            <PostPreviewProviders
              accounts={item.accounts}
              versions={item.versions}
            />
          )}

          <DialogFooter>
            <div className="flex items-center gap-2">
              <PostItemActions itemId={item.id} />
              <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
