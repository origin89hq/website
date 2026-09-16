import { useEffect, useRef, useState } from "react";
import filmUrl from "../../../assets/home/hero.mp4?url";
import filmSmallUrl from "../../../assets/home/hero-720.mp4?url";
import anchorsUrl from "../../../assets/home/hero-anchors.json?url";
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

export function HeroFilm() {
  const film = useRef<HTMLVideoElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const callouts = useRef<Record<string, HTMLDivElement | null>>({});
  const [playing, setPlaying] = useState(true);
  const [caption, setCaption] = useState<string | null>(null);

  useEffect(() => {
    const video = film.current;
    if (!video) return;
    video.muted = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.pause();
      setPlaying(false);
    } else void video.play().catch(() => setPlaying(false));

    let track: Track | null = null;
    let frame = 0;
    let current: string | null = null;
    const controller = new AbortController();
    fetch(anchorsUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Track | null) => {
        track = data;
      })
      .catch(() => {});

    const place = () => {
      frame = requestAnimationFrame(place);
      const host = layer.current;
      if (!track || !host || !video.duration) return;
      const f = Math.floor(video.currentTime * track.fps) % track.frames;
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
        const ly = Math.min(Math.max(y - 190, 128), H - 260);
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
    frame = requestAnimationFrame(place);
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
    };
  }, []);

  const toggle = () => {
    const video = film.current;
    if (!video) return;
    if (video.paused) {
      setPlaying(true);
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };
  const shown = caption ? CALLOUTS[caption] : null;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <video
        ref={film}
        id="film"
        muted
        playsInline
        loop
        preload="metadata"
        poster={posterUrl}
        aria-label="Film of the Origin89 Controller: the cover lifts, light runs along the board's traces, close views of the STM32G0B1, the ESP32-C6 antenna and the RS-485 transceivers, then an exploded view."
      >
        <source src={filmSmallUrl} type="video/mp4" media="(max-width: 900px)" />
        <source src={filmUrl} type="video/mp4" />
      </video>
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
          <h1 id="hero-title" className="h-xl">
            One controller for the gear you already own.
          </h1>
          <p className="lede">
            Origin89 reads the charge controller, inverter, batteries, probes and generator already
            on your wall. It runs your rules at the site and keeps every reading with its age.
          </p>
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
            Prototype. Board revision A is on the bench now.
          </p>
        </div>
      </div>
    </section>
  );
}
