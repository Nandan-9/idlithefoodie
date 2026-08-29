"use client";

import { useEffect } from "react";
import "./globals.css";
import ErrorScreen from "@/components/error/ErrorScreen";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <ErrorScreen
          code="Error"
          title="Something went wrong"
          message="A critical error occurred. Try again, or head back home."
          onRetry={() => unstable_retry()}
        />
      </body>
    </html>
  );
}
