import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#F1EFE8] p-6">
      <form className="grid w-full max-w-sm gap-3 rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-semibold">Create your Flowsign account</h1>
        <Input name="name" placeholder="Full name" />
        <Input name="email" placeholder="Email" type="email" />
        <Input name="password" placeholder="Password" type="password" />
        <Button type="submit">Sign up</Button>
      </form>
    </main>
  )
}
