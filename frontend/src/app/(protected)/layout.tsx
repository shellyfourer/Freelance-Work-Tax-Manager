import { AuthProvider } from "@/context/AuthContext";
import { AppNav } from "@/components/AppNav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppNav />
      {children}
    </AuthProvider>
  );
}
