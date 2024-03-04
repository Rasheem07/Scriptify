"use client";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Cloud, File } from "lucide-react";
import Dropzone from "react-dropzone";
import { Progress } from "./ui/progress";
import { resolve } from "path";

export default function UploadButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    return interval;
  };
  const FileDropZone = () => {
    return (
      <Dropzone
        multiple={false}
        onDrop={async () => {
          setIsUploading(true);

          const progressInterval = startSimulatedProgress();

          await new Promise((resolve, reject) => setTimeout(resolve, 3000))
          clearInterval(progressInterval);

          setUploadProgress(100);
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <div
            {...getRootProps()}
            className="m-4 flex h-64 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex items-center justify-center h-full w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col justify-center items-center w-full h-full rounded-lg"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Cloud className="h-4 w-4 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-700 mb-2">
                    <span className="font-semibold">click to upload</span> or
                    drag and drop.
                  </p>
                  <p className="text-xs text-zinc-500">PDF (upto 4MB)</p>
                </div>
                
                {acceptedFiles && acceptedFiles[0] ? (
                  <div className="flex flex-row items-center rounded-md divide-x divide-zinc-200 outline outline-1 outline-zinc-300 max-w-xs bg-white overflow-hidden">
                    <div className="py-2 px-3 h-full grid place-items-center">
                      <File className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="py-2 px-3 truncate h-full text-sm">
                      {acceptedFiles[0].name}
                    </div>
                  </div>
                ) : null}

                {isUploading ? (
                  <div className="mx-auto w-full mt-4 max-w-xs">
                    <Progress value={uploadProgress} className="w-full h-1 bg-zinc-200"/>
                  </div>
                ) : null}
              </label>
            </div>
          </div>
        )}
      </Dropzone>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>upload file</Button>
      </DialogTrigger>
      <DialogContent>
        <FileDropZone />
      </DialogContent>
    </Dialog>
  );
}
