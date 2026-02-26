import { MagicLinkAuthForm } from "@/components/auth/MagicLinkAuthForm";

interface AuthPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const nextPath = params.next || "/iniciacion";

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="absolute inset-0 aura-veil" />
      <MagicLinkAuthForm nextPath={nextPath} />
    </main>
  );
}

