"use client";

import * as React from "react";
import { usePost } from "@/hooks/use-post";
import { ExclamationIcon } from "@/components/ui/icons/exclamation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface TextLimitItem {
  provider: string;
  limit: number;
  account_name?: string;
}

interface MediaLimitItem {
  mixing: {
    hit: boolean;
    provider: string;
  };
  photos: {
    hit: boolean;
    provider: string;
    limit: number;
  };
  videos: {
    hit: boolean;
    provider: string;
    limit: number;
  };
  gifs: {
    hit: boolean;
    provider: string;
    limit: number;
  };
  account_name?: string;
}

export function PostLimitErrors() {
  const { accountsHitTextLimit, accountsHitMediaLimit } = usePost();

  const show = React.useMemo(() => {
    return (
      accountsHitTextLimit.length !== 0 || accountsHitMediaLimit.length !== 0
    );
  }, [accountsHitTextLimit, accountsHitMediaLimit]);

  const resolveProvider = (provider: string): string => {
    if (["facebook_page", "facebook_group"].includes(provider)) {
      return "facebook";
    }
    return provider;
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        role="alert"
        aria-live="polite"
        className="w-full flex items-center px-4 py-2 md:py-4 flex-row border-b border-gray-200 text-red-500 bg-red-50"
      >
        <div className="w-8 h-8 mr-3 flex items-center" aria-hidden="true">
          <ExclamationIcon />
        </div>

        <div className="space-y-2">
          {accountsHitTextLimit.length > 0 && (
            <div role="group" aria-label="Text limit errors">
              {accountsHitTextLimit.map((item: TextLimitItem, index: number) => (
                <motion.p
                  key={`text-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-1 last:mb-0"
                >
                  <span className="capitalize font-medium">
                    {resolveProvider(item.provider)}
                  </span>{" "}
                  <span>
                    has a {item.limit} character limit.
                    {item.account_name && (
                      <>
                        {" "}
                        Please check the{" "}
                        <span className="font-semibold">{item.account_name}</span>{" "}
                        version.
                      </>
                    )}
                  </span>
                </motion.p>
              ))}
            </div>
          )}

          {accountsHitMediaLimit.length > 0 && (
            <div role="group" aria-label="Media limit errors">
              {accountsHitMediaLimit.map((item: MediaLimitItem, index: number) => (
                <motion.p
                  key={`media-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (accountsHitTextLimit.length + index) * 0.1 }}
                  className="mb-1 last:mb-0"
                >
                  {item.mixing.hit ? (
                    <span>
                      <span className="capitalize font-medium">
                        {resolveProvider(item.mixing.provider)}
                      </span>{" "}
                      does not support mixing videos, GIFs, and images in a single post.
                    </span>
                  ) : (
                    <span>
                      {item.photos.hit && (
                        <span>
                          <span className="capitalize font-medium">
                            {resolveProvider(item.photos.provider)}
                          </span>{" "}
                          has a limit of {item.photos.limit} images per post.{" "}
                        </span>
                      )}
                      {item.videos.hit && (
                        <span>
                          <span className="capitalize font-medium">
                            {resolveProvider(item.videos.provider)}
                          </span>{" "}
                          has a limit of {item.videos.limit} videos per post.{" "}
                        </span>
                      )}
                      {item.gifs.hit && (
                        <span>
                          <span className="capitalize font-medium">
                            {resolveProvider(item.gifs.provider)}
                          </span>{" "}
                          has a limit of {item.gifs.limit} GIFs per post.{" "}
                        </span>
                      )}
                    </span>
                  )}
                  {item.account_name && (
                    <span>
                      Please check the{" "}
                      <span className="font-semibold">{item.account_name}</span>{" "}
                      version.
                    </span>
                  )}
                </motion.p>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
