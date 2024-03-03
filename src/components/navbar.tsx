import React from "react";
import MaxWidthWrapper from "./maxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";

export default function Navbar() {
  return (
    <div className="sticky h-14 top-0 inset-x-0 w-full bg-white/75 transition-all border-b border-gray-200 backdrop-blur-lg z-30">
      <MaxWidthWrapper>
        <div className="flex flex-row items-center justify-between h-14 border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold capitalize">
            Scriptify
          </Link>
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >pricing</Link>
            <LoginLink
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >Login</LoginLink>
            <RegisterLink
              className={buttonVariants({
                size: "sm",
              })}
            >Get started</RegisterLink>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
