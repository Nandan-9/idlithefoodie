import Image from "next/image";
import Link from "next/link";

type ErrorScreenProps = {
  code?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export default function ErrorScreen({
  code = "Oops",
  title = "Something went wrong",
  message = "An unexpected error occurred. Try again, or head back home.",
  onRetry,
}: ErrorScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#141216] px-6 text-center text-white">
      <Image
        src="/asset2/mascote.png"
        alt="Idlie Mascot"
        width={120}
        height={120}
        priority
        className="object-contain"
      />

      <p className="mt-6 font-mono text-6xl font-bold tracking-tight text-white/20 sm:text-7xl">
        {code}
      </p>
      <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-md text-sm text-white/60">{message}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#141216] transition hover:bg-white/90"
          >
            Try again
          </button>
        )}
        <Link
          href="/"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Back home
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
