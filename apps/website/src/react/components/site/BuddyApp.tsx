import { ArrowUpRight, ChartNoAxesCombined, House, SlidersHorizontal, Wrench } from "lucide-react";
import { type MouseEvent, useEffect, useId, useRef, useState } from "react";
import type { JournalSite } from "../../lib/journal-sites";
import { BuddyAvatar } from "../buddy/BuddyAvatar";
import { EnergyHistory } from "./EnergyHistory";
import { RemoteAppScene } from "./RemoteAppScene";
import { SiteControl } from "./SiteControl";
import { SolarDashboard } from "./SolarDashboard";
export interface BuddyAppProps {
  theme?: string;
  presentation?: "phone" | "preview";
  scene?: "overview" | "energy" | "control" | "care";
  site?: JournalSite;
  buddyUrl: string;
}
export function BuddyApp({
  theme = "journal",
  presentation = "phone",
  scene: initialScene = "overview",
  site = "cottage",
  buddyUrl,
}: BuddyAppProps) {
  const id = useId();
  const [scene, setScene] = useState(initialScene);
  const [chemistry, setChemistry] = useState("unknown");
  const [answer, setAnswer] = useState("Choose a question to preview Buddy’s explanation.");
  const dialog = useRef<HTMLDialogElement>(null);
  const [notificationHost, setNotificationHost] = useState<HTMLDivElement | null>(null);
  const appContent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scene) appContent.current?.scrollTo({ top: 0 });
  }, [scene]);
  useEffect(() => setScene(initialScene), [initialScene]);
  const settings = {
    cottage: {
      name: "Lac des Pins",
      initials: "LP",
      status: "Sample cottage · Readings 8 sec ago",
      greeting: "Morning, David.",
      intro: "Let’s check on the cottage.",
    },
    mining: {
      name: "North pit / Utilities",
      initials: "NP",
      status: "Sample mining site · Readings 30 sec ago",
      greeting: "Here’s the site.",
      intro: "Power, pumps and the next check.",
    },
    telecom: {
      name: "Tundra relay / NU",
      initials: "NU",
      status: "Sample telecom site · Last heard 12 min ago",
      greeting: "Let’s check the relay.",
      intro: "Power, temperature and connection.",
    },
  }[site];
  const questions =
    site === "cottage"
      ? [
          ["loads", "When should I run bigger appliances?"],
          ["battery", "How do I save battery for tonight?"],
          ["water", "Does my battery need water?"],
        ]
      : site === "mining"
        ? [
            ["alarm", "What is behind this alarm?"],
            ["fuel", "How much running time is left?"],
            ["water", "Does this battery need water?"],
          ]
        : [
            ["link", "What does a missing update mean?"],
            ["reserve", "How much backup time is left?"],
            ["water", "Does this battery need water?"],
          ];
  const answers: Record<string, string> = {
    automation:
      "Buddy could help identify the equipment, find its documented limits and draft a rule from your intent. You would review its conditions and affected circuits. The local controller would validate measurements, permissions and output limits before acting. Missing inputs cannot become permission to switch equipment. This is a design preview; no rule or command has been sent.",
    alarm:
      "The sample level alarm reported high 30 seconds ago. That identifies the input needing attention, not the cause. Review the sensor reading and pump status, then follow the site’s operating procedure. Buddy has not changed any equipment controls.",
    fuel: "The last tank reading is 62%. I would also need tank capacity, the usable reserve and the generator’s recent fuel consumption to estimate running time. Use the site’s refuelling procedure rather than treating a percentage as a runtime estimate.",
    link: "The feed last updated 12 minutes ago. Battery, shelter temperature and generator state are last-known readings. I cannot confirm the current condition or identify the cause from that silence alone. Follow the site’s gateway, backhaul and power checks.",
    reserve:
      "A last-known battery percentage is not enough to calculate backup time. I would need fresh readings, usable battery capacity, current load and the configured reserve. Current site condition is unknown while the feed is stale.",
    loads:
      "When solar output is strong, using appliances directly from that power can reduce how much energy you take from the battery. Check the appliance rating and your inverter’s limits. A cloud can change the available power quickly.",
    battery:
      "Start with flexible loads: laundry, tools or other heavier jobs you can move into solar-producing hours. Keep essential loads running. I would need your battery capacity, reserve settings and recent usage to estimate how much the night will need.",
    water:
      "Only some batteries need watering. Identify the exact make and model first. Serviceable flooded lead-acid batteries may need water according to the manufacturer’s guide. Never add water to sealed AGM or gel batteries. Lithium batteries do not need watering.",
  };
  const careContent: Record<string, string[]> = {
    unknown: [
      "FIRST, IDENTIFY YOUR BATTERY",
      "Let’s check the label.",
      "Find the make, model and battery type. That tells us which maintenance guide applies.",
    ],
    flooded: [
      "FLOODED BATTERY CARE",
      "Time for an electrolyte check?",
      "These batteries can need watering. Confirm the exact model, then follow its manufacturer’s safety, inspection and watering instructions.",
    ],
    agm: [
      "SEALED BATTERY CARE",
      "No watering needed.",
      "Do not open sealed AGM or gel batteries or add water. Use the maintenance and charging guidance for your exact model.",
    ],
    lithium: [
      "LITHIUM BATTERY CARE",
      "No watering needed.",
      "Check your model’s charging limits and temperature requirements. Follow its documentation for storage and maintenance.",
    ],
  };

  function handleAction(event: MouseEvent<HTMLElement>) {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    if (button.dataset.switch) {
      setScene(button.dataset.switch as typeof scene);
      if (presentation === "preview") event.currentTarget.scrollIntoView({ block: "start" });
    }
    if (button.hasAttribute("data-ask")) {
      setAnswer("Choose a question to preview Buddy’s explanation.");
      dialog.current?.showModal();
    }
    if (button.classList.contains("dialog-close")) dialog.current?.close();
    if (button.dataset.answer) {
      setAnswer(answers[button.dataset.answer]);
      dialog.current?.showModal();
    }
  }
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Native child buttons dispatch clicks for both pointer and keyboard activation.
    <section
      className={`buddy-app energy-app app-${theme} app-site-${site} ${presentation === "preview" ? "app-preview" : ""}`}
      data-buddy-app
      data-app-site={site}
      onClick={handleAction}
      aria-label={
        presentation === "preview"
          ? "Origin89 Offgrid app preview"
          : "Origin89 Offgrid mobile app concept"
      }
    >
      <div
        className="app-notification-slot"
        ref={setNotificationHost}
        aria-live="polite"
        aria-atomic="true"
      />
      <div className="phone-status" aria-hidden="true">
        <span>13:40</span>
        <span>▮▮▮ &nbsp; ◒ &nbsp; ▰</span>
      </div>
      <header className="app-top">
        <div>
          <span className="app-wordmark">
            ORIGIN89 <b>OFFGRID</b>
          </span>
          <p>
            {settings.name} <span aria-hidden="true">⌄</span>
          </p>
        </div>
        <span className="site-avatar">{settings.initials}</span>
      </header>
      <div className={`app-demo ${site === "telecom" ? "is-stale" : ""}`}>
        <span className="live-dot"></span>
        {settings.status}
      </div>
      <div className="app-content" ref={appContent}>
        <div className="buddy-intro">
          <BuddyAvatar src={buddyUrl} alt="Buddy, your Origin89 assistant" size={80} />
          <div>
            <span>BUDDY / YOUR AI ASSISTANT</span>
            <strong>{settings.greeting}</strong>
            <p>{settings.intro}</p>
          </div>
        </div>
        <div className="app-panel" data-panel="overview" hidden={scene !== "overview"}>
          {site === "cottage" ? (
            <SolarDashboard />
          ) : (
            <RemoteAppScene site={site} panel="overview" />
          )}
        </div>
        <div className="app-panel" data-panel="energy" hidden={scene !== "energy"}>
          {site === "cottage" ? (
            <>
              <h2>
                Solar in.
                <br />
                Energy out.
              </h2>
              <p className="buddy-explanation">
                Solar above the line. Consumption below. Slide across the chart to compare any
                reading.
              </p>
              <EnergyHistory />
              <p className="app-insight">
                About <strong>1.25 kW</strong> is left before charging losses. Check a large
                appliance’s power draw before starting it.
              </p>
              <button className="inline-question" data-answer="loads" type="button">
                Why does timing matter? <span>↗</span>
              </button>
            </>
          ) : (
            <RemoteAppScene site={site} panel="energy" />
          )}
        </div>
        <div className="app-panel" data-panel="control" hidden={scene !== "control"}>
          <SiteControl
            site={site}
            notificationHost={scene === "control" ? notificationHost : null}
          />
        </div>
        <div className="app-panel" data-panel="care" hidden={scene !== "care"}>
          <h2>
            A little care.
            <br />A longer working life.
          </h2>
          <p className="buddy-explanation">
            I’ll tailor maintenance reminders to the battery you actually have.
          </p>
          <label className="battery-type">
            Battery type{" "}
            <select
              aria-label="Battery type for maintenance advice"
              value={chemistry}
              onChange={(event) => setChemistry(event.target.value)}
            >
              <option value="unknown">Not sure yet</option>
              <option value="flooded">Serviceable flooded lead-acid</option>
              <option value="agm">Sealed AGM / gel</option>
              <option value="lithium">Lithium</option>
            </select>
          </label>
          <div className="care-note" aria-live="polite">
            <span className="care-tag">{careContent[chemistry][0]}</span>
            <h3>{careContent[chemistry][1]}</h3>
            <p>{careContent[chemistry][2]}</p>
          </div>
          <div className="care-reminder">
            <span aria-hidden="true">◷</span>
            <p>
              <strong>Reminders that fit your equipment.</strong>
              <br />
              Use the maker’s schedule, then keep a record of each check.
            </p>
          </div>
          <a
            className="inline-question care-source"
            href="https://www.trojanbattery.com/resources/guides-manuals-and-warranties"
            target="_blank"
            rel="noreferrer"
          >
            Example manufacturer guides <span>↗</span>
          </a>
        </div>
      </div>
      <button className="ask-buddy" type="button" data-ask>
        <span>Ask Buddy a question</span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </button>
      <nav className="app-nav" aria-label="App scenes">
        {(
          [
            ["overview", "Overview", House],
            ["energy", site === "cottage" ? "Energy" : "Site", ChartNoAxesCombined],
            ["control", "Control", SlidersHorizontal],
            ["care", "Care", Wrench],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            data-switch={key}
            aria-current={scene === key ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <div className="home-indicator" aria-hidden="true"></div>
      <dialog ref={dialog} className="buddy-dialog" aria-labelledby={`${id}-dialog-title`}>
        <button className="dialog-close" type="button" aria-label="Close Buddy conversation">
          ×
        </button>
        <BuddyAvatar src={buddyUrl} alt="" size={62} />
        <span className="app-eyebrow">BUDDY / EXAMPLE CONVERSATION</span>
        <h2 id={`${id}-dialog-title`}>
          What would you
          <br />
          like to understand?
        </h2>
        <div className="prompt-options">
          {questions.map(([key, label]) => (
            <button key={key} type="button" data-answer={key}>
              {label}
            </button>
          ))}
        </div>
        <p className="buddy-answer" aria-live="polite">
          {answer}
        </p>
        <small>This is a scripted design preview.</small>
      </dialog>
    </section>
  );
}
