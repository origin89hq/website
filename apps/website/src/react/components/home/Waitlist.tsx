import plateWhite from "@origin89/brand/logos/plate-89-white.svg?url";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { siteConfig } from "../../lib/site-config";
import { loadTurnstile, type TurnstileApi } from "../../lib/turnstile";

// The error codes `/api/waitlist` answers with.
const ERRORS = [
  "invalid_request",
  "invalid_email",
  "verification_failed",
  "rejected",
  "unavailable",
] as const;
type WaitlistError = (typeof ERRORS)[number];
type Status = "idle" | "sending" | "done" | WaitlistError;

const NOTE: Record<Status, string> = {
  idle: "We’ll email you a link to confirm your address.",
  sending: "Adding you to the waitlist…",
  done: "Check your inbox for a link to confirm your address. If you’re already on the list, there’s nothing more to do.",
  invalid_email: "Check the address and try again.",
  verification_failed:
    "We couldn’t confirm this is a person. Complete the check if one is showing, or reload the page and try again.",
  rejected: `Mailchimp didn’t accept this address. Try another one or write to ${siteConfig.email}.`,
  invalid_request: `Sign-up isn’t working right now. Try again later or write to ${siteConfig.email}.`,
  unavailable: `Sign-up isn’t working right now. Try again later or write to ${siteConfig.email}.`,
};

// Long enough to finish an interactive check if Turnstile shows one.
const TOKEN_WAIT_MS = 20_000;
const REQUEST_TIMEOUT_MS = 30_000;

async function send(email: string, token: string): Promise<Status> {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.ok) return "done";
  const body: unknown = await response.json().catch(() => undefined);
  const error = typeof body === "object" && body !== null && "error" in body ? body.error : null;
  return ERRORS.find((code) => code === error) ?? "unavailable";
}

export function Waitlist() {
  const [status, setStatus] = useState<Status>("idle");
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: TurnstileApi; id: string }>(null);
  const ready = useRef<Promise<void>>(null);
  const token = useRef<string>(null);
  const waiting = useRef<(token: string | null) => void>(null);

  useEffect(
    () => () => {
      if (widget.current) widget.current.api.remove(widget.current.id);
    },
    [],
  );

  const settle = (value: string | null) => {
    token.current = value;
    waiting.current?.(value);
    waiting.current = null;
  };

  const startCheck = () => {
    ready.current ??= loadTurnstile()
      .then((api) => {
        if (!box.current) throw new Error("The waitlist is not mounted");
        const id = api.render(box.current, {
          sitekey: siteConfig.turnstileSiteKey,
          action: "waitlist",
          theme: "dark",
          appearance: "interaction-only",
          callback: settle,
          "expired-callback": () => {
            token.current = null;
          },
          "error-callback": () => {
            settle(null);
            return true;
          },
        });
        if (!id) throw new Error("Turnstile did not render");
        widget.current = { api, id };
      })
      .catch((error: unknown) => {
        ready.current = null;
        throw error;
      });
    return ready.current;
  };

  const nextToken = () =>
    token.current
      ? Promise.resolve(token.current)
      : new Promise<string | null>((resolve) => {
          const timer = setTimeout(() => {
            waiting.current = null;
            resolve(null);
          }, TOKEN_WAIT_MS);
          waiting.current = (value) => {
            clearTimeout(timer);
            resolve(value);
          };
        });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const email = new FormData(event.currentTarget).get("email");
    setStatus("sending");
    let next: Status;
    try {
      await startCheck();
      const value = await nextToken();
      next = value && typeof email === "string" ? await send(email, value) : "verification_failed";
    } catch {
      next = "unavailable";
    }
    // Each token is accepted once, so fetch a fresh one for the next attempt.
    token.current = null;
    if (widget.current) widget.current.api.reset(widget.current.id);
    setStatus(next);
  };

  const warmUp = () => {
    startCheck().catch(() => {});
  };

  return (
    <section className="section close" id="waitlist" aria-labelledby="close-title">
      <div className="o89-wrap close-inner">
        <img
          className="plate-mark reveal"
          src={plateWhite}
          alt=""
          aria-hidden="true"
          width="96"
          height="53"
        />
        <h2 id="close-title" className="h-xl reveal">
          Be first on the wall.
        </h2>
        <p className="lede reveal">
          We’ll write when bench results are in and again when boards can be reserved. Nothing else.
        </p>
        <form className="waitlist reveal" onSubmit={submit} onFocus={warmUp} onPointerDown={warmUp}>
          <label htmlFor="waitlistEmail" className="o89-sr">
            Email address
          </label>
          <input
            id="waitlistEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <button
            className="o89-plate o89-plate-action"
            type="submit"
            disabled={status === "sending"}
          >
            Join the waitlist
          </button>
        </form>
        <div className="waitlist-check" ref={box} />
        <p
          className="waitlist-note"
          data-state={
            status === "done"
              ? "done"
              : status === "idle" || status === "sending"
                ? undefined
                : "error"
          }
          aria-live="polite"
        >
          {NOTE[status]}
        </p>
      </div>
    </section>
  );
}
