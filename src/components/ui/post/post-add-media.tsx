"use client";

import * as React from "react";
import { filter, findIndex, minBy } from "lodash";
import { usePostVersions } from "@/hooks/use-post-versions";
import { AddMedia } from "@/components/ui/media/add-media";
import { PhotoIcon } from "@/components/ui/icons/photo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePostContext } from "@/hooks/use-post-context";

interface PostAddMediaProps {
  selectedAccounts: Array<{
    id: number;
    name: string;
    provider: string;
    provider_options: {
      media_limit: {
        photos: number;
        videos: number;
        gifs: number;
        allow_mixing: number;
      };
    };
  }>;
  versions: Array<{
    account_id: number;
    content: Array<{
      media: Array<any>;
    }>;
  }>;
  activeVersion: number;
  media: Array<{
    type: string;
  }>;
  onInsert: (media: any) => void;
}

interface MediaLimit {
  provider: string;
  count: number;
}

interface MediaLimitData {
  account_id: number;
  account_name: string | null;
  photos: {
    provider: string;
    limit: number;
    hit: boolean;
  };
  videos: {
    provider: string;
    limit: number;
    hit: boolean;
  };
  gifs: {
    provider: string;
    limit: number;
    hit: boolean;
  };
  mixing: {
    provider: string;
    hit: boolean;
  };
}

export function PostAddMedia({
  selectedAccounts,
  versions,
  activeVersion,
  media,
  onInsert,
}: PostAddMediaProps) {
  const { accountHasVersion } = usePostVersions();
  const postCtx = usePostContext();

  const accountsWithoutVersion = React.useMemo(() => {
    return selectedAccounts.filter(
      (account) => !accountHasVersion(versions, account.id)
    );
  }, [selectedAccounts, versions, accountHasVersion]);

  const getMinLimit = (type: string): MediaLimit => {
    const item = minBy(
      accountsWithoutVersion,
      `provider_options.media_limit.${type}`
    );
    if (!item) {
      throw new Error("No accounts without version found");
    }
    return {
      provider: item.provider,
      count: item.provider_options.media_limit[type as keyof typeof item.provider_options.media_limit],
    };
  };

  const getLimit = (version: number | null) => {
    // Original version
    if (version === null || version === 0) {
      if (!accountsWithoutVersion.length) {
        return null;
      }

      return {
        photos: getMinLimit("photos"),
        videos: getMinLimit("videos"),
        gifs: getMinLimit("gifs"),
        allow_mixing: getMinLimit("allow_mixing"),
      };
    }

    // Account version
    const indexAccount = findIndex(selectedAccounts, { id: version });

    if (indexAccount !== -1) {
      const account = selectedAccounts[indexAccount];
      const accountMediaLimit = account.provider_options.media_limit;

      return {
        photos: {
          provider: account.provider,
          count: accountMediaLimit.photos,
        },
        videos: {
          provider: account.provider,
          count: accountMediaLimit.videos,
        },
        gifs: {
          provider: account.provider,
          count: accountMediaLimit.gifs,
        },
        allow_mixing: {
          provider: account.provider,
          count: accountMediaLimit.allow_mixing,
        },
      };
    }

    return null;
  };

  const getAccountName = (version: number): string | null => {
    const item = selectedAccounts.find((account) => account.id === version);
    return item ? item.name : null;
  };

  const isAccountSelected = (accountId: number): boolean => {
    return selectedAccounts.map((account) => account.id).includes(accountId);
  };

  const getEnabledVersions = () => {
    return filter(versions, (version) => {
      // Original version is always enabled
      if (version.account_id === 0) {
        return true;
      }
      return isAccountSelected(version.account_id);
    });
  };

  const isMediaTypeMixing = (obj: Record<string, number>): boolean => {
    const values = Object.values(obj);
    const nonZeroValues = values.filter((value) => value !== 0);
    if (nonZeroValues.length === 0) {
      return false;
    }
    return nonZeroValues.length !== 1;
  };

  const getMediaLength = (media: Array<{ type: string }>) => {
    const byType = {
      photos: filter(media, { type: "image" }).length,
      videos: filter(media, { type: "video" }).length,
      gifs: filter(media, { type: "gif" }).length,
    };

    return {
      ...byType,
      mixing: isMediaTypeMixing(byType),
    };
  };

  const pushLimit = (data: MediaLimitData) => {
    if (!postCtx) return;

    const index = postCtx.mediaLimit.findIndex(
      (object) => object.account_id === data.account_id
    );

    if (index !== -1) {
      const newMediaLimit = [...postCtx.mediaLimit];
      newMediaLimit[index] = data;
      postCtx.setMediaLimit(newMediaLimit);
    } else {
      postCtx.setMediaLimit([...postCtx.mediaLimit, data]);
    }
  };

  const removeAllLimits = () => {
    if (postCtx) {
      postCtx.setMediaLimit([]);
    }
  };

  const initLimits = () => {
    getEnabledVersions().forEach((version) => {
      const limit = getLimit(version.account_id);

      if (!limit) {
        return;
      }

      const mediaUsed = getMediaLength(version.content[0].media);

      pushLimit({
        account_id: version.account_id,
        account_name: getAccountName(version.account_id),
        photos: {
          provider: limit.photos.provider,
          limit: limit.photos.count,
          hit: mediaUsed.photos > limit.photos.count,
        },
        videos: {
          provider: limit.videos.provider,
          limit: limit.videos.count,
          hit: mediaUsed.videos > limit.videos.count,
        },
        gifs: {
          provider: limit.gifs.provider,
          limit: limit.gifs.count,
          hit: mediaUsed.gifs > limit.gifs.count,
        },
        mixing: {
          provider: limit.allow_mixing.provider,
          hit: mediaUsed.mixing && !limit.allow_mixing.count,
        },
      });
    });
  };

  const limitActiveVersion = React.useMemo(
    () => getLimit(activeVersion),
    [activeVersion]
  );

  const mediaUsedActiveVersion = React.useMemo(
    () => getMediaLength(media),
    [media]
  );

  React.useEffect(() => {
    if (!limitActiveVersion) return;

    const mediaUsed = mediaUsedActiveVersion;

    pushLimit({
      account_id: activeVersion,
      account_name: getAccountName(activeVersion),
      photos: {
        provider: limitActiveVersion.photos.provider,
        limit: limitActiveVersion.photos.count,
        hit: mediaUsed.photos > limitActiveVersion.photos.count,
      },
      videos: {
        provider: limitActiveVersion.videos.provider,
        limit: limitActiveVersion.videos.count,
        hit: mediaUsed.videos > limitActiveVersion.videos.count,
      },
      gifs: {
        provider: limitActiveVersion.gifs.provider,
        limit: limitActiveVersion.gifs.count,
        hit: mediaUsed.gifs > limitActiveVersion.gifs.count,
      },
      mixing: {
        provider: limitActiveVersion.allow_mixing.provider,
        hit: mediaUsed.mixing && !limitActiveVersion.allow_mixing.count,
      },
    });
  }, [mediaUsedActiveVersion, limitActiveVersion]);

  React.useEffect(() => {
    removeAllLimits();
    initLimits();
  }, [versions.length, selectedAccounts]);

  React.useEffect(() => {
    initLimits();
  }, []);

  return (
    <AddMedia onInsert={onInsert}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-stone-800 hover:text-indigo-500 transition-colors ease-in-out duration-200"
            >
              <PhotoIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Media</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </AddMedia>
  );
}
