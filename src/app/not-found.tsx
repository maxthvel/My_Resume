import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-display font-semibold text-gradient">This route doesn't resolve.</h1>
      <p className="max-w-md text-muted">Like any good API, I return a helpful error. The page you wanted isn't here.</p>
      <Link href="/"><Button>Back to home</Button></Link>
    </div>
  );
}
