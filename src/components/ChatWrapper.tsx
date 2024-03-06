"use client";
import React, { useState } from "react";
import Messages from "./chat/Messages";
import ChatInput from "./chat/ChatInput";
import { trpc } from "@/app/_trpc/trpcClient";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ChatContextProvider } from "./chat/ChatContextProvider";

export default function ChatWrapper({ fileId }: { fileId: string }) {
  const [isFetch, setisFetch] = useState(true);

  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
  );

  if (isLoading) {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-center flex flex-col mb-28">
          <div className="flex flex-col justify-between gap-2 items-center">
            <Loader2 className="w-8 h-8  text-blue-500 animate-spin" />
            <p className="text-lg text-zinc-900">Loading...</p>
            <p className="text-sm text-zinc-700">setting up your PDF file.</p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }

  if (data?.status === "PROCESSING") {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-center flex flex-col mb-28">
          <div className="flex flex-col justify-between gap-2 items-center">
            <Loader2 className="w-8 h-8  text-blue-500 animate-spin" />
            <p className="text-lg text-zinc-900">Proccessing...</p>
            <p className="text-sm text-zinc-700">
              We&apos;re preparing your PDF file.
            </p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }

  if (data?.status === "FAILED") {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-center flex flex-col mb-28">
          <div className="flex flex-col justify-between gap-2 items-center">
            <XCircle className="w-8 h-8 text-red-500" />
            <p className="text-lg text-zinc-900">To many pages in a PDF.</p>
            <p className="text-sm text-zinc-700 max-w-prose">
              Your <span className="font-medium">FREE</span> plan does not
              support more than 5pages of per PDF file.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              back
            </Link>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }
  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  );
}
