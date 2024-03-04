"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/trpcClient";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  
  const fetchData = async () => {
    try {
      const { data } = await trpc.authCallback.useQuery();
      
      if (data?.success) {
        router.push(origin ? `/${origin}` : '/dashboard');
      } else {
        // Handle unexpected response
        console.error("Unexpected response from server:", data);
        router.push('/sign-in');
      }
    } catch (error) {
      // Handle network error or any other unexpected error
      console.error("Error fetching data:", error);
      if ((error as any).data?.code === "UNAUTHORIZED") {
        router.push('/sign-in');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch data once on component mount

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
