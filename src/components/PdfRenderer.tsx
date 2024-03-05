"use client";
import { Loader2, ChevronDown, ChevronUp, Type, ZoomIn, RotateCw } from "lucide-react";
import React, { useState } from "react";

import { Document, Page, pdfjs } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { z } from "zod";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "./ui/dropdown-menu";

import SimpleBar from "simplebar-react";
import FullScreenPdf from "./FullScreenPdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PdfRenderer({ url }: { url: string }) {
  const { toast } = useToast();

  const { width, ref } = useResizeDetector();

  const [totalPages, setTotalPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setrotation] = useState(0);
  const [renderedScale, setrenderedScale] = useState(1);
  const isLoading = renderedScale !== scale;
  const searchValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= totalPages!),
  });

  type searchValidatorType = z.infer<typeof searchValidator>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<searchValidatorType>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(searchValidator),
  });

  const searchSubmit = ({ page }: searchValidatorType) => {
    setCurrentPage(Number(page) - 1);
    setValue("page", String(page));
  };

  return (
    <div className="flex flex-col w-full mx-auto items-center bg-white rounded-md shadow">
      <div className="flex justify-between items-center w-full border-b border-zinc-200 px-2 h-14">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            aria-label="page previous"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : 1));
              setValue("page", String(currentPage - 1));
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  handleSubmit(searchSubmit)();
                }
              }}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{!totalPages ? "x" : totalPages!}</span>
            </p>
          </div>

          <Button
            variant="ghost"
            aria-label="page next"
            disabled={currentPage === totalPages!}
            onClick={() => {
              setCurrentPage((prev) =>
                prev + 1 === totalPages! ? totalPages! : prev + 1
              );
              setValue("page", String(currentPage + 1));
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" aria-label="zoom" className="gap-1.5">
                <ZoomIn className="h-4 w-4" />
                {scale * 100}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScale(2)}>
                200%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant='ghost' aria-label="rotation" onClick={() => setrotation(prev => prev + 90)}>
              <RotateCw className="h-4 w-4"/>
          </Button>

          <FullScreenPdf fileUrl={url} />
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen transition-all">
        <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
          <div ref={ref}>
            <Document
              loading={
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="w-6 h-6 my-24 text-zinc-900 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "failed load PDF",
                  description: "try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => {
                setTotalPages(numPages);
              }}
              file={url}
              className="max-h-full"
            >
               {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  key={'@' + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width ? width : 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                key={'@' + scale}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                  </div>
                }
                onRenderSuccess={() =>
                  setrenderedScale(scale)
                }
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}
