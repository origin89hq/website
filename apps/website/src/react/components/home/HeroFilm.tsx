import { useEffect, useRef, useState } from "react";
import filmUrl from "../../../assets/home/hero.mp4?url";
import filmSmallUrl from "../../../assets/home/hero-720.mp4?url";
import filmAv1Url from "../../../assets/home/hero-av1.mp4?url";
import posterUrl from "../../../assets/home/hero-poster.webp?url";
import { ArrowIcon } from "./icons";

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
  const wanted = useRef(true);
  const controls = useRef<{ run: () => void; hold: () => void } | null>(null);
  const [state, setState] = useState<"playing" | "paused" | "ended">("playing");

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
      setState("paused");
    }

    let inView = false;
    let ended = false;

    // The film plays once and rests on its last frame, the closed Controller it opened on.
    // It is attached only while it should play and detached when the page is left: a
    // half-downloaded film kept in the back-forward cache blocks the next visit's copy.
    const run = () => {
      if (!wanted.current || !inView) return;
      if (!video.getAttribute("src")) video.src = pickFilm(video);
      if (ended) {
        ended = false;
        video.currentTime = 0;
      }
      setState("playing");
      video.play().catch((error: DOMException) => {
        // Scrolling away or leaving the page interrupts play(); only a refusal stops the film.
        if (error.name === "AbortError") return;
        wanted.current = false;
        setState("paused");
      });
    };
    const onEnded = () => {
      ended = true;
      setState("ended");
    };
    const hold = () => video.pause();
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
    // Coming back to the hero after scrolling fully past it replays a finished film and
    // resumes an unfinished one.
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      if (inView) run();
      else hold();
    });
    video.addEventListener("ended", onEnded);
    observer.observe(section);
    window.addEventListener("pagehide", release);
    window.addEventListener("pageshow", onShow);
    return () => {
      observer.disconnect();
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("pagehide", release);
      window.removeEventListener("pageshow", onShow);
      controls.current = null;
      release();
    };
  }, []);

  const toggle = () => {
    if (state === "playing") {
      wanted.current = false;
      setState("paused");
      controls.current?.hold();
    } else {
      wanted.current = true;
      controls.current?.run();
    }
  };
  const label = { playing: "Pause the film", paused: "Play the film", ended: "Replay the film" }[
    state
  ];

  return (
    <section className="hero" ref={hero} aria-labelledby="hero-title">
      <video
        ref={film}
        id="film"
        muted
        playsInline
        preload="none"
        poster={posterUrl}
        aria-label="One continuous shot of the Origin89 Controller: the cover lifts, the camera moves in to the ESP32-C6 antenna, light runs along the board's traces, close views of the STM32G0B1 and the RS-485 transceivers, then the parts separate and turn, come back together and the closed Controller flips."
      />
      <button type="button" className="film-toggle" onClick={toggle} aria-label={label}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          {state === "ended" ? (
            <path
              d="M11.5 7A4.5 4.5 0 1 1 7 2.5h1.5M7 .5l2 2-2 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d={state === "playing" ? "M3 2h3v10H3zM8 2h3v10H8z" : "M4 2l8 5-8 5z"}
              fill="currentColor"
            />
          )}
        </svg>
      </button>
      <div className="hero-copy">
        <div className="o89-wrap">
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
