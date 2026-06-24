import { PublicNavbar } from "@/components/shared/PublicNavbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      {children}
    </div>
  );
}
