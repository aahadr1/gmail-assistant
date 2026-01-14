import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Gmail AI Assistant</h1>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline">
              Chat
            </Link>
            <Link href="/mail/search" className="text-sm hover:underline">
              Search
            </Link>
            <Link href="/settings" className="text-sm hover:underline">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
