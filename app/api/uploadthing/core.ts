import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/auth-options";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const token = getServerSession(nextAuthOptions);
      if (!token) throw new UploadThingError("Unauthorized");
      return { token };
    })
    .onUploadComplete(async ({ file }) => {
      return file;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
