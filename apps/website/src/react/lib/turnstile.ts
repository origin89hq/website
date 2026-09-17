// Loads Cloudflare Turnstile on demand, so pages that never use a protected form
// never fetch it.

export interface TurnstileOptions {
  sitekey: string;
  action: string;
  theme?: "auto" | "light" | "dark";
  appearance?: "always" | "execute" | "interaction-only";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (code: string) => boolean;
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string | undefined;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
// A stalled request fires neither `load` nor `error`, so give up after this.
export const TURNSTILE_LOAD_TIMEOUT_MS = 15_000;
let loading: Promise<TurnstileApi> | undefined;

export function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    const fail = (message: string) => {
      clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      script.remove();
      reject(new Error(message));
    };
    const timer = setTimeout(() => fail("Turnstile timed out"), TURNSTILE_LOAD_TIMEOUT_MS);
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (!window.turnstile) return fail("Turnstile did not start");
      clearTimeout(timer);
      resolve(window.turnstile);
    };
    script.onerror = () => fail("Turnstile did not load");
    document.head.append(script);
  }).catch((error: unknown) => {
    // Let a later attempt try again, for example after a network blip.
    loading = undefined;
    throw error;
  });
  return loading;
}
