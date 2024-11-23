"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { usePost } from "@/hooks/use-post";
import { useNotifications } from "@/hooks/use-notifications";
import { useSettings } from "@/hooks/use-settings";
import { usePostContext } from "@/hooks/use-post-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PickTime } from "@/components/ui/pick-time";
import { PostTags } from "@/components/ui/post/post-tags";
import { Badge } from "@/components/ui/badge";
import { ProviderIcon } from "@/components/ui/account/provider-icon";
import { CalendarIcon } from "@/components/ui/icons/calendar";
import { PaperAirplaneIcon } from "@/components/ui/icons/paper-airplane";
import { XIcon } from "@/components/ui/icons/x";

interface PostActionsProps {
  form: {
    accounts: number[];
    tags: string[];
    date: string;
    time: string;
  };
  accounts: Array<{
    id: number;
    name: string;
    provider: string;
  }>;
}

export function PostActions({ form, accounts }: PostActionsProps) {
  const router = useRouter();
  const { postId, editAllowed, accountsHitTextLimit, accountsHitMediaLimit } =
    usePost();
  const postCtx = usePostContext();
  const [timePickerOpen, setTimePickerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationPostNow, setConfirmationPostNow] = React.useState(false);
  const { timeFormat, weekStartsOn } = useSettings();
  const { notify } = useNotifications();

  const scheduleTime = React.useMemo(() => {
    if (form.date && form.time) {
      return format(
        parseISO(`${form.date} ${form.time}`),
        `E, MMM do, 'at' ${timeFormat === 24 ? "kk:mm" : "h:mmaaa"}`,
        {
          weekStartsOn,
        }
      );
    }
    return null;
  }, [form.date, form.time, timeFormat, weekStartsOn]);

  const clearScheduleTime = () => {
    form.date = "";
    form.time = "";
  };

  const canSchedule = React.useMemo(() => {
    return (
      postId &&
      form.accounts.length > 0 &&
      editAllowed &&
      accountsHitTextLimit.length === 0 &&
      accountsHitMediaLimit.length === 0
    );
  }, [
    postId,
    form.accounts.length,
    editAllowed,
    accountsHitTextLimit,
    accountsHitMediaLimit,
  ]);

  const handleValidationError = (error: any) => {
    if (error.response.status !== 422) {
      notify("error", error.response.data.message);
      return;
    }

    const validationErrors = error.response.data.errors;
    const mustRefreshPage =
      "in_history" in validationErrors || "publishing" in validationErrors;

    if (!mustRefreshPage) {
      notify("error", validationErrors);
    }

    if (mustRefreshPage) {
      router.push(`/posts/${postId}/edit`);
    }
  };

  const schedule = async (postNow = false) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/posts/${postId}/schedule`, {
        postNow,
      });

      notify("success", response.data, {
        name: "View in calendar",
        href: `/calendar?date=${form.date}`,
      });

      router.push("/posts");
    } catch (error: any) {
      handleValidationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccounts = React.useMemo(() => {
    return accounts.filter((account) => form.accounts.includes(account.id));
  }, [accounts, form.accounts]);

  return (
    <div className="w-full flex items-center justify-end bg-stone-500 border-t border-gray-200 z-10">
      <div className="py-4 flex items-center space-x-2 px-4">
        <PostTags
          items={form.tags}
          onUpdate={(tags) => {
            form.tags = tags;
          }}
        />

        <div className="flex items-center" role="group">
          <Button
            variant="secondary"
            size="sm"
            className={`${
              scheduleTime
                ? "!normal-case border-r-indigo-800 rounded-r-none"
                : !canSchedule
                ? "!rounded-r-lg"
                : ""
            }`}
            onClick={() => setTimePickerOpen(true)}
          >
            <CalendarIcon className="sm:mr-2" />
            <span className="hidden sm:block">
              {scheduleTime ? scheduleTime : "Pick time"}
            </span>
          </Button>

          {scheduleTime && canSchedule && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearScheduleTime}
              title="Clear time"
              className="rounded-l-none border-l-0 hover:text-red-500 !px-2"
            >
              <XIcon />
            </Button>
          )}

          <PickTime
            open={timePickerOpen}
            date={form.date}
            time={form.time}
            isSubmitActive={editAllowed}
            onClose={() => setTimePickerOpen(false)}
            onUpdate={(date, time) => {
              form.date = date;
              form.time = time;
            }}
          />
        </div>

        {editAllowed && (
          <Button
            onClick={() =>
              scheduleTime ? schedule() : setConfirmationPostNow(true)
            }
            disabled={!canSchedule || isLoading}
            isLoading={isLoading}
            size="sm"
          >
            <PaperAirplaneIcon className="mr-2" />
            {scheduleTime ? "Schedule" : "Post now"}
          </Button>
        )}
      </div>

      <Dialog open={confirmationPostNow} onOpenChange={setConfirmationPostNow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm publication</DialogTitle>
            <DialogDescription>
              This post will be immediately published to the following social
              accounts. Are you sure?
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {selectedAccounts.map((account) => (
                  <Badge key={account.id}>
                    <ProviderIcon
                      provider={account.provider}
                      className="!w-4 !h-4 mr-2"
                    />
                    {account.name}
                  </Badge>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmationPostNow(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => schedule(true)}
            >
              Post now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
