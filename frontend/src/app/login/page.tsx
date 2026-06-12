import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { googleAuthUrl } from "@/lib/api/user";


export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-8 px-4 md:px-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-h2 text-foreground font-bold text-center">
          WELCOME TO YOUR FREELANCE TAX MANAGER
        </h1>
        <p className="text-caption text-muted-foreground text-center max-w-xs">
          Track your income, manage clients, and stay on top of your tax obligations - all in one place.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <Button
          asChild
          variant="outline"
          className="w-full h-11 cursor-pointer gap-2 border-[1.5px] border-foreground"
        >
          <a href={googleAuthUrl}>
            <FcGoogle className="size-5 shrink-0" />
            Sign in with Google
          </a>
        </Button>
        <p className="text-caption text-muted-foreground text-center">
          Your data is private and never shared.
        </p>
      </div>
    </main>
  );
}