"use client";

import * as React from "react";
import { useEditor } from "@/hooks/use-editor";
import { Panel } from "@/components/ui/panel";
import { MastodonGallery } from "@/components/ui/provider-gallery/mastodon/mastodon-gallery";
import { EditorReadOnly } from "@/components/ui/editor-read-only";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PostPreviewMastodonProps {
  name: string;
  username: string;
  image: string;
  content: Array<{
    body: string;
    media: Array<any>;
  }>;
  className?: string;
}

export function PostPreviewMastodon({
  name,
  username,
  image,
  content,
  className,
}: PostPreviewMastodonProps) {
  const { isDocEmpty } = useEditor();
  const mainContent = content[0];

  return (
    <Panel className={cn("relative", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            <span className="inline-flex justify-center items-center flex-shrink-0 w-10 h-10 rounded-full">
              <img
                src={image}
                className="object-cover w-full h-full rounded"
                alt={`${name}'s profile`}
              />
            </span>
          </div>
          <div>
            <div className="font-medium mr-2">{name}</div>
            <div className="text-gray-400">@{username}</div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-2">
            <Image
              src="/images/social-icons/mastodon/globe.svg"
              alt="Globe"
              width={16}
              height={16}
            />
          </span>
          <span className="text-gray-400 text-sm">19h</span>
        </div>
      </div>

      <div className="w-full">
        <EditorReadOnly
          value={mainContent.body}
          className={cn(
            !isDocEmpty(mainContent.body) && "mt-2",
            mainContent.media.length > 0 && "mb-2"
          )}
        />

        <MastodonGallery media={mainContent.media} />

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/images/social-icons/mastodon/reply.svg"
              alt="Reply"
              width={20}
              height={20}
            />
            <div className="ml-2">0</div>
          </div>
          <div className="flex items-center">
            <Image
              src="/images/social-icons/mastodon/retweet.svg"
              alt="Retweet"
              width={20}
              height={20}
            />
          </div>
          <div className="flex items-center">
            <Image
              src="/images/social-icons/mastodon/star.svg"
              alt="Star"
              width={20}
              height={20}
            />
          </div>
          <div className="flex items-center">
            <Image
              src="/images/social-icons/mastodon/bookmark.svg"
              alt="Bookmark"
              width={20}
              height={20}
            />
          </div>
          <div className="flex items-center">
            <Image
              src="/images/social-icons/mastodon/ellipsis.svg"
              alt="More options"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}
