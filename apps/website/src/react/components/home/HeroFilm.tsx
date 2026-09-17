import { useEffect, useRef, useState } from "react";
import filmUrl from "../../../assets/home/hero.mp4?url";
import filmSmallUrl from "../../../assets/home/hero-720.mp4?url";
import anchorsUrl from "../../../assets/home/hero-anchors.json?url";
import filmAv1Url from "../../../assets/home/hero-av1.mp4?url";
import posterUrl from "../../../assets/home/hero-poster.webp?url";
import { CALLOUTS } from "./data";
import { ArrowIcon } from "./icons";

type Track = {
  fps: number;
  frames: number;
  shots: { name: string; start: number; end: number }[];
  anchors: Record<string, [number, number][]>;
};

const LABEL_WIDTH = 300;
const LEADER_GAP = 110;

type SaveDataNavigator = Navigator & { connection?: { saveData?: boolean } };

// 720p H.264 on narrow screens; AV1 where the browser can play it, which is under half the size.
const pickFilm = (video: HTMLVideoElement) => {
  if (matchMedia("(max-width: 900px)").matches) return filmSmallUrl;
  return video.canPlayType('video/mp4; codecs="av01.0.08M.10"') === "probably"
    ? filmAv1Url
    : filmUrl;
};

export function HeroFilm() {
  const hero = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const callouts = useRef<Record<string, HTMLDivElement | null>>({});
  const wanted = useRef(true);
  const controls = useRef<{ run: () => void; hold: () => void } | null>(null);
  const [playing, setPlaying] = useState(true);
  const [caption, setCaption] = useState<string | null>(null);

  useEffect(() => {
    const video = film.current;
    const section = hero.current;
    if (!video || !section) return;
    video.muted = true;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator as SaveDataNavigator).connection?.saveData
    ) {
      wanted.current = false;
      setPlaying(false);
    }

    let track: Track | null = null;
    let frame = 0;
    let inView = false;
    let current: string | null = null;
    const controller = new AbortController();
    fetch(anchorsUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Track | null) => {
        track = data;
      })
      .catch(() => {});

    const place = (time: number) => {
      const host = layer.current;
      if (!track || !host || !video.duration) return;
      const f = Math.floor(time * track.fps) % track.frames;
      const shot = track.shots.find((s) => f + 1 >= s.start && f + 1 <= s.end);
      const W = video.clientWidth;
      const H = video.clientHeight;
      const scale = Math.max(W / 1920, H / 1080);
      const vw = 1920 * scale;
      const vh = 1080 * scale;
      const ox = (W - vw) / 2;
      const oy = (H - vh) / 2;
      let visible: string | null = null;
      for (const [key, callout] of Object.entries(CALLOUTS)) {
        const el = callouts.current[key];
        if (!el) continue;
        const on = !!shot && shot.name === key && f + 1 > shot.start + 10 && f + 1 < shot.end - 8;
        el.classList.toggle("on", on);
        if (!shot || shot.name !== key) continue;
        const point = track.anchors[callout.anchor]?.[f];
        if (!point) continue;
        if (on) visible = key;
        const x = ox + point[0] * vw;
        const y = oy + point[1] * vh;
        const right = W - x > LABEL_WIDTH + LEADER_GAP + 32 || x < W / 2;
        const lx = Math.min(
          Math.max(right ? x + LEADER_GAP : x - LEADER_GAP - LABEL_WIDTH, 24),
          W - LABEL_WIDTH - Math.max(24, (W - 1320) / 2),
        );
        const ly = Math.min(Math.max(y - 190, 168), H - 260);
        el.style.transform = `translate(${x}px, ${y}px)`;
        const line = el.querySelector("line");
        line?.setAttribute("x2", String(right ? lx - x : lx - x + LABEL_WIDTH));
        line?.setAttribute("y2", String(ly - y + 40));
        const label = el.querySelector<HTMLElement>(".label");
        if (label) {
          label.style.left = `${lx - x}px`;
          label.style.top = `${ly - y}px`;
        }
      }
      if (visible !== current) {
        current = visible;
        setCaption(visible);
      }
    };

    // Callouts follow the frame the browser presents, so they stay on their parts while the
    // camera moves; without requestVideoFrameCallback they follow currentTime on each paint.
    const synced = "requestVideoFrameCallback" in video;
    const onFrame = (_now: number, presented: VideoFrameCallbackMetadata) => {
      frame = video.requestVideoFrameCallback(onFrame);
      place(presented.mediaTime);
    };
    const onPaint = () => {
      frame = requestAnimationFrame(onPaint);
      place(video.currentTime);
    };
    const follow = () => {
      if (frame) return;
      frame = synced ? video.requestVideoFrameCallback(onFrame) : requestAnimationFrame(onPaint);
    };
    const unfollow = () => {
      if (synced) video.cancelVideoFrameCallback(frame);
      else cancelAnimationFrame(frame);
      frame = 0;
    };
    const onResize = () => place(video.currentTime);

    // The film is attached only while it should play and detached when the page is left:
    // a half-downloaded film kept in the back-forward cache blocks the next visit's copy.
    const run = () => {
      if (!wanted.current || !inView) return;
      if (!video.getAttribute("src")) video.src = pickFilm(video);
      video.play().catch((error: DOMException) => {
        // Scrolling away or leaving the page interrupts play(); only a refusal stops the film.
        if (error.name === "AbortError") return;
        wanted.current = false;
        setPlaying(false);
      });
      follow();
    };
    const hold = () => {
      video.pause();
      unfollow();
    };
    const release = () => {
      hold();
      if (!video.getAttribute("src")) return;
      video.removeAttribute("src");
      video.load();
    };
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) run();
    };
    controls.current = { run, hold };
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      if (inView) run();
      else hold();
    });
    observer.observe(section);
    window.addEventListener("pagehide", release);
    window.addEventListener("resize", onResize);
    window.addEventListener("pageshow", onShow);
    return () => {
      controller.abort();
      observer.disconnect();
      window.removeEventListener("pagehide", release);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pageshow", onShow);
      controls.current = null;
      release();
    };
  }, []);

  const toggle = () => {
    wanted.current = !wanted.current;
    setPlaying(wanted.current);
    if (wanted.current) controls.current?.run();
    else controls.current?.hold();
  };
  const shown = caption ? CALLOUTS[caption] : null;

  return (
    <section className="hero" ref={hero} aria-labelledby="hero-title">
      <video
        ref={film}
        id="film"
        muted
        playsInline
        loop
        preload="none"
        poster={posterUrl}
        aria-label="One continuous shot of the Origin89 Controller: the cover lifts, the camera moves in to the ESP32-C6 antenna, light runs along the board's traces, close views of the STM32G0B1 and the RS-485 transceivers, then the parts separate and turn, come back together and the closed Controller flips."
      />
      <div className="callouts" ref={layer} aria-hidden="true">
        {Object.entries(CALLOUTS).map(([key, callout]) => (
          <div
            key={key}
            className="callout"
            ref={(el) => {
              callouts.current[key] = el;
            }}
          >
            <svg width="1" height="1" aria-hidden="true">
              <line x1="0" y1="0" />
              <circle className="ring" r="9" />
              <circle r="4" />
            </svg>
            <div className="label">
              <span className="mono">{callout.code}</span>
              <b>{callout.name}</b>
              <span>{callout.text}</span>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="film-toggle"
        onClick={toggle}
        aria-label={playing ? "Pause the film" : "Play the film"}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d={playing ? "M3 2h3v10H3zM8 2h3v10H8z" : "M4 2l8 5-8 5z"} fill="currentColor" />
        </svg>
      </button>
      <div className="hero-copy">
        <div className="o89-wrap">
          <p className="hero-caption" aria-live="off">
            {shown ? (
              <>
                <span className="mono">{shown.code}</span>
                <span>
                  <b>{shown.name}.</b> {shown.text}
                </span>
              </>
            ) : null}
          </p>
          <div className="hero-main">
            <h1 id="hero-title" className="h-xl">
              <span>One controller</span> <span>for the gear you already own.</span>
            </h1>
            <p className="lede">
              Origin89 reads the charge controller, inverter, batteries, probes and generator at
              your site, runs your rules there and keeps every reading with its age.
            </p>
          </div>
          <div className="hero-side">
            <div className="hero-actions">
              <a className="o89-plate o89-plate-action" href="#waitlist">
                Join the waitlist
              </a>
              <a className="o89-text-link" href="#device">
                See every port <ArrowIcon />
              </a>
            </div>
            <p className="status">
              <i aria-hidden="true" />
              <b>In active development.</b> Not for sale yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
