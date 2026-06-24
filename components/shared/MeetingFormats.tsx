"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type Signal = {
  light: "green" | "yellow" | "red";
  color: string;
  time: string;
  label: string;
  desc: string;
};

type MeetingFormat = {
  no: string;
  time: string;
  title: string;
  body: string;
  accent: string;
  tagline: string;
  overview: string;
  steps: { title: string; desc: string }[];
  signals: Signal[];
  overtime: string;
  practice: string[];
  tip: string;
};

const SIGNAL_COLORS = {
  green: "#6B7D5B",
  yellow: "#C2792B",
  red: "#9E1D06",
} as const;

const FORMATS: MeetingFormat[] = [
  {
    no: "01",
    time: "5–7 min",
    title: "Prepared Speeches",
    body: "A rehearsed talk from your Pathways track. You choose the goal, shape the story, and own the room for a few honest minutes.",
    accent: "#9E1D06",
    tagline: "The heart of every meeting",
    overview:
      "Your prepared speech is a talk you've written and rehearsed ahead of time, drawn from a project in your Pathways learning path. You pick the topic and the goal — tell a story, persuade, inspire, or inform — and the floor is entirely yours.",
    steps: [
      {
        title: "Choose your project",
        desc: "Each Pathways project sets a specific objective, like using vocal variety or building a clear, layered message.",
      },
      {
        title: "Write & rehearse",
        desc: "Draft the speech, practise it out loud, and time yourself so you land comfortably inside the window.",
      },
      {
        title: "Deliver to the club",
        desc: "Take the stage, connect with the room, and speak your few honest minutes.",
      },
      {
        title: "Get evaluated",
        desc: "An evaluator gives you warm, specific feedback so your next speech is even stronger.",
      },
    ],
    signals: [
      {
        light: "green",
        color: SIGNAL_COLORS.green,
        time: "5:00",
        label: "Green",
        desc: "You've hit the minimum — you're safely in the zone.",
      },
      {
        light: "yellow",
        color: SIGNAL_COLORS.yellow,
        time: "6:00",
        label: "Amber",
        desc: "Start wrapping up your final point.",
      },
      {
        light: "red",
        color: SIGNAL_COLORS.red,
        time: "7:00",
        label: "Red",
        desc: "Time's up — bring it home now.",
      },
    ],
    overtime: "Going past 7:30 can disqualify a speech in contests.",
    practice: ["Storytelling", "Structure", "Vocal variety", "Stage presence", "Confidence"],
    tip: "Rehearse to the green light, not the red — a relaxed finish always beats a rushed one.",
  },
  {
    no: "02",
    time: "1–2 min",
    title: "Table Topics",
    body: "A surprise question and thirty seconds to think. The gentlest way to learn how to speak clearly when you weren't expecting to.",
    accent: "#C2792B",
    tagline: "Think on your feet",
    overview:
      "Table Topics is the impromptu part of the meeting. The Topicsmaster asks a question you've never seen, and you answer it then and there — a tiny, low-stakes speech with no preparation at all. It's the gentlest way to get comfortable speaking off the cuff.",
    steps: [
      {
        title: "Get the question",
        desc: "The Topicsmaster poses a short, open question — anything from a memory to an opinion.",
      },
      {
        title: "Take a breath",
        desc: "Pause for a second or two. A calm start beats a fast one every time.",
      },
      {
        title: "Answer with a mini-structure",
        desc: "Open, make one point, and close. That's all a great answer needs.",
      },
    ],
    signals: [
      {
        light: "green",
        color: SIGNAL_COLORS.green,
        time: "1:00",
        label: "Green",
        desc: "You've spoken long enough — land any time now.",
      },
      {
        light: "yellow",
        color: SIGNAL_COLORS.yellow,
        time: "1:30",
        label: "Amber",
        desc: "Begin your closing sentence.",
      },
      {
        light: "red",
        color: SIGNAL_COLORS.red,
        time: "2:00",
        label: "Red",
        desc: "Time to stop.",
      },
    ],
    overtime: "Anything beyond 2:30 is over the limit.",
    practice: ["Quick thinking", "Composure", "Brevity", "Spontaneity"],
    tip: "Don't answer the question perfectly — answer it confidently. A clear opinion always sounds better than a hesitant fact.",
  },
  {
    no: "03",
    time: "2–3 min",
    title: "Evaluations",
    body: "Warm, specific feedback after every speech — what landed and what to try next. The evaluator grows just as much as the speaker.",
    accent: "#6B7D5B",
    tagline: "Where everyone grows",
    overview:
      "After each prepared speech, an evaluator stands up and offers feedback — what worked, what landed, and one or two things to try next time. Evaluation is a skill of its own: you learn to observe closely and encourage generously, and the speaker leaves with a clear path forward.",
    steps: [
      {
        title: "Listen closely",
        desc: "Watch the speech with the speaker's goal in mind, noting strengths and standout moments.",
      },
      {
        title: "Lead with what worked",
        desc: "Begin with genuine, specific praise — the things that truly landed.",
      },
      {
        title: "Offer one or two ideas",
        desc: "Frame improvements as ideas to try, not faults to fix.",
      },
      {
        title: "End with encouragement",
        desc: "Close on a high note that leaves the speaker eager for next time.",
      },
    ],
    signals: [
      {
        light: "green",
        color: SIGNAL_COLORS.green,
        time: "2:00",
        label: "Green",
        desc: "Minimum reached — you can close any time.",
      },
      {
        light: "yellow",
        color: SIGNAL_COLORS.yellow,
        time: "2:30",
        label: "Amber",
        desc: "Move into your final encouragement.",
      },
      {
        light: "red",
        color: SIGNAL_COLORS.red,
        time: "3:00",
        label: "Red",
        desc: "Wrap up now.",
      },
    ],
    overtime: "Past 3:30 is over the allotted time.",
    practice: ["Active listening", "Constructive feedback", "Empathy", "Encouragement"],
    tip: "Evaluate the speech, not the speaker — and always give more light than heat.",
  },
];

export function MeetingFormats() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [cursor, setCursor] = React.useState<{ x: number; y: number } | null>(null);

  const active = openIndex === null ? null : FORMATS[openIndex];

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {FORMATS.map(({ no, time, title, body, accent }, i) => (
          <button
            key={no}
            type="button"
            onClick={() => setOpenIndex(i)}
            onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setCursor(null)}
            className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-[#E7DAC6] bg-[#FBF6EC] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#d9c7a9] hover:shadow-[0_18px_40px_-22px_rgba(42,32,26,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E1D06]/40"
          >
            <span className="absolute top-0 left-0 h-1 w-full" style={{ background: accent }} />
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-5xl" style={{ color: accent }}>
                {no}
              </span>
              <span className="rounded-full border border-[#E7DAC6] px-3 py-1 text-xs text-[#7B6B5C]">
                {time}
              </span>
            </div>
            <div>
              <h3 className="mb-3 font-serif text-2xl text-[#2A201A]">{title}</h3>
              <p className="text-base leading-relaxed text-[#7B6B5C]">{body}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#2A201A]/70 transition-colors group-hover:text-[#9E1D06]">
              Learn how it works
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Cursor-following tooltip */}
      {cursor && openIndex === null && (
        <div
          className="pointer-events-none fixed z-[60] -translate-y-1/2 translate-x-4 rounded-full bg-[#221A13] px-3.5 py-1.5 text-xs font-medium text-[#F5EEE1] shadow-lg"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#E0A458] align-middle" />
          Click me to know more
        </div>
      )}

      <Sheet open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <SheetContent
          className="flex w-full !max-w-[36rem] flex-col gap-0 overflow-y-auto border-l border-[#E7DAC6] bg-[#F5EEE1] p-0 text-[#2A201A]"
          showCloseButton={false}
        >
          {active && (
            <>
              {/* Accent header */}
              <SheetHeader className="relative gap-0 px-7 pt-9 pb-7">
                <span
                  className="absolute top-0 left-0 h-1.5 w-full"
                  style={{ background: active.accent }}
                />
                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  aria-label="Close panel"
                  className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DAC6] bg-[#FBF6EC] text-[#7B6B5C] transition-colors hover:border-[#9E1D06]/40 hover:text-[#9E1D06]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>

                <div className="mb-5 flex items-center gap-3">
                  <span className="font-serif text-5xl leading-none" style={{ color: active.accent }}>
                    {active.no}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: `${active.accent}1A`, color: active.accent }}
                  >
                    {active.time}
                  </span>
                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: active.accent }}>
                  {active.tagline}
                </p>
                <SheetTitle className="font-serif text-3xl text-[#2A201A]">
                  {active.title}
                </SheetTitle>
                <SheetDescription className="mt-3 text-base leading-relaxed text-[#7B6B5C]">
                  {active.overview}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-8 px-7 pb-10">
                {/* How it works */}
                <section>
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#2A201A]/55">
                    How it works
                  </h4>
                  <ol className="flex flex-col gap-3">
                    {active.steps.map((step, idx) => (
                      <li
                        key={step.title}
                        className="flex gap-4 rounded-2xl border border-[#E7DAC6] bg-[#FBF6EC] p-4"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                          style={{ background: active.accent }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-[#2A201A]">{step.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-[#7B6B5C]">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Timing signals */}
                <section>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2A201A]/55">
                    The timing lights
                  </h4>
                  <p className="mb-4 text-sm text-[#7B6B5C]">
                    A timer shows you a coloured card as you speak — your cue to stay on track.
                  </p>

                  <div className="overflow-hidden rounded-2xl border border-[#E7DAC6] bg-[#FBF6EC]">
                    {active.signals.map((s, idx) => (
                      <div
                        key={s.light}
                        className={`flex items-center gap-4 p-4 ${
                          idx !== active.signals.length - 1 ? "border-b border-[#E7DAC6]" : ""
                        }`}
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4"
                          style={{ background: s.color, boxShadow: `0 0 0 4px ${s.color}22` }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold" style={{ color: s.color }}>
                              {s.label}
                            </span>
                            <span className="font-mono text-sm tabular-nums text-[#2A201A]">
                              {s.time}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-[#7B6B5C]">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-sm text-[#7B6B5C]">
                    <span aria-hidden className="mt-px">⏱</span>
                    {active.overtime}
                  </p>
                </section>

                {/* What you'll practise */}
                <section>
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#2A201A]/55">
                    What you&apos;ll practise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {active.practice.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[#E7DAC6] bg-[#FBF6EC] px-3.5 py-1.5 text-sm text-[#2A201A]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Pro tip */}
                <section
                  className="rounded-2xl border p-5"
                  style={{ borderColor: `${active.accent}40`, background: `${active.accent}0D` }}
                >
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: active.accent }}>
                    A gentle tip
                  </p>
                  <p className="text-base leading-relaxed text-[#2A201A]">{active.tip}</p>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
