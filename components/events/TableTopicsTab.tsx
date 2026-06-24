"use client";

import { useState } from "react";
import { Plus, MoreVertical, Pencil, Trash2, CheckCircle2, Circle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";
import type { TableTopicQuestionDTO } from "@/lib/serializers";

type Props = { form: EventFormState; update: UpdateFormFn };

export function TableTopicsTab({ form, update }: Props) {
  const questions = form.tableTopicQuestions;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");

  const asked = questions.filter((q) => q.completed).length;

  const commitEdit = () => {
    if (editingIndex === null) return;
    const next = questions.map((q, idx) =>
      idx === editingIndex ? { ...q, text: draftText } : q,
    );
    update({ tableTopicQuestions: next });
    setEditingIndex(null);
  };

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setDraftText(questions[i].text);
  };

  const add = () => {
    if (questions.length >= 10) return;
    const next: TableTopicQuestionDTO[] = [...questions, { text: "", completed: false }];
    update({ tableTopicQuestions: next });
    // open the new card in edit mode immediately
    setEditingIndex(next.length - 1);
    setDraftText("");
  };

  const remove = (i: number) => {
    if (editingIndex === i) setEditingIndex(null);
    update({ tableTopicQuestions: questions.filter((_, idx) => idx !== i) });
  };

  const toggle = (i: number) => {
    const next = questions.map((q, idx) =>
      idx === i ? { ...q, completed: !q.completed } : q,
    );
    update({ tableTopicQuestions: next }, true);
  };

  const move = (i: number, dir: -1 | 1) => {
    const arr = [...questions];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    if (editingIndex === i) setEditingIndex(j);
    else if (editingIndex === j) setEditingIndex(i);
    update({ tableTopicQuestions: arr });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Table Topic Questions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Up to 10 questions. Mark each as asked during the meeting.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground block">{questions.length}/10</span>
          {questions.length > 0 && (
            <span className="text-xs text-green-600 font-medium">{asked} asked</span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {questions.length === 0 && (
        <div className="border border-dashed rounded-xl p-10 text-center text-sm text-muted-foreground">
          No questions yet. Add some below.
        </div>
      )}

      {/* Cards */}
      <div className="space-y-2">
        {questions.map((q, i) => {
          const isEditing = editingIndex === i;
          return (
            <div
              key={`q-${i}`}
              className={`rounded-xl border bg-card transition-colors ${
                q.completed
                  ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Number badge */}
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    q.completed
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        autoFocus
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Type your question…"
                        className="text-sm min-h-0 h-20 resize-none w-full"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingIndex(null);
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs px-3" onClick={commitEdit}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-3"
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`text-sm leading-snug whitespace-pre-wrap wrap-break-word ${
                        q.completed ? "line-through text-muted-foreground" : ""
                      } ${!q.text ? "italic text-muted-foreground" : ""}`}
                    >
                      {q.text || "Empty question — tap Edit to add text"}
                    </p>
                  )}
                </div>

                {/* Right actions (hidden while editing) */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Completed toggle */}
                    <button
                      type="button"
                      title={q.completed ? "Mark as not asked" : "Mark as asked"}
                      onClick={() => toggle(i)}
                      className={`transition-colors ${
                        q.completed
                          ? "text-green-600 hover:text-green-700"
                          : "text-muted-foreground hover:text-green-600"
                      }`}
                    >
                      {q.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    {/* Three-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Question options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom">
                        <DropdownMenuItem onClick={() => startEdit(i)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                          Move Up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => move(i, 1)}
                          disabled={i === questions.length - 1}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                          Move Down
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => remove(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      {questions.length < 10 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="gap-2 w-full"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      )}
    </div>
  );
}
