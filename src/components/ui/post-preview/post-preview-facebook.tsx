"use client";

import * as React from "react";
import { useEditor } from "@/hooks/use-editor";
import { Panel } from "@/components/ui/panel";
import { FacebookGallery } from "@/components/ui/provider-gallery/facebook/facebook-gallery";
import { EditorReadOnly } from "@/components/ui/editor-read-only";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostPreviewFacebookProps {
  name: string;
  username: string;
  image: string;
  content: Array<{
    body: string;
    media: Array<any>;
  }>;
  className?: string;
}

const REPRESENTATIVE_DATA_TEXT =
  "This preview shows representative data. Actual metrics will be available after publishing.";

const fbIconsUrl = "/images/fb-icons.png";

export function PostPreviewFacebook({
  name,
  username,
  image,
  content,
  className,
}: PostPreviewFacebookProps) {
  const { isDocEmpty } = useEditor();
  const mainContent = content[0];

  return (
    <Panel className={cn("relative", className)}>
      <div className="flex items-center">
        <span className="inline-flex justify-center items-center flex-shrink-0 w-10 h-10 rounded-full mr-3">
          <img
            src={image}
            className="object-cover w-full h-full rounded-full"
            alt={`${name}'s profile`}
          />
        </span>
        <div className="flex flex-col">
          <div className="font-medium mr-2">{name}</div>
          <div className="text-gray-400 text-sm">19h</div>
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

        <FacebookGallery media={mainContent.media} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Image
                    src="/images/fb-like.svg"
                    alt="Like"
                    width={20}
                    height={20}
                    className="z-10"
                  />
                  <Image
                    src="/images/fb-wow.svg"
                    alt="Wow"
                    width={20}
                    height={20}
                    className="-ml-1"
                  />
                </div>
                <div className="text-gray-500">116</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{REPRESENTATIVE_DATA_TEXT}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-gray-500">0 comments</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{REPRESENTATIVE_DATA_TEXT}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mt-5 flex items-center justify-around border-t border-b border-gray-200 text-gray-500 py-2">
        <div className="flex items-center">
          <i
            style={{
              backgroundImage: `url(${fbIconsUrl})`,
              backgroundPosition: "0px -342px",
              backgroundSize: "25px 867px",
            }}
            className="inline-block w-5 h-5 bg-no-repeat"
          />
          <span className="ml-1 font-semibold">Like</span>
        </div>
        <div className="flex items-center">
          <i
            style={{
              backgroundImage: `url(${fbIconsUrl})`,
              backgroundPosition: "0px -304px",
              backgroundSize: "25px 867px",
            }}
            className="inline-block w-5 h-5 bg-no-repeat"
          />
          <span className="ml-1 font-semibold">Comment</span>
        </div>
        <div className="flex items-center">
          <i
            style={{
              backgroundImage: `url(${fbIconsUrl})`,
              backgroundPosition: "0px -361px",
              backgroundSize: "25px 867px",
            }}
            className="inline-block w-5 h-5 bg-no-repeat"
          />
          <span className="ml-1 font-semibold">Share</span>
        </div>
      </div>
    </Panel>
  );
}
