'use client'
import { useMutation } from "@tanstack/react-query";
import React, { ReactNode, createContext, useState } from "react";
import { string } from "zod";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}
export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false
})

interface props {
    fileId: string,
    children: ReactNode
}

export const ChatContextProvider = ({fileId, children}: props) => {

    const [message, setMessage] = useState('');
    const [isLoading, setisLoading] = useState(false);
    
    const {mutate: sendMessage} = useMutation({
        mutationFn: async ({message}: {message: string}) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fileId,
                    message
                })
            })

            await response.json();

            if(!response.ok){
                throw new Error("error sending message!")
            }
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    const addMessage = () => sendMessage({message});

    return (
        <ChatContext.Provider value={{
            message,
            addMessage,
            handleInputChange,
            isLoading
        }}>
            {children}
        </ChatContext.Provider>
    )
}