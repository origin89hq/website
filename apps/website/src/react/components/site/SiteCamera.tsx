import { ArrowRight, Bell, Expand, Lightbulb, Maximize, Minimize, ScanLine, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { JournalSite } from "../../lib/journal-sites";
import { journalAssets } from "../../lib/react-assets";

export function SiteCamera({
  site,
  notificationHost,
}: {
  site: JournalSite;
  notificationHost: HTMLDivElement | null;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [event, setEvent] = useState<"clear" | "person" | "offline">("clear");
  const stale = site === "telecom" || event === "offline";
  const person = !stale && event === "person";
  const label = "Gate 2";
  return (
    <section className="site-camera" aria-label="Camera integration concept">
      <div className="control-section-heading">
        <h3>Connected cameras</h3>
        <span>{stale ? "Last frame · 12 min ago" : "Illustrative frame"}</span>
      </div>
      <button
        type="button"
        className="camera-frame"
        aria-label={`Inspect ${label.toLowerCase()} camera`}
        aria-haspopup="dialog"
        onClick={() => {
          setZoom(false);
          dialog.current?.showModal();
        }}
      >
        <img
          src={journalAssets[site]}
          alt={`Illustrative camera view of the ${label.toLowerCase()}`}
          loading="lazy"
        />
        <span className="camera-frame-top">
          <span>CAM 02 · {label}</span>
          <span>{stale ? "13:28 · last frame" : "13:40 · sample"}</span>
        </span>
        <span className="camera-frame-bottom">
          <span>{stale ? "No current camera connection" : "Gate 2 · Camera event source"}</span>
          <Expand size={16} />
        </span>
      </button>
      <div className="camera-connection">
        <span>
          Site network <ArrowRight size={12} /> Camera 02
        </span>
        <span>{stale ? "Connection unavailable" : "Example connection"}</span>
      </div>
      <article className="camera-automation" aria-label="Gate 2 camera automation">
        <div className="camera-rule-heading">
          <ScanLine size={19} strokeWidth={1.5} />
          <h4>Someone at Gate 2.</h4>
        </div>
        <div className="camera-trigger">
          <small>WHEN</small>
          <strong>Person detected</strong>
          <span>Camera 02 · Gate 2 zone</span>
        </div>
        <div className="camera-rule-actions">
          <small>THEN</small>
          <span>
            <Lightbulb size={16} /> Gate lights on for 2 minutes
          </span>
          <span>
            <Bell size={16} /> Notify me with the event frame
          </span>
        </div>
        {site !== "telecom" && (
          <fieldset className="rule-scenarios" aria-label="Camera event sample">
            <legend>Try a camera event</legend>
            {(
              [
                ["person", "Person at gate"],
                ["clear", "No event"],
                ["offline", "Offline"],
              ] as const
            ).map(([value, title]) => (
              <button
                key={value}
                type="button"
                aria-pressed={event === value}
                onClick={() => {
                  setEvent(value);
                  setDismissed(false);
                }}
              >
                {title}
              </button>
            ))}
          </fieldset>
        )}
        <div className="camera-rule-result" aria-live="polite" data-triggered={person}>
          <strong>
            {stale
              ? "Waiting for camera connection"
              : person
                ? "Event matches the rule"
                : "Waiting for a person event"}
          </strong>
          <p>
            {stale
              ? "The current view is unknown. A lost connection does not count as an empty gate."
              : person
                ? "In this example, the controller would request the lights and a notification would include the event frame."
                : "Connect a supported site camera and use its detection events as rule inputs."}
          </p>
          {person && (
            <ol className="camera-event-log">
              <li>
                <time>13:40:08</time>
                <span>Camera 02 reports a person at Gate 2</span>
              </li>
              <li>
                <time>13:40:08</time>
                <span>Rule matches · Request gate lights</span>
              </li>
              <li>
                <time>13:40:09</time>
                <span>Notification preview · Someone at Gate 2</span>
              </li>
            </ol>
          )}
        </div>
        <p className="camera-concept-note">
          Simulated event and image. Camera support and event detection depend on the connected
          equipment.
        </p>
      </article>
      {person &&
        !dismissed &&
        notificationHost &&
        createPortal(
          <aside className="phone-notification" aria-label="Sample phone notification">
            <button
              className="notification-open"
              type="button"
              aria-label="Open Gate 2 notification"
              onClick={() => {
                setZoom(false);
                dialog.current?.showModal();
              }}
            >
              <span className="notification-app">
                <span>
                  <Bell size={13} /> Origin89 Offgrid
                </span>
                <small>now · sample</small>
              </span>
              <span className="notification-content">
                <span>
                  <strong>Someone at Gate 2</strong>
                  <span>Person detected · {site === "cottage" ? "Lac des Pins" : "North pit"}</span>
                  <small>Tap to view camera event</small>
                </span>
                <img src={journalAssets[site]} alt="Sample camera event thumbnail" />
              </span>
            </button>
            <button
              className="notification-dismiss"
              type="button"
              aria-label="Dismiss Gate 2 notification"
              onClick={() => setDismissed(true)}
            >
              <X size={15} />
            </button>
          </aside>,
          notificationHost,
        )}
      <dialog ref={dialog} className="camera-inspector" aria-labelledby={`${id}-title`}>
        <header>
          <h2 id={`${id}-title`}>{label}</h2>
          <button
            type="button"
            aria-label="Close camera view"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        <div className="camera-inspector-image" data-zoom={zoom}>
          <img
            src={journalAssets[site]}
            alt={`Enlarged illustrative view of the ${label.toLowerCase()}`}
          />
        </div>
        <div className="camera-inspector-tools">
          <span>
            {stale
              ? "Last frame 13:28 · Current view unavailable"
              : "Sample image · Not a live feed"}
          </span>
          <button
            type="button"
            aria-label="Zoom camera image"
            aria-pressed={zoom}
            onClick={() => setZoom(!zoom)}
          >
            {zoom ? <Minimize size={17} /> : <Maximize size={17} />}
            {zoom ? "Fit" : "Zoom"}
          </button>
        </div>
        <p>
          Connect a supported camera on the site network, name its zone, and use its events in a
          rule. This preview uses a sample image; no camera is connected.
        </p>
      </dialog>
    </section>
  );
}
