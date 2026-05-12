import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <form className="grid w-full max-w-sm gap-3">
        <h1 className="text-2xl font-semibold">FlowSign</h1>
        <Input name="email" placeholder="Email" type="email" />
        <Input name="password" placeholder="Password" type="password" />
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  )
}
