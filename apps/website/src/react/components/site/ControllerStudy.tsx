import { ArrowDown, ArrowUpRight, Layers2, Minus, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  studyBoard,
  studyBoardSmall,
  studyClosed,
  studyClosedSmall,
  studyCover,
  studyCoverSmall,
} from "../../lib/react-assets";
import { siteConfig } from "../../lib/site-config";

const connections = [
  {
    id: "inverter",
    name: "Inverter",
    title: "Connect your inverter.",
    interface: "RS-485",
    description:
      "Start with its exact model and register map. A matching connector alone does not establish compatibility.",
    action: "Find your inverter",
    query: "inverter",
    x: "58%",
    y: "73%",
  },
  {
    id: "battery",
    name: "Battery",
    title: "Get to know your battery.",
    interface: "CAN",
    description:
      "Check the battery’s BMS protocol and available readings. Support is verified model by model.",
    action: "Find your battery",
    query: "battery",
    x: "72%",
    y: "68%",
  },
  {
    id: "sensors",
    name: "Sensors",
    title: "Keep temperature in view.",
    interface: "1-WIRE",
    description:
      "Explore the sensor options and documented interfaces for the places you want to monitor.",
    action: "Explore temperature sensors",
    query: "temperature",
    x: "83%",
    y: "64%",
  },
] as const;

export function ControllerStudy() {
  const root = useRef<HTMLElement>(null);
  const setReveal = useRef<(value: number) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [selected, setSelected] = useState(0);
  const detailsId = useId();
  const connection = connections[selected];

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const section = element.closest<HTMLElement>(".journal-context");
    const opening = section?.querySelector<HTMLElement>(".journal-opening");
    const media = matchMedia(
      "(min-width: 1000px) and (min-height: 820px) and (prefers-reduced-motion: no-preference)",
    );
    let disposed = false;
    let frame = 0;
    let available = false;
    let manual: { scroll: number } | null = null;

    function apply(progress: number) {
      element?.style.setProperty("--controller-reveal", progress.toFixed(4));
      setOpen(progress > 0.65);
    }
    function update() {
      frame = 0;
      if (!section || !available) return;
      if (manual && Math.abs(scrollY - manual.scroll) > 24) manual = null;
      if (manual || !section.hasAttribute("data-controller-scroll")) return;
      element?.removeAttribute("data-manual");
      const start = section.getBoundingClientRect().top - 16;
      apply(Math.max(0, Math.min(1, -start / 420)));
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function configure() {
      if (!available || !section || !opening) return;
      const canScroll = media.matches && opening.offsetHeight + 32 < innerHeight;
      const wasScrolling = section.hasAttribute("data-controller-scroll");
      section.toggleAttribute("data-controller-scroll", canScroll);
      if (canScroll) {
        schedule();
      } else if (wasScrolling) {
        manual = { scroll: scrollY };
        apply(Number(element?.style.getPropertyValue("--controller-reveal")) > 0.65 ? 1 : 0);
      }
    }
    setReveal.current = (progress) => {
      manual = { scroll: scrollY };
      element.setAttribute("data-manual", "true");
      apply(progress);
    };
    Promise.all(
      Array.from(element.querySelectorAll<HTMLImageElement>("img")).map((img) => img.decode()),
    )
      .then(() => {
        if (disposed) return;
        available = true;
        setReady(true);
        configure();
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    const resize = new ResizeObserver(configure);
    if (opening) resize.observe(opening);
    media.addEventListener("change", configure);
    window.addEventListener("resize", configure);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      media.removeEventListener("change", configure);
      window.removeEventListener("resize", configure);
      window.removeEventListener("scroll", schedule);
      section?.removeAttribute("data-controller-scroll");
      setReveal.current = () => {};
    };
  }, []);

  function selectConnection(index: number) {
    setSelected(index);
    setReveal.current(1);
  }

  return (
    <figure
      className="controller-study"
      ref={root}
      data-ready={ready}
      data-open={open}
      data-zoomed={zoomed}
    >
      <div className="controller-study-heading">
        <span className="micro">THE CONTROLLER</span>
        <div className="controller-study-controls">
          <button
            type="button"
            aria-label="Zoom controller"
            aria-pressed={zoomed}
            disabled={!ready}
            onClick={() => setZoomed(!zoomed)}
          >
            {zoomed ? (
              <Minus size={16} aria-hidden="true" />
            ) : (
              <Plus size={16} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label="Show controller interior"
            aria-pressed={open}
            disabled={!ready}
            onClick={() => setReveal.current(open ? 0 : 1)}
          >
            <Layers2 size={14} aria-hidden="true" />
            {open ? "Close enclosure" : "See inside"}
          </button>
        </div>
      </div>
      <div className="controller-study-stage">
        <div className="controller-model">
          <img
            className="controller-fallback"
            src={studyClosed}
            srcSet={`${studyClosedSmall} 640w, ${studyClosed} 1200w`}
            sizes="(max-width: 760px) 340px, 520px"
            alt={
              open
                ? "Origin89 Controller CAD concept with the circuit board exposed"
                : "Origin89 Controller CAD concept with its enclosure and pluggable terminals"
            }
            width="1200"
            height="1350"
            fetchPriority="high"
          />
          <div className="controller-board">
            <img
              src={studyBoard}
              srcSet={`${studyBoardSmall} 640w, ${studyBoard} 1200w`}
              sizes="(max-width: 760px) 340px, 520px"
              alt=""
              width="1200"
              height="1350"
            />
          </div>
          <img
            className="controller-cover"
            src={studyCover}
            srcSet={`${studyCoverSmall} 640w, ${studyCover} 1200w`}
            sizes="(max-width: 760px) 340px, 520px"
            alt=""
            width="1200"
            height="1350"
          />
          <div className="controller-points">
            {connections.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="controller-hotspot"
                style={{ left: item.x, top: item.y }}
                aria-label={`Explore ${item.name.toLowerCase()} connection`}
                aria-pressed={selected === index}
                aria-controls={detailsId}
                disabled={!ready}
                onClick={() => selectConnection(index)}
              >
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
        <span className="controller-study-hint">
          <ArrowDown size={12} aria-hidden="true" />
          Scroll to open
        </span>
      </div>
      <fieldset className="controller-connections" aria-label="Explore controller connections">
        {connections.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === index}
            aria-controls={detailsId}
            disabled={!ready}
            onClick={() => selectConnection(index)}
          >
            {item.name}
          </button>
        ))}
      </fieldset>
      <div
        className="controller-connection-detail"
        id={detailsId}
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <h2>{connection.title}</h2>
          <span className="micro">{connection.interface}</span>
        </div>
        <p>{connection.description}</p>
        <a href={`/equipment/?q=${connection.query}`}>
          {connection.action}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
      <figcaption>
        <span>
          {failed ? "Interior unavailable · CAD concept" : "CAD concept · In development"}
        </span>
        <a href={`${siteConfig.repositories.hardware}/tree/main/boards/controller-a`}>
          Inspect the board files
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
