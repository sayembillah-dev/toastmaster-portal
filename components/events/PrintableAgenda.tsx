"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventDTO } from "@/lib/serializers";
import { buildAgendaSchedule, type AgendaRow } from "@/lib/agendaSchedule";
import { CLUB_INFO } from "@/lib/eventConstants";

type Props = { event: EventDTO };

const BLUE = "#1a3f6f";
const BLUE_LIGHT = "#d6e4f0";

function formatShortDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function AgendaRowItem({ row }: { row: AgendaRow }) {
  return (
    <>
      {/* Main row */}
      <tr style={{ borderTop: row.bold ? `1px solid ${BLUE}` : "1px solid #e5e7eb" }}>
        <td style={{
          padding: "7px 8px 7px 0",
          fontSize: 13,
          fontWeight: "bold",
          color: BLUE,
          whiteSpace: "nowrap",
          verticalAlign: "top",
          width: 68,
        }}>
          {row.time}
        </td>
        <td style={{
          padding: "7px 8px 7px 0",
          fontSize: 13,
          fontWeight: row.bold ? "bold" : "normal",
          verticalAlign: "top",
        }}>
          {row.label}
        </td>
        <td style={{
          padding: "7px 8px 7px 0",
          fontSize: 13,
          fontWeight: 600,
          verticalAlign: "top",
          width: "30%",
        }}>
          {row.person || ""}
        </td>
        <td style={{
          padding: "7px 0",
          fontSize: 13,
          verticalAlign: "top",
          textAlign: "center",
          width: 32,
        }}>
          {row.duration ?? ""}
        </td>
      </tr>

      {/* Sub-rows */}
      {row.subRows?.map((sub, si) => (
        <tr key={si}>
          <td style={{ padding: "1px 0" }} />
          <td style={{
            padding: "3px 8px 3px 18px",
            fontSize: sub.italic ? 11 : 12,
            fontStyle: sub.italic ? "italic" : "normal",
            color: sub.italic ? "#6b7280" : "#1f2937",
            verticalAlign: "top",
          }}>
            {sub.label}
          </td>
          <td style={{
            padding: "3px 8px 3px 0",
            fontSize: 12,
            fontWeight: 600,
            verticalAlign: "top",
          }}>
            {sub.person || ""}
          </td>
          <td style={{
            padding: "3px 0",
            fontSize: 12,
            verticalAlign: "top",
            textAlign: "center",
          }}>
            {sub.duration ?? ""}
          </td>
        </tr>
      ))}
    </>
  );
}

export function PrintableAgenda({ event }: Props) {
  const schedule = buildAgendaSchedule(event);
  const { roles, speakers, wordOfDay } = event;

  const sidebarRoles = [
    { label: "President", value: roles.president },
    { label: "Sergeant at Arms", value: roles.sergeantAtArms },
    { label: "Toast Master of the Day", value: roles.toastmaster },
    { label: "General Evaluator", value: roles.generalEvaluator },
    { label: "Table Topic Master", value: roles.tableTopicMaster },
    { label: "Table Topic Evaluator", value: roles.tableTopicEvaluator },
    {
      label: "Prepared Speech Evaluators",
      value: [...new Set(speakers.map((s) => s.evaluatorName).filter(Boolean))].join(", "),
    },
  ];

  return (
    <div className="agenda-print-root" style={{ background: "#e8e8e8", minHeight: "100vh" }}>

      {/* Screen toolbar */}
      <div className="print-hidden" style={{
        padding: "14px 24px",
        borderBottom: "1px solid #e5e7eb",
        background: "white",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <Button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Printer style={{ width: 16, height: 16 }} />
          Print / Save as PDF
        </Button>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          In print dialog → Paper: <strong>A4</strong> · Margins: <strong>Minimum</strong> · Scale: <strong>100%</strong>
        </span>
      </div>

      {/* A4 page preview on screen */}
      <div className="agenda-print-wrap" style={{ padding: "24px 0 40px" }}>
        <div
          className="agenda-page"
          style={{
            width: "210mm",
            margin: "0 auto",
            background: "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            fontFamily: "'Arial', 'Helvetica', sans-serif",
          }}
        >
          {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
          <div style={{
            position: "relative",
            overflow: "hidden",
            background: "#003366",
            height: 72,
            display: "flex",
            alignItems: "center",
          }}>
            {/* Radiating rays – SVG overlay */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
              viewBox="0 0 800 72"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * 180 - 90;
                const rad = (angle * Math.PI) / 180;
                const x2 = 400 + Math.cos(rad) * 900;
                const y2 = 36 + Math.sin(rad) * 900;
                return (
                  <line key={i} x1="400" y1="36" x2={x2} y2={y2}
                    stroke="white" strokeWidth={i % 3 === 0 ? 3 : 1.5} />
                );
              })}
            </svg>

            {/* TM globe logo on the left */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tm-logo.png"
              alt="Toastmasters International"
              style={{ height: 68, width: 68, objectFit: "contain", flexShrink: 0, position: "relative", zIndex: 1 }}
            />

            {/* Club name on the right */}
            <div style={{
              flex: 1,
              textAlign: "right",
              paddingRight: 16,
              position: "relative",
              zIndex: 1,
            }}>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "white", letterSpacing: 0.5 }}>
                {CLUB_INFO.name}
              </div>
              <div style={{ fontSize: 10, color: "#b8d4f0", letterSpacing: 1, marginTop: 2 }}>
                {CLUB_INFO.district} &nbsp;·&nbsp; {CLUB_INFO.division} &nbsp;·&nbsp; {CLUB_INFO.area}
              </div>
            </div>
          </div>

          {/* ── GREY STRIP (matches banner bottom) ───────────────────────── */}
          <div style={{
            background: BLUE_LIGHT,
            height: 8,
          }} />

          {/* ── MEETING META ROW ─────────────────────────────────────────── */}
          <div style={{
            padding: "5px 16px 5px",
            borderBottom: `2px solid ${BLUE}`,
            display: "flex",
            gap: 28,
            fontSize: 11,
            alignItems: "center",
          }}>
            <span style={{ fontWeight: "bold" }}>{formatShortDate(event.date)}</span>
            {event.meetingNumber > 0 && (
              <span>Meeting # <strong>{event.meetingNumber}</strong></span>
            )}
            {event.theme && (
              <span>Theme of the day: &nbsp;<strong>{event.theme}</strong></span>
            )}
          </div>

          {/* ── BODY: SIDEBAR + TIMELINE ─────────────────────────────────── */}
          <div style={{ display: "flex" }}>

            {/* LEFT SIDEBAR */}
            <div style={{
              width: 148,
              flexShrink: 0,
              borderRight: `1px solid #d1d5db`,
              padding: "10px 10px 10px 10px",
            }}>

              {/* Role assignments */}
              {sidebarRoles.map((r, i) => (
                <div key={i} style={{ marginBottom: 11 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: BLUE,
                    borderBottom: `1px solid ${BLUE}`,
                    paddingBottom: 2,
                    marginBottom: 3,
                  }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 9.5, fontStyle: "italic", color: "#1f2937", lineHeight: 1.4 }}>
                    {r.value || ""}
                  </div>
                </div>
              ))}

              {/* Prepared Speakers */}
              {speakers.length > 0 && (
                <div style={{ marginBottom: 11 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: BLUE,
                    borderBottom: `1px solid ${BLUE}`,
                    paddingBottom: 2,
                    marginBottom: 3,
                  }}>
                    Prepared Speakers
                  </div>
                  {speakers.map((s, i) => (
                    <div key={i} style={{ fontSize: 9.5, marginBottom: 3, fontStyle: "italic" }}>
                      {i + 1}.&nbsp;{s.name || "—"}
                    </div>
                  ))}
                </div>
              )}

              {/* Mission of the Club */}
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color: BLUE,
                  borderBottom: `1px solid ${BLUE}`,
                  paddingBottom: 2,
                  marginBottom: 5,
                }}>
                  Mission of the Club
                </div>
                <div style={{ fontSize: 8.5, lineHeight: 1.65, color: "#374151" }}>
                  {CLUB_INFO.mission}
                </div>
              </div>

              {/* Word of the Day */}
              {wordOfDay?.word && (
                <div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: BLUE,
                    borderBottom: `1px solid ${BLUE}`,
                    paddingBottom: 2,
                    marginBottom: 5,
                  }}>
                    Word of the Day
                  </div>
                  <div style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>
                    {wordOfDay.word}
                  </div>
                  {wordOfDay.partOfSpeech && (
                    <div style={{ fontSize: 9, fontStyle: "italic", color: "#4b5563", marginBottom: 3 }}>
                      ({wordOfDay.partOfSpeech})
                    </div>
                  )}
                  {wordOfDay.meaning && (
                    <div style={{ fontSize: 9, lineHeight: 1.5, marginBottom: 4 }}>
                      <strong>Meaning:&nbsp;</strong>{wordOfDay.meaning}
                    </div>
                  )}
                  {wordOfDay.example && (
                    <div style={{ fontSize: 9, lineHeight: 1.5, fontStyle: "italic", color: "#374151" }}>
                      &ldquo;{wordOfDay.example}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TIMELINE TABLE */}
            <div style={{ flex: 1, padding: "10px 12px 12px 12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${BLUE}` }}>
                    <th style={{ fontSize: 11, textAlign: "left", paddingBottom: 5, width: 68, color: BLUE }}>Time</th>
                    <th style={{ fontSize: 11, textAlign: "left", paddingBottom: 5, color: BLUE }}>Description</th>
                    <th style={{ fontSize: 11, textAlign: "left", paddingBottom: 5, color: BLUE, width: "30%" }}>Person</th>
                    <th style={{ fontSize: 11, textAlign: "center", paddingBottom: 5, width: 32, color: BLUE }}>Min</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <AgendaRowItem key={i} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRINT STYLES ───────────────────────────────────────────────────── */}
      <style>{`
        @media screen {
          .agenda-page { min-height: 277mm; }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          html, body {
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white;
          }
          aside, header, nav { display: none !important; }
          /* Strip app-shell overflow / height constraints */
          .h-screen { height: auto !important; }
          .overflow-hidden { overflow: visible !important; }
          .overflow-y-auto { overflow: visible !important; }
          main { padding: 0 !important; height: auto !important; overflow: visible !important; }
          /* Strip the grey screen-only wrappers */
          .agenda-print-root {
            min-height: 0 !important;
            background: white !important;
            padding: 0 !important;
          }
          .agenda-print-wrap {
            padding: 0 !important;
          }
          .print-hidden { display: none !important; }
          .agenda-page {
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            min-height: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
