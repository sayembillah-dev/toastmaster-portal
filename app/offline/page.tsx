import Image from "next/image";

export const metadata = {
  title: "Offline | NTC",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Image src="/tm-logo.png" alt="NTC Toastmasters" width={96} height={84} priority />
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-muted-foreground">
        NTC needs an internet connection. Check your connection and try again.
      </p>
      <a
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Retry
      </a>
    </main>
  );
}
