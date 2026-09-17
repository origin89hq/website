// Adds a verified address to the Mailchimp audience as pending, so Mailchimp
// sends the confirmation email. Every accepted request gets the same reply,
// whether or not the address was already on the list.

export interface WaitlistEnv {
  MAILCHIMP_API_KEY?: string;
  MAILCHIMP_AUDIENCE_ID?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Comma-separated page hostnames that Turnstile tokens may come from. */
  TURNSTILE_HOSTNAMES?: string;
}

export type WaitlistError =
  | "invalid_request"
  | "invalid_email"
  | "verification_failed"
  | "rejected"
  | "unavailable";

export const WAITLIST_TAG = "controller-waitlist";
export const TURNSTILE_ACTION = "waitlist";
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_BODY_BYTES = 4096;
const MAX_TOKEN_LENGTH = 2048;
const MAX_EMAIL_LENGTH = 254;
const UPSTREAM_TIMEOUT_MS = 10_000;
// Mailchimp refusals that depend on the contact's history in the audience rather
// than on the address itself. They get the accepted reply, so the form never
// reveals whether an address was ever on the list.
const LIST_STATE_REFUSALS = new Set([
  "Member Exists",
  "Member In Compliance State",
  "Forgotten Email Not Subscribed",
]);

const STATUS: Record<WaitlistError, number> = {
  invalid_request: 400,
  invalid_email: 400,
  verification_failed: 403,
  rejected: 422,
  unavailable: 503,
};

interface Config {
  apiKey: string;
  dataCenter: string;
  audienceId: string;
  turnstileSecret: string;
  hostnames: Set<string>;
}

type Fetch = typeof fetch;

export async function handleWaitlist(
  request: Request,
  env: WaitlistEnv,
  fetcher: Fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  const config = readConfig(env);
  if (!config) {
    console.error({ event: "waitlist.config_missing" });
    return failure("unavailable");
  }
  const body = await readJson(request);
  if (!body) return failure("invalid_request");
  const email = parseEmail(body.email);
  if (!email) return failure("invalid_email");
  const token = body.token;
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return failure("verification_failed");
  }

  const verified = await verifyTurnstile(
    token,
    request.headers.get("CF-Connecting-IP"),
    config,
    fetcher,
  );
  if (verified !== "ok") return failure(verified);
  const subscribed = await subscribe(email, config, fetcher);
  if (subscribed !== "ok") return failure(subscribed);
  return Response.json({ status: "ok" });
}

function failure(error: WaitlistError): Response {
  return Response.json({ error }, { status: STATUS[error] });
}

function readConfig(env: WaitlistEnv): Config | undefined {
  const apiKey = env.MAILCHIMP_API_KEY?.trim();
  const audienceId = env.MAILCHIMP_AUDIENCE_ID?.trim();
  const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
  const hostnames = new Set(
    (env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
  // Mailchimp keys end in their data center, such as `-us21`.
  const dataCenter = apiKey?.match(/-([a-z]+\d+)$/)?.[1];
  if (!apiKey || !dataCenter || !audienceId || !/^[a-z0-9]+$/.test(audienceId)) return undefined;
  if (!turnstileSecret || hostnames.size === 0) return undefined;
  return { apiKey, dataCenter, audienceId, turnstileSecret, hostnames };
}

async function readJson(request: Request): Promise<Record<string, unknown> | undefined> {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) return undefined;
  const text = await readLimited(request, MAX_BODY_BYTES);
  if (text === undefined) return undefined;
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

async function readLimited(request: Request, limit: number): Promise<string | undefined> {
  const length = Number(request.headers.get("Content-Length"));
  if (length > limit || !request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function parseEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim();
  return email.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : undefined;
}

async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
  config: Config,
  fetcher: Fetch,
): Promise<"ok" | "verification_failed" | "unavailable"> {
  const form = new URLSearchParams({ secret: config.turnstileSecret, response: token });
  if (remoteIp) form.set("remoteip", remoteIp);
  let result: unknown;
  try {
    const response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`siteverify returned ${response.status}`);
    result = await response.json();
  } catch (error) {
    console.error({ event: "waitlist.siteverify_failed", message: String(error) });
    return "unavailable";
  }
  if (typeof result !== "object" || result === null) return "unavailable";
  const { success, action, hostname } = result as Record<string, unknown>;
  const passed =
    success === true &&
    action === TURNSTILE_ACTION &&
    typeof hostname === "string" &&
    config.hostnames.has(hostname);
  return passed ? "ok" : "verification_failed";
}

async function subscribe(
  email: string,
  config: Config,
  fetcher: Fetch,
): Promise<"ok" | "rejected" | "unavailable"> {
  const url = `https://${config.dataCenter}.api.mailchimp.com/3.0/lists/${config.audienceId}/members`;
  let response: Response;
  try {
    response = await fetcher(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`origin89:${config.apiKey}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, status: "pending", tags: [WAITLIST_TAG] }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error({ event: "waitlist.mailchimp_failed", message: String(error) });
    return "unavailable";
  }
  if (response.ok) return "ok";
  const title = await problemTitle(response);
  // The contact keeps its current state. Only a permanently deleted or
  // non-compliant contact is worth a log line: Mailchimp will not re-add it.
  if (response.status === 400 && title !== undefined && LIST_STATE_REFUSALS.has(title)) {
    if (title !== "Member Exists") console.warn({ event: "waitlist.mailchimp_refused", title });
    return "ok";
  }
  console.error({ event: "waitlist.mailchimp_error", status: response.status, title });
  return response.status === 400 ? "rejected" : "unavailable";
}

async function problemTitle(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) return undefined;
    const { title } = body as Record<string, unknown>;
    return typeof title === "string" ? title : undefined;
  } catch {
    return undefined;
  }
}
