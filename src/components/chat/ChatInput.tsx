import React, { useContext, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { ChatContext } from "./ChatContextProvider";

export default function ChatInput({isDisabled}: {isDisabled?: boolean}) {

  const { message,addMessage, handleInputChange, isLoading} = useContext(ChatContext);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="absolute bottom-0 left-0 right-0">
      <div className="mx-2 flex gap-3 flex-col md:mx-4 md:mb-4 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="flex md:flex-col items-stretch h-full flex-1 relative">
          <div className="flex flex-col p-4 w-full relative flex-grow">
            <div className="relative">
              <Textarea
                ref={textAreaRef}
                rows={1}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey){
                    e.preventDefault();

                    addMessage();
                      
                    textAreaRef.current?.focus();
                  }
                }}
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />
              <Button className="absolute bottom-1.5 right-[8px]" ref={buttonRef} aria-labl="send message" disabled={isLoading || isDisabled} type="submit" onClick={(e) => {
                e.preventDefault();

                addMessage();

                buttonRef.current?.focus();
              }}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
