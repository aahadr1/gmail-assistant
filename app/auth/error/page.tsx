"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <CardDescription>
      {error === "AccessDenied"
        ? "You denied access to the required permissions."
        : "An error occurred during authentication."}
    </CardDescription>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
          <Suspense fallback={<CardDescription>Loading...</CardDescription>}>
            <ErrorContent />
          </Suspense>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This application requires access to your Gmail to function properly.
            Please try signing in again and grant the necessary permissions.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
