"use client";

import * as React from "react";
import { countTextCharacters } from "@/lib/utils/count-text-characters";
import { Mastodon } from "@/lib/social-providers/mastodon";
import { getTweetLength } from "twitter-text";
import { findIndex, minBy, debounce, filter } from "lodash";
import { cn } from "@/lib/utils";
import { useEditor } from "@/hooks/use-editor";
import { usePostVersions } from "@/hooks/use-post-versions";
import { usePostContext } from "@/hooks/use-post-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface Account {
  id: string;
  provider: string;
  name: string;
  provider_options: {
    post_character_limit: number | null;
  };
}

interface Version {
  account_id: string;
  content: Array<{ body: string }>;
}

interface PostCharacterCountProps {
  selectedAccounts: Account[];
  versions: Version[];
  activeVersion: number;
  className?: string;
  isLoading?: boolean;
}

export function PostCharacterCount({
  selectedAccounts,
  versions,
  activeVersion,
  className,
  isLoading = false,
}: PostCharacterCountProps) {
  const { postCtx, setPostCtx } = usePostContext();
  const { accountHasVersion } = usePostVersions();
  const { getTextFromHtmlString } = useEditor();

  const accountsWithTextLimit = React.useMemo(
    () =>
      selectedAccounts
        .filter((account) => account.provider_options.post_character_limit !== null)
        .map((account) => ({
          account_id: account.id,
          provider: account.provider,
          limit: account.provider_options.post_character_limit,
        })),
    [selectedAccounts]
  );

  const accountsWithoutVersion = React.useMemo(
    () =>
      accountsWithTextLimit.filter(
        (account) => !accountHasVersion(versions, account.account_id)
      ),
    [accountsWithTextLimit, versions, accountHasVersion]
  );

  const getLimit = React.useCallback(
    (version: number | null) => {
      if (!accountsWithTextLimit.length) {
        return null;
      }

      // Original version
      if (!version) {
        if (!accountsWithoutVersion.length) {
          return null;
        }

        return minBy(accountsWithoutVersion, "limit")?.limit ?? null;
      }

      // Account version
      const indexAccount = findIndex(accountsWithTextLimit, {
        account_id: version.toString(),
      });

      return indexAccount !== -1 ? accountsWithTextLimit[indexAccount].limit : null;
    },
    [accountsWithTextLimit, accountsWithoutVersion]
  );

  const getProvider = React.useCallback(
    (version: number | null) => {
      // Original version
      if (!version) {
        if (!accountsWithoutVersion.length) {
          return null;
        }

        return minBy(accountsWithoutVersion, "limit")?.provider ?? null;
      }

      const item = selectedAccounts.find((account) => account.id === version.toString());
      return item ? item.provider : null;
    },
    [selectedAccounts, accountsWithoutVersion]
  );

  const getAccountName = React.useCallback(
    (version: number) => {
      const item = selectedAccounts.find((account) => account.id === version.toString());
      return item ? item.name : null;
    },
    [selectedAccounts]
  );

  const getEnabledVersions = React.useCallback(() => {
    return filter(versions, (version) => {
      // Original version is always enabled
      if (version.account_id === "0") {
        return true;
      }

      return selectedAccounts.some((account) => account.id === version.account_id);
    });
  }, [versions, selectedAccounts]);

  const getPostBody = React.useCallback(
    (version: number) => {
      const item = versions.find(
        (versionItem) => versionItem.account_id === version.toString()
      );
      return item ? item.content[0].body : "";
    },
    [versions]
  );

  const getContentLength = React.useCallback(
    (provider: string | null, text: string | null = null) => {
      const content = text ?? getTextFromHtmlString(getPostBody(activeVersion));

      switch (provider) {
        case "mastodon":
          return Mastodon.getPostLength(content);
        case "twitter":
          return getTweetLength(content);
        default:
          return countTextCharacters(content);
      }
    },
    [activeVersion, getPostBody, getTextFromHtmlString]
  );

  const calc = (limit: number, used: number) => limit - used;

  const pushLimit = React.useCallback(
    (data: {
      account_id: number;
      account_name: string | null;
      provider: string | null;
      limit: number;
      hit: boolean;
    }) => {
      if (!postCtx?.textLimit) return;

      const index = postCtx.textLimit.findIndex(
        (object) => object.account_id === data.account_id
      );

      if (index !== -1) {
        postCtx.textLimit.splice(index, 1, data);
      } else {
        postCtx.textLimit.push(data);
      }
    },
    [postCtx]
  );

  const removeAllLimits = React.useCallback(() => {
    if (postCtx) {
      postCtx.textLimit = [];
    }
  }, [postCtx]);

  const initLimits = React.useCallback(() => {
    getEnabledVersions().forEach((version) => {
      const limit = getLimit(Number(version.account_id));

      if (!limit) {
        return;
      }

      const text = getTextFromHtmlString(version.content[0].body);
      const provider = getProvider(Number(version.account_id));
      const remaining = calc(limit, getContentLength(provider, text));

      pushLimit({
        account_id: Number(version.account_id),
        account_name: getAccountName(Number(version.account_id)),
        provider,
        limit,
        hit: remaining < 0,
      });
    });
  }, [
    getEnabledVersions,
    getLimit,
    getProvider,
    getContentLength,
    getAccountName,
    getTextFromHtmlString,
    pushLimit,
  ]);

  const providerActiveVersion = React.useMemo(
    () => getProvider(activeVersion),
    [getProvider, activeVersion]
  );

  const limitActiveVersion = React.useMemo(
    () => getLimit(activeVersion),
    [getLimit, activeVersion]
  );

  const characterUsedActiveVersion = React.useMemo(
    () => getContentLength(providerActiveVersion),
    [getContentLength, providerActiveVersion]
  );

  const remaining = React.useMemo(() => {
    if (limitActiveVersion === null) {
      return null;
    }

    return calc(limitActiveVersion, characterUsedActiveVersion);
  }, [limitActiveVersion, characterUsedActiveVersion]);

  const getProgressColor = React.useCallback((remaining: number, limit: number) => {
    const percentage = (remaining / limit) * 100;
    if (percentage <= 10) return "text-destructive";
    if (percentage <= 20) return "text-warning";
    return "text-muted-foreground";
  }, []);

  const getProgressValue = React.useCallback((remaining: number, limit: number) => {
    return Math.max(0, Math.min(100, (remaining / limit) * 100));
  }, []);

  React.useEffect(() => {
    const debouncedPushLimit = debounce(() => {
      if (!limitActiveVersion) {
        return;
      }

      pushLimit({
        account_id: activeVersion,
        account_name: getAccountName(activeVersion),
        provider: providerActiveVersion,
        limit: limitActiveVersion,
        hit: remaining !== null && remaining < 0,
      });
    }, 100);

    debouncedPushLimit();

    return () => {
      debouncedPushLimit.cancel();
    };
  }, [
    remaining,
    limitActiveVersion,
    activeVersion,
    getAccountName,
    providerActiveVersion,
    pushLimit,
  ]);

  React.useEffect(() => {
    removeAllLimits();
    initLimits();
  }, [versions.length, selectedAccounts, removeAllLimits, initLimits]);

  React.useEffect(() => {
    initLimits();
  }, [initLimits]);

  return (
    <div 
      className={cn("flex flex-col gap-2", className)} 
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-2"
          >
            <span className="text-sm text-muted-foreground">Loading character counts...</span>
          </motion.div>
        ) : postCtx?.textLimit?.map((item) => (
          <motion.div
            key={item.account_id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
            layout
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {item.account_name || "Original"}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.hit && (
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-xs text-destructive"
                            role="alert"
                          >
                            Limit exceeded
                          </motion.span>
                        )}
                        <span
                          className={cn(
                            "text-sm tabular-nums",
                            getProgressColor(item.limit - getContentLength(item.provider), item.limit),
                            item.hit && "font-semibold"
                          )}
                          aria-label={`${item.limit - getContentLength(item.provider)} characters remaining out of ${item.limit}`}
                        >
                          {item.limit - getContentLength(item.provider)}/{item.limit}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={getProgressValue(
                        item.limit - getContentLength(item.provider),
                        item.limit
                      )}
                      className={cn(
                        "h-1",
                        item.hit && "bg-destructive/20 [&>[role=progressbar]]:bg-destructive"
                      )}
                      aria-label={`Character count progress for ${item.account_name || "Original"}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {item.provider?.charAt(0).toUpperCase() + item.provider?.slice(1)} character limit
                    for {item.account_name || "Original"}
                    {item.hit && " - Limit exceeded"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
