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
let loading: Promise<TurnstileApi> | undefined;

export function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not start"));
    script.onerror = () => reject(new Error("Turnstile did not load"));
    document.head.append(script);
  }).catch((error: unknown) => {
    // Let a later attempt try again, for example after a network blip.
    loading = undefined;
    throw error;
  });
  return loading;
}
