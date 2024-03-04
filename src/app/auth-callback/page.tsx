"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/trpcClient";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const AuthCallback = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  
  try {
    const {data} = trpc.authCallback.useQuery();
    
    if(data?.success){
      router.push(origin ? `/${origin}` : '/dashboard');
    }
    } catch (error) {
      if((error as any).data?.code === "UNAUTHORIZED"){
        router.push('/sign-in');
      }
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

export default function Page() {
  return(
    <Suspense>
      <AuthCallback />
    </Suspense>
  )
};