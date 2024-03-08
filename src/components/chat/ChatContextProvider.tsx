"use client";
import { trpc } from "@/app/_trpc/trpcClient";
import { limit } from "@/config/use_infinite_query";
import { useMutation } from "@tanstack/react-query";
import React, { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};
export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: props) => {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const backupMessage = useRef("");
  const [message, setMessage] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      await response.json();

      if (!response.ok) {
        throw new Error("error sending message!");
      }
    },
    onMutate: async ({ message }) => {
        backupMessage.current = message;
        setMessage("");

      // step 1
      await utils.getFileMessages.cancel();

      // step 2
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // step 3
      utils.getFileMessages.setInfiniteData({ fileId, limit: limit }, (old) => {
        if (!old) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        let newPages = [...old.pages];

        let latestPage = newPages[0]!;

        latestPage.messages = [
          {
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
            message: message,
            isUserMessage: true,
          },
          ...latestPage.messages,
        ];

        newPages[0] = latestPage;

        return {
          ...old,
          pages: newPages,
        };
      });

      setisLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream: any) => {
      setisLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: limit },
          (data) => {
            if (!data) return { pages: [], pageParams: [] };

            let isAiResponseCreated = data.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );

            let updatedPages = data.pages.map((page) => {
              if (page === data.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      message: accResponse, // Change 'text' to 'message' if 'message' is the correct property name
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        message: accResponse, // Change 'text' to 'message' if 'message' is the correct property name
                      };
                    }
                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              return page;
            });

            return { ...data, pages: updatedPages };
          }
        );
      }
    },

    onError: (error, __, context) => {
          setMessage(backupMessage.current);

      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    onSettled: async () => {
      setMessage("")
      setisLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        message,
        addMessage,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
