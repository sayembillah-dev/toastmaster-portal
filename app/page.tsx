import Link from "next/link";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { MeetingFormats } from "@/components/shared/MeetingFormats";
import { PublicUpcomingEvents } from "@/components/public/PublicUpcomingEvents";

const HORSEMEN = [
  { image: "/members/president.png",  role: "President",           name: "Syed Ahmad Anwar" },
  { image: "/members/vp-edu.png",     role: "VP Education",        name: "Mehrab Tanvir Prithu" },
  { image: "/members/vp-mem.png",     role: "VP Membership",       name: "Jahid Hasan" },
  { image: "/members/vp-pr.png",      role: "VP Public Relations", name: "Sayem Billah" },
  { image: "/members/secretary.png",  role: "Secretary",           name: "Rashedul Hasan" },
  { image: "/members/treasurer.png",  role: "Treasurer",           name: "Alamin Khan" },
  { image: "/members/saa.png",        role: "Sergeant at Arms",    name: "Shaon Saha" },
];

export default function HomePage() {
  return (
    <div className="bg-[#F5EEE1] text-[#2A201A]">
      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#221A13]">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", transform: "scaleX(-1)", zIndex: 0, filter: "blur(2px)", scale: "1.05" }}
        />
        {/* Warm gradient overlay for legibility + warmth */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: "linear-gradient(180deg, rgba(34,26,19,0.55) 0%, rgba(34,26,19,0.35) 40%, rgba(34,26,19,0.85) 100%)" }}
        />

        <PublicNavbar />

        <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pt-32 pb-10 md:px-16">
          <div className="flex flex-1 flex-col items-start justify-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-white/75 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0A458]" />
                Open to new members
              </div>

              {/* Heading — serif, warm, mixed case */}
              <h1 className="mb-6 font-serif text-5xl leading-[1.05] text-white md:text-6xl lg:text-7xl">
                A place to find your voice — with patience, warmth, and a room that&apos;s rooting for you.
              </h1>

              <p className="mb-9 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
                We&apos;re a Toastmasters club for anyone who wants to speak with more confidence and lead with more clarity. No experience needed — just curiosity.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 rounded-full bg-[#9E1D06] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#83180a]"
                >
                  Visit as a guest
                  <span aria-hidden>↗</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
                >
                  Our story
                </Link>
              </div>
            </div>

            {/* Collaborative logo lockup */}
            <div className="flex shrink-0 items-center gap-10 rounded-3xl bg-white px-14 py-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nifty.svg" alt="Nifty" className="h-24 w-auto" />
              <span aria-hidden className="h-20 w-px bg-[#2A201A]/15" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tm.png" alt="Toastmasters" className="h-36 w-auto" />
            </div>
          </div>

          {/* Editorial flourish */}
          <p className="mt-16 select-none font-serif text-[clamp(3.5rem,13vw,12rem)] italic leading-none text-white/15">
            fearless.
          </p>
        </div>
      </section>

      {/* ── Statement + Stats ── */}
      <section className="px-6 py-24 md:px-16 md:py-32">
        <div className="mb-16 max-w-4xl">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#9E1D06]">Why we gather</p>
          <h2 className="font-serif text-4xl leading-[1.12] md:text-5xl lg:text-6xl">
            Speaking well isn&apos;t a talent you&apos;re born with.{" "}
            <span className="text-[#2A201A]/50">
              It&apos;s a skill you practice, in good company, one meeting at a time.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { stat: "10+", label: "Members", note: "A friendly, growing community" },
            { stat: "4×", label: "Every month", note: "Regular meetings, gentle pace" },
            { stat: "+80%", label: "Avg. growth", note: "In confidence, member-reported" },
          ].map(({ stat, label, note }) => (
            <div
              key={label}
              className="flex flex-col gap-6 rounded-3xl border border-[#E7DAC6] bg-[#FBF6EC] p-7"
            >
              <span className="font-serif text-6xl text-[#9E1D06]">{stat}</span>
              <div>
                <p className="text-sm font-medium text-[#2A201A]">{label}</p>
                <p className="mt-1 text-sm text-[#7B6B5C]">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Committee ── */}
      <section id="committee" className="bg-[#221A13] px-6 py-20 md:px-16 md:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#E0A458]">The people who keep us running</p>
            <h2 className="font-serif text-4xl leading-tight text-white md:text-5xl">
              Meet the seven horsemen
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/50">
            The volunteers behind every meeting — welcoming guests, mentoring speakers, and keeping the club warm.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {HORSEMEN.map(({ image, role, name }) => (
            <div
              key={role}
              className="group relative aspect-3/4 overflow-hidden rounded-2xl bg-[#2E251C] ring-1 ring-white/10 transition-all duration-300 hover:ring-[#E0A458]/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* gradient scrim */}
              <div className="absolute inset-0 bg-linear-to-t from-[#160F09] via-[#160F09]/25 to-transparent" />
              {/* label */}
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="mb-0.5 text-[10px] uppercase tracking-[0.15em] text-[#E0A458]">{role}</p>
                <p className="font-serif text-base leading-tight text-white">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Inside a Meeting ── */}
      <section className="px-6 py-24 md:px-16 md:py-32">
        <div className="mb-16 max-w-2xl">
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#9E1D06]">Inside a meeting</p>
          <h2 className="mb-5 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
            Three simple parts, every time
          </h2>
          <p className="text-lg leading-relaxed text-[#7B6B5C]">
            Meetings follow the same gentle rhythm, so you always know what to expect. Each part builds a different speaking muscle.
          </p>
        </div>

        <MeetingFormats />
      </section>

      {/* ── Find us ── */}
      <section className="bg-[#221A13] px-6 py-24 md:px-16 md:py-32">
        <div className="mb-16 max-w-2xl">
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#E0A458]">Find us</p>
          <h2 className="mb-5 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
            Come visit in person
          </h2>
          <p className="text-lg leading-relaxed text-white/60">
            We conduct our meeting in our own dedicated space, the core convinient area beside Kawranbazar Metro. The accesibility is top notch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Map */}
          <div className="overflow-hidden rounded-3xl border border-white/10 lg:col-span-2">
            <iframe
              title="Nifty Toastmasters Club location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.861488045137!2d90.38957027616584!3d23.752318278669097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b970cd6e3ffd%3A0x9a4eff3847147b23!2sNifty%20Toastmasters%20Club!5e0!3m2!1sen!2sbd!4v1782193880159!5m2!1sen!2sbd"
              className="h-80 w-full md:h-112.5"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#FBF6EC] p-8 text-center">
            <p className="font-serif text-2xl">Or scan this</p>
            <a
              href="https://maps.app.goo.gl/QSYDdKRsGKYSPKaf7"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white p-5 transition-transform hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/location-qr.svg" alt="QR code linking to the club location" className="h-44 w-44" />
            </a>
            <p className="max-w-56 text-sm text-[#7B6B5C]">
              Point your camera here to open the location in Google Maps.
            </p>
          </div>
        </div>
      </section>

      {/* ── Join ── */}
      <section className="bg-[#9E1D06] px-6 py-24 md:px-16 md:py-32">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Upcoming events */}
          <div className="w-full max-w-xl shrink-0 rounded-3xl bg-[#F5EEE1] p-6 md:p-8">
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#9E1D06]">Upcoming meetings</p>
            <PublicUpcomingEvents />
          </div>

          {/* Copy */}
          <div className="max-w-xl">
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">You&apos;re welcome here</p>
            <h2 className="font-serif text-5xl leading-[1.05] text-white md:text-6xl lg:text-7xl">
              Come for a meeting. Stay for the people.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
              Guests are always welcome — no commitment, no cost to visit. Sit in, watch how it works, and speak only when you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5EEE1] px-6 py-3 text-sm font-medium text-[#221A13] transition-colors hover:bg-white"
              >
                Be a guest
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/60"
              >
                Become a member
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
