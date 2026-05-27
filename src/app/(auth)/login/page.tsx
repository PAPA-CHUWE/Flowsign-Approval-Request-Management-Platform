import { Suspense } from "react"
import LoginForm from "@/components/auth-ui/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full">
      <Suspense fallback={<div className="min-h-screen w-full bg-[#F1EFE8]" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
