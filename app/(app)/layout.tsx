import { AppNav } from "@/components/shared/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <AppNav />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
