import { db } from "@/database";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { MessageBodyValidator } from "@/lib/validators/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import {OpenAIStream, StreamingTextResponse} from 'ai';

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const userId = user?.id;

  if (!userId || !user) {
    return new Response("UNAUTHORIZED", { status: 401 });
  }

  const { fileId, message } = MessageBodyValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: userId,
    },
  });

  if (!file) return new Response("NOT FOUND", { status: 404 });

  await db.message.create({
    data: {
      fileId,
      message,
      userId,
      isUserMessage: true,
    },
  });

  //vectorise messages

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pinecone.Index("scriptify"),
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const getMessages = await db.message.findMany({
    where: {
      fileId: fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = getMessages.map((message) => ({
    role: !message.isUserMessage ? ("assistant" as const) : ("user" as const),
    content: message.message,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
          if (message.role === "user") return `User: ${message.content}\n`;
          return `Assistant: ${message.content}\n`;
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}
        
        USER INPUT: ${message}`,
      },
    ],
  });

  const stream = await OpenAIStream(response, {
    async onCompletion(message) {
        await db.message.create({
            data: {
                message: message,
                isUserMessage: false,
                userId: userId,
                fileId: fileId
            }
        })
    }
  })

 return new StreamingTextResponse(stream);
};
