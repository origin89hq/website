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
type Status = "idle" | "verifying" | "sending" | "done" | WaitlistError;

const NOTE: Record<Status, string> = {
  idle: "We’ll email you a link to confirm your address.",
  verifying: "Complete the Cloudflare check below to finish joining.",
  sending: "Adding you to the waitlist…",
  done: "Check your inbox for a link to confirm your address. If you’re already on the list, there’s nothing more to do.",
  invalid_email: "Check the address and try again.",
  verification_failed:
    "We couldn’t confirm this is a person. Complete the check below, or reload the page and try again.",
  rejected: `Mailchimp didn’t accept this address. Try another one or write to ${siteConfig.email}.`,
  invalid_request: `Sign-up isn’t working right now. Try again later or write to ${siteConfig.email}.`,
  unavailable: `Sign-up isn’t working right now. Try again later or write to ${siteConfig.email}.`,
};

// Turnstile can ask the visitor to tick a box, so leave time to notice and do it.
const TOKEN_WAIT_MS = 120_000;
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
  // Set once a token has been sent: Siteverify accepts each token only once.
  const spent = useRef(false);
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
          // Visible, so a visitor it asks to tick a box can see the box.
          appearance: "always",
          callback: settle,
          "expired-callback": () => {
            token.current = null;
          },
          "error-callback": (code) => {
            // The code identifies the failure in Cloudflare's documentation.
            console.warn("Turnstile error", code);
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
    if (status === "sending" || status === "verifying") return;
    const email = new FormData(event.currentTarget).get("email");
    setStatus("sending");
    let next: Status = "verification_failed";
    try {
      await startCheck();
      // Fetch a fresh token only when retrying, so the check does not reload
      // under the reply, and never while one is still being completed.
      if (spent.current && widget.current) {
        spent.current = false;
        token.current = null;
        widget.current.api.reset(widget.current.id);
      }
      if (!token.current) setStatus("verifying");
      const value = await nextToken();
      if (value && typeof email === "string") {
        setStatus("sending");
        spent.current = true;
        token.current = null;
        next = await send(email, value);
      }
    } catch {
      next = "unavailable";
    }
    // Once someone is on the list the check has done its job; a later
    // submission renders a new one.
    if (next === "done" && widget.current) {
      widget.current.api.remove(widget.current.id);
      widget.current = null;
      ready.current = null;
      spent.current = false;
    }
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
            disabled={status === "sending" || status === "verifying"}
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
              : status === "idle" || status === "verifying" || status === "sending"
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
