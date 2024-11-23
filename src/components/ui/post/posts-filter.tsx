"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag } from "@/components/ui/data-display/tag";
import { ProviderIcon } from "@/components/ui/account/provider-icon";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

interface PostsFilterProps {
  value: {
    keyword: string;
    tags: number[];
    accounts: number[];
  };
  onChange: (value: PostsFilterProps["value"]) => void;
  className?: string;
}

interface Account {
  id: number;
  name: string;
  provider: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

export function PostsFilter({ value, onChange, className }: PostsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // In a real app, these would come from your data fetching library
  // For now, we'll use dummy data
  const accounts = React.useMemo<Account[]>(
    () => [
      { id: 1, name: "Account 1", provider: "twitter" },
      { id: 2, name: "Account 2", provider: "facebook" },
    ],
    []
  );

  const tags = React.useMemo<Tag[]>(
    () => [
      { id: 1, name: "Tag 1", color: "#ff0000" },
      { id: 2, name: "Tag 2", color: "#00ff00" },
    ],
    []
  );

  const total = value.tags.length + value.accounts.length;

  const handleClear = () => {
    onChange({
      keyword: "",
      tags: [],
      accounts: [],
    });
  };

  const handleKeywordChange = (newKeyword: string) => {
    onChange({
      ...value,
      keyword: newKeyword,
    });
  };

  const handleTagToggle = (tagId: number) => {
    const newTags = value.tags.includes(tagId)
      ? value.tags.filter((id) => id !== tagId)
      : [...value.tags, tagId];

    onChange({
      ...value,
      tags: newTags,
    });
  };

  const handleAccountToggle = (accountId: number) => {
    const newAccounts = value.accounts.includes(accountId)
      ? value.accounts.filter((id) => id !== accountId)
      : [...value.accounts, accountId];

    onChange({
      ...value,
      accounts: newAccounts,
    });
  };

  return (
    <div className={cn("flex items-center", className)}>
      <SearchInput
        value={value.keyword}
        onChange={handleKeywordChange}
        className="mr-2"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Filter className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline-block">
              Filters{" "}
              {total > 0 && (
                <span className="px-2 py-1 rounded-md bg-white text-black font-bold">
                  {total}
                </span>
              )}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          <div className="p-2 border-b">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleClear}
            >
              Clear filter
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            {tags.length > 0 && (
              <div className="p-2">
                <div className="font-semibold">Labels</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center cursor-pointer"
                    >
                      <Checkbox
                        checked={value.tags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                        className="mr-1"
                      />
                      <Tag item={tag} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2 mt-2">
              <div className="font-semibold">Accounts</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {accounts.map((account) => (
                  <label
                    key={account.id}
                    className="flex items-center cursor-pointer"
                  >
                    <Checkbox
                      checked={value.accounts.includes(account.id)}
                      onCheckedChange={() => handleAccountToggle(account.id)}
                      className="mr-1"
                    />
                    <Badge variant="secondary">
                      <ProviderIcon
                        provider={account.provider}
                        className="w-4 h-4 mr-2"
                      />
                      {account.name}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
