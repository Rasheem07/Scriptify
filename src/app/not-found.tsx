import React from "react";
import MaxWidthWrapper from "@/components/maxWidthWrapper";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh - 56px)] w-full bg-white/75 backdrop-blur-md transition-all flex flex-col items-center pt-32 sm:pt-56 grainy">
      <MaxWidthWrapper className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-semibold text-black/75">
            Page not found!
          </h2>
          <Link
            href="/"
            className="underline underline-offset-2 text-blue-600 hover:text-blue-400 text-[16px] font-sans"
          >
            back to home
          </Link>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
