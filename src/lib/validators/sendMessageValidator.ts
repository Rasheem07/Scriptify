import { z } from "zod";

export const MessageBodyValidator = z.object({
    fileId: z.string(),
    message: z.string()
})