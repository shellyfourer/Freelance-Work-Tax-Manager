"use client";
import { redirectToGoogleAuth } from "@/lib/api/user";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 md:px-8">
          <h1 className="text-h2 text-foreground font-bold text-center">
              WELCOME TO YOUR FREELANCE WORK MANAGER
          </h1>
      <Button onClick={redirectToGoogleAuth} className="cursor-pointer h-11 px-6">
        SIGN UP WITH GOOGLE
      </Button>
    </div>
  );
}
