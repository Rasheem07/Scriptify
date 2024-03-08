import { trpc } from "@/app/_trpc/trpcClient";
import { limit } from "@/config/use_infinite_query";
import { keepPreviousData } from "@tanstack/react-query";
import { Loader2, MessagesSquare } from "lucide-react";
import React, { useContext } from "react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { ChatContext } from "./ChatContextProvider";

export default function Messages({fileId}: {fileId: string}) {
  const {isLoading: isAIthinking} = useContext(ChatContext);

  const { data, isLoading } = trpc.getFileMessages.useInfiniteQuery(
    {
      fileId: fileId,
      limit: limit,
    },
    {
      getNextPageParam: (data) => data?.nextCursor,
    }
  );

  const Messages = data?.pages.flatMap((page) => page.messages);

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    message: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };

  const combinedMessages = [
    ...(isAIthinking ? [loadingMessage] : []),
    ...(Messages ?? []),
  ];
  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
       combinedMessages.map((message, i) => {
        const isNextMessageSamePerson =
          combinedMessages[i - 1]?.isUserMessage ===
          combinedMessages[i]?.isUserMessage

        if (i === combinedMessages.length - 1) {
          return (
            <Message
            key={message.id}
            isNextMessageSamePerson={isNextMessageSamePerson}
            message={message}
            />
          )
        } else
          return (
            <Message
            key={message.id}
            isNextMessageSamePerson={isNextMessageSamePerson}
            message={message}
            />
          )
      })
      ) : isLoading ? (
        <div className="flex flex-col flex-1 w-full gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full items-center justify-center gap-2">
          <MessagesSquare className="h-8 w-8 text-blue-500"/>
          <h3 className="text-xl font-semibold">you&apos;re all set to go.</h3>
          <p className="text-sm text-zinc-500">you can start a conversation by sending message right away.</p>
        </div>
      )}
    </div>
  );
}
