import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 px-4 md:px-8">
      <h1 className="text-h2 text-foreground font-bold text-center">
        WELCOME TO THE FREELANCE WORK MANAGER
      </h1>
      <Button asChild className="h-11 px-6 cursor-pointer">
        <Link href="/income">Track Income</Link>
      </Button>
    </main>
  );
}
