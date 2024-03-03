"use client";
import React, { useState } from "react";
import UploadButton from "./uploadButton";
import { trpc } from "@/app/_trpc/trpcClient";
import Skeleton from "react-loading-skeleton";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";

export default function Dashboard() {
  const [currentlyDeletingFile, setcurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const utils = trpc.useUtils();

  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onMutate({ id }) {
      setcurrentlyDeletingFile(id);
    },
    onSettled() {
      setcurrentlyDeletingFile(null);
    },
  });

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between sm:flex-row border-b border-gray-200 gap-4 py-2">
        <h1 className="font-bold text-5xl text-gray-900 mb-2 capitalize">
          my files
        </h1>
        <UploadButton />
      </div>
      {files && files.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 divide-y divide-zinc-200">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex flex-row justify-between items-center pt-6 px-6 space-x-6">
                    <div className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 h-10 w-10 flex-shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-medium text-zinc-900 truncate">
                          {file.name}
                        </h2>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="grid grid-cols-3 px-6 mt-4 gap-3 place-items-center py-2 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "dd MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    mocked
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    variant="destructive"
                    onClick={() => deleteFile({ id: file.id })}
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="flex flex-col items-center w-full mt-16 gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="text-xl font-semibold">pretty empty around here</h3>
          <p>let&apos;s upload your first PDF file</p>
        </div>
      )}
    </div>
  );
}
