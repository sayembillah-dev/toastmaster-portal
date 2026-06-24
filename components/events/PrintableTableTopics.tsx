"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventDTO } from "@/lib/serializers";
import { CLUB_INFO } from "@/lib/eventConstants";

type Props = { event: EventDTO };

function formatShortDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function PrintableTableTopics({ event }: Props) {
  const questions = event.tableTopicQuestions.filter((q) => q.text);

  return (
    <div className="min-h-screen bg-white">
      {/* Print button — hidden when printing */}
      <div className="print-hidden flex items-center gap-3 p-4 border-b bg-muted/40">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
        <p className="text-sm text-muted-foreground">
          Use your browser's print dialog → <strong>Save as PDF</strong> → set paper to <strong>A4</strong>
        </p>
      </div>

      {/* A4 Page */}
      <div
        className="tt-page mx-auto bg-white"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Arial, sans-serif", padding: "0 0 16px 0" }}
      >
        {/* Header */}
        <div style={{ background: "#1a3f6f", color: "white", padding: "6px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#1a3f6f", fontSize: 8, fontWeight: "bold", textAlign: "center", lineHeight: 1.1 }}>TM</span>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: "bold", letterSpacing: 1 }}>TOASTMASTERS</div>
              <div style={{ fontSize: 6, letterSpacing: 2 }}>INTERNATIONAL</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: "bold" }}>{CLUB_INFO.name}</div>
          </div>
        </div>

        {/* Meeting info */}
        <div style={{ padding: "6px 16px", borderBottom: "2px solid #1a3f6f", display: "flex", gap: 20, fontSize: 10 }}>
          <span><strong>{formatShortDate(event.date)}</strong></span>
          <span>Meeting # <strong>{event.meetingNumber || ""}</strong></span>
          {event.theme && <span>Theme: <strong>{event.theme}</strong></span>}
          {event.roles.tableTopicMaster && (
            <span>TTM: <strong>{event.roles.tableTopicMaster}</strong></span>
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", padding: "12px 16px 8px", fontSize: 16, fontWeight: "bold", color: "#1a3f6f", borderBottom: "1px solid #ccc" }}>
          Table Topic Questions
        </div>

        {/* Questions */}
        <div style={{ padding: "12px 24px" }}>
          {questions.length === 0 ? (
            <p style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>No questions added yet.</p>
          ) : (
            questions.map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: i < questions.length - 1 ? "1px dashed #ccc" : "none",
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  background: "#1a3f6f",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: "bold",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5 }}>{q.text}</p>
                  {/* Answer space */}
                  <div style={{ marginTop: 8, borderBottom: "1px solid #ddd", height: 1 }} />
                  <div style={{ marginTop: 8, borderBottom: "1px solid #ddd", height: 1 }} />
                  <div style={{ marginTop: 8, borderBottom: "1px solid #ddd", height: 1 }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body { margin: 0 !important; height: auto !important; overflow: visible !important; background: white; }
          aside, header, nav { display: none !important; }
          .h-screen { height: auto !important; }
          .overflow-hidden { overflow: visible !important; }
          .overflow-y-auto { overflow: visible !important; }
          main { padding: 0 !important; height: auto !important; overflow: visible !important; }
          .print-hidden { display: none !important; }
          .tt-page { width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
