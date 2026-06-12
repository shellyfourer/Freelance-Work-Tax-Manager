"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api/user";
import type { User } from "@/lib/types/user";

/*
create context is React's way of making a global variable
we could make a module-level variable,
but it will not update automatically when the user changes
createContext allows React components to re-render
when there is an update to the user
*/

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user) {
          router.push("/login");
          return;
        }
        if (!user.setupComplete) {
          router.push("/onboarding");
          return;
        }
        setUser(user);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, []);

  return (
    //AuthContext.Provider is generated auto when we call CreateContext
    <AuthContext.Provider value={{ user, isLoading }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
