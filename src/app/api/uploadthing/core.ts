import { db } from '@/database';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { pinecone } from '@/lib/pinecone'
const f = createUploadthing();

export const ourFileRouter = {
  pdfUplader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const {getUser} = getKindeServerSession();
      const user = await getUser();

      if (!user?.id || !user) throw new UploadThingError("Unauthorized");
 
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: 'PROCESSING'
        }
      })

      try {
        
        const response = await fetch(`${file.url}`);
        const blob = await response.blob();

        const loader = new PDFLoader(blob);
        const pagesLevelPDF = await loader.load();

        const pagesLength = pagesLevelPDF.length;

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(pagesLevelPDF, embeddings, {
          pineconeIndex: pinecone.Index("scriptify"),
          namespace: createdFile.id,
        })

        await db.file.update({
          where: {
            id: createdFile.id,
          },
          data: {
            uploadStatus: 'SUCCESS'
          }
        })
      } catch (error) {
        console.log("error proccessing PDF: ", error)
        await db.file.update({
          where: {
            id: createdFile.id,
          },
          data: {
            uploadStatus: 'FAILED'
          }
        })
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;