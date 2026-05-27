import { Suspense } from "react";
import SignupForm from "@/components/auth-ui/signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full">
      <Suspense>
        <SignupForm />
      </Suspense>
    </main>
  );
}
