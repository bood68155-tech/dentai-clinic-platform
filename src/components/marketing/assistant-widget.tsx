"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AssistantBooking } from "@/lib/assistant-types";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

type Entry = {
  id: number;
  role: "user" | "assistant";
  content: string;
  booking?: AssistantBooking;
  failed?: boolean;
};

const GREETING =
  "Hi — I'm the NUV assistant. I can answer questions about the practice and book you in. What brings you in?";

const QUICK_PROMPTS = [
  "What are your opening hours?",
  "Where are you and is there parking?",
  "What services do you offer?",
  "Book me a check-up",
];

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries, sending]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || sending) return;

      const history: Entry[] = [
        ...entries.filter((entry) => !entry.failed),
        { id: nextId.current++, role: "user", content: message },
      ];

      setEntries(history);
      setInput("");
      setSending(true);

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
        });

        const data = (await response.json().catch(() => null)) as {
          reply?: string;
          booking?: AssistantBooking;
          message?: string;
        } | null;

        if (!response.ok || !data?.reply) {
          setEntries((current) => [
            ...current,
            {
              id: nextId.current++,
              role: "assistant",
              content:
                data?.message ??
                `I couldn't reach the desk just now. Call ${CLINIC_PROFILE.phone} and we'll help straight away.`,
              failed: true,
            },
          ]);
          return;
        }

        setEntries((current) => [
          ...current,
          {
            id: nextId.current++,
            role: "assistant",
            content: data.reply ?? "",
            ...(data.booking ? { booking: data.booking } : {}),
          },
        ]);
      } catch {
        setEntries((current) => [
          ...current,
          {
            id: nextId.current++,
            role: "assistant",
            content: `The connection dropped. Call ${CLINIC_PROFILE.phone} and we'll pick it up.`,
            failed: true,
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [entries, sending],
  );

  return (
    <>
      {open ? (
        <section
          id="nuv-assistant"
          role="dialog"
          aria-label="NUV virtual assistant"
          className="fixed bottom-20 right-4 z-[85] flex h-[min(33rem,calc(100svh-7.5rem))] w-[min(23rem,calc(100vw-2rem))] flex-col border border-ink bg-paper sm:right-5"
        >
          <header className="flex items-start justify-between gap-3 bg-forest px-4 py-3 text-paper">
            <div>
              <p className="font-sans text-[0.95rem] font-extrabold leading-none tracking-[-0.04em]">
                {CLINIC_PROFILE.name} reception
              </p>
              <p className="mt-1.5 font-sans text-[8.5px] font-bold uppercase leading-none tracking-[0.1em] text-paper/65">
                Assistant · Khan Yunis, Gaza
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close assistant"
              className="grid size-7 shrink-0 place-items-center border border-paper/40 text-paper transition-colors hover:bg-paper hover:text-forest"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 bg-clay" />
              <p className="font-editorial text-[0.95rem] leading-[1.45] text-ink/80">{GREETING}</p>
            </div>

            {entries.length === 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void send(prompt)}
                    className="border border-ink/30 px-2.5 py-1.5 font-sans text-[9.5px] font-extrabold uppercase leading-none tracking-[0.06em] text-ink/70 transition-colors hover:border-forest hover:bg-forest hover:text-paper"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3">
              {entries.map((entry) =>
                entry.role === "user" ? (
                  <p
                    key={entry.id}
                    className="ml-auto max-w-[85%] bg-ink px-3 py-2 font-editorial text-[0.92rem] leading-[1.4] text-paper"
                  >
                    {entry.content}
                  </p>
                ) : (
                  <div key={entry.id} className="max-w-[92%]">
                    <p
                      className={
                        entry.failed
                          ? "border-l-2 border-[#a13a22] pl-2.5 font-editorial text-[0.92rem] leading-[1.45] text-[#a13a22]"
                          : "border-l-2 border-forest pl-2.5 font-editorial text-[0.92rem] leading-[1.45] text-ink/85"
                      }
                    >
                      {entry.content}
                    </p>

                    {entry.booking ? (
                      <div className="mt-2.5 border border-forest bg-forest/5 px-3 py-2.5">
                        <p className="font-sans text-[8.5px] font-extrabold uppercase tracking-[0.1em] text-forest">
                          Request received
                        </p>
                        <p className="mt-1.5 font-sans text-[0.95rem] font-bold leading-tight text-forest">
                          {entry.booking.date} · {entry.booking.time}
                        </p>
                        <p className="mt-1 font-editorial text-[0.85rem] leading-snug text-ink/70">
                          {entry.booking.treatment} · {entry.booking.patientName}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ),
              )}

              {sending ? (
                <div className="flex items-center gap-1 border-l-2 border-forest pl-2.5" aria-live="polite">
                  <span className="sr-only">The assistant is replying</span>
                  <span className="size-1.5 motion-safe:animate-pulse bg-forest" />
                  <span className="size-1.5 motion-safe:animate-pulse bg-forest [animation-delay:150ms]" />
                  <span className="size-1.5 motion-safe:animate-pulse bg-forest [animation-delay:300ms]" />
                </div>
              ) : null}

              <div ref={endRef} />
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="border-t border-ink px-3 py-2.5"
          >
            <div className="flex items-end gap-2">
              <label htmlFor="assistant-input" className="sr-only">
                Your message
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                rows={2}
                maxLength={1000}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask about hours, services, or booking…"
                className="max-h-24 min-h-[2.4rem] flex-1 resize-none border-0 border-b border-ink/40 bg-transparent py-1 font-editorial text-[0.95rem] leading-snug text-ink outline-none placeholder:text-ink/35 focus:border-forest"
              />
              <button
                type="submit"
                disabled={sending || input.trim().length === 0}
                className="shrink-0 border border-ink bg-forest px-3 py-2 font-sans text-[9.5px] font-extrabold uppercase leading-none tracking-[0.08em] text-paper transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-2 font-sans text-[8.5px] font-semibold uppercase tracking-[0.08em] text-ink/45">
              Automated assistant · emergencies? Call{" "}
              <a
                href={CLINIC_PROFILE.phoneHref}
                className="underline underline-offset-2 hover:text-forest"
              >
                {CLINIC_PROFILE.phone}
              </a>
            </p>
          </form>
        </section>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="nuv-assistant"
        className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 border border-ink bg-forest px-3.5 py-2.5 font-sans text-[10px] font-extrabold uppercase leading-none tracking-[0.08em] text-paper transition-colors hover:bg-ink sm:bottom-5 sm:right-5"
      >
        <span aria-hidden="true" className="size-1.5 bg-clay" />
        Ask {CLINIC_PROFILE.name}
      </button>
    </>
  );
}
