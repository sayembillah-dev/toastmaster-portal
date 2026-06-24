import Link from "next/link";

const NAV_LINKS = [
  { label: "ABOUT", href: "/about" },
  { label: "MEMBERS", href: "/#committee" },
  { label: "MEETINGS", href: "/meetings" },
  { label: "JOIN ↗", href: "/join" },
];

export function PublicNavbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5 md:px-16">
      <Link href="/" className="text-sm font-bold tracking-widest text-white uppercase select-none">
        Nifty Toastmasters Club.
      </Link>

      <nav className="flex items-center gap-8">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-xs font-semibold tracking-widest text-white/60 uppercase transition-colors hover:text-white"
          >
            {label}
          </Link>
        ))}
        <Link
          href="/login"
          className="text-xs font-semibold tracking-widest text-white uppercase border border-white/40 px-4 py-1.5 rounded transition-colors hover:bg-white hover:text-black"
        >
          LOGIN
        </Link>
      </nav>
    </header>
  );
}
