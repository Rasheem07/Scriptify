"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/trpcClient";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { error } from "console";

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const {data} = trpc.authCallback.useQuery();

  if(data?.success){
    redirect('/dashboard')
  }

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
