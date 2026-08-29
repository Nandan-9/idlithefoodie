"use client";

import { useEffect } from "react";
import ErrorScreen from "@/components/error/ErrorScreen";

export default function Error({
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
    <ErrorScreen
      code="Error"
      title="Something went wrong"
      message="An unexpected error occurred. Try again, or head back home."
      onRetry={() => unstable_retry()}
    />
  );
}
