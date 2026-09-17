import plateWhite from "@origin89/brand/logos/plate-89-white.svg?url";
import { type FormEvent, lazy, type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import cottage from "../../../assets/home/audience-3d-cottage.webp?url";
import mine from "../../../assets/home/audience-3d-mine.webp?url";
import telecom from "../../../assets/home/audience-3d-telecom.webp?url";
import gerberBoard from "../../../assets/home/gerber-board-dim.webp?url";
import gerberU7 from "../../../assets/home/gerber-u7.webp?url";
import traceBoard from "../../../assets/home/trace-mask-board.webp?url";
import traceU7 from "../../../assets/home/trace-mask-u7.webp?url";
import { journalAssets } from "../../lib/react-assets";
import { siteConfig } from "../../lib/site-config";
import { BuddyAvatar } from "../buddy/BuddyAvatar";
import { SiteFooter, SiteHeader } from "../site/SiteChrome";
import { AppPreview } from "./AppPreview";
import { Connections } from "./Connections";
import { DualMcu } from "./DualMcu";
import { HeroFilm } from "./HeroFilm";
import { Integrations } from "./Integrations";
import { ArrowIcon, MarkIcon, SpecIcons } from "./icons";
import { PortExplorer } from "./PortExplorer";
import { Viewer3D } from "./Viewer3D";

const BuddyWorkspace = lazy(() => import("../buddy/BuddyWorkspace"));

// Sections below the first screen fade in from a visible default; nothing waits on the observer to exist.
function useReveal() {
  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.remove("pre");
            observer.unobserve(entry.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of document.querySelectorAll(".home .reveal"))
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add("pre");
        observer.observe(el);
      }
    return () => observer.disconnect();
  }, []);
}

const Traces = ({ mask }: { mask: string }) => (
  <div className="traces" style={{ ["--mask" as string]: `url(${mask})` }} />
);

function Statement() {
  return (
    <section className="section statement" aria-labelledby="statement-title">
      <div className="o89-wrap statement-inner">
        <div className="statement-field" aria-hidden="true">
          <img src={gerberBoard} alt="" loading="lazy" />
          <Traces mask={traceBoard} />
        </div>
        <h2 id="statement-title" className="reveal">
          <span>Every bus.</span>
          <span>One board.</span>
          <span>Decisions stay</span>
          <span>on site.</span>
        </h2>
        <p className="lede reveal">
          Most off-grid walls grow one box at a time: a charge controller from one maker, an
          inverter from another, a meter, a generator in the shed. Nothing ties them together. The
          Controller wires into all of them and becomes the management layer, on one 12 V board that
          doesn’t need the internet to decide.
        </p>
        <div className="bus-line reveal">
          {[
            ["3 × RS-485", "Modbus gear"],
            ["CAN", "Battery BMS"],
            ["2 × VE.Direct", "Monitors, chargers"],
            ["1-Wire", "Temperature"],
            ["4–20 mA", "Tank level"],
            ["11 mA", "Idle, radio off"],
          ].map(([value, label]) => (
            <div key={value}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="field-note">
          Behind this text: the real top copper of board A, from its Gerbers.
        </p>
      </div>
    </section>
  );
}

const AUDIENCES = [
  {
    img: cottage,
    alt: "Studio miniature of a cottage site: a cabin with lit windows, a ground-mounted solar rack, a woodshed with the generator and a propane tank, signal paths running to the cabin",
    title: "Cottages and camps",
    text: "A power wall built over the years, a generator in the shed and a fridge full of food. See it all from town.",
    points: [
      "Budget and mixed-brand gear",
      "Flooded lead-acid or lithium banks",
      "Two-wire generator start",
    ],
  },
  {
    img: telecom,
    alt: "Studio miniature of a remote telecom site: an equipment shelter, a lattice tower with antennas and a beacon, a genset and a fuel tank inside a fence",
    title: "Remote telecom shelters",
    text: "Batteries, a genset and a tower hours from the nearest road. Know the site’s state before the truck leaves.",
    points: [
      "Battery and generator state between visits",
      "Readings that show their age",
      "Rules that run without a link",
    ],
  },
  {
    img: mine,
    alt: "Studio miniature of a mine utility site: an arched steel building, a generator container, a battery skid, a tank and a pipe rack",
    title: "Mining utilities",
    text: "Gensets, pumps and battery banks spread across a site. Planned: several Controllers per location, in one account.",
    points: [
      "One Controller per building or skid",
      "Local control stays with each unit",
      "Planned multi-location overview",
    ],
  },
];

function Audiences() {
  return (
    <section className="section" aria-labelledby="who-title">
      <div className="o89-wrap">
        <div className="center-head reveal">
          <h2 id="who-title" className="h-l">
            Who is it for?
          </h2>
          <p className="lede">
            Anyone responsible for power at a place they can’t see from where they are.
          </p>
        </div>
        <div className="audiences">
          {AUDIENCES.map((a) => (
            <article className="audience reveal" key={a.title}>
              <figure>
                <img src={a.img} alt={a.alt} loading="lazy" />
              </figure>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <ul>
                {a.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Artifact({ title, file, children }: { title: string; file: string; children: ReactNode }) {
  return (
    <article className="artifact reveal">
      <header>
        <b>{title}</b>
        <span className="mono">{file}</span>
      </header>
      {children}
    </article>
  );
}

function OpenHardware() {
  return (
    <section className="section open" aria-labelledby="open-title">
      <div className="o89-wrap open-grid">
        <div className="open-copy reveal">
          <h2 id="open-title" className="h-l">
            Open from the board up.
          </h2>
          <p className="lede">
            The board files, Gerbers, bill of materials and firmware are public. Every part on this
            page has a designator you can look up: where it sits on the board, what it is and why it
            was chosen.
          </p>
          <p style={{ marginTop: 32 }}>
            <a className="o89-text-link" href={siteConfig.repositories.hardware}>
              Browse origin89hq/hardware <ArrowIcon />
            </a>
          </p>
        </div>
        <div className="artifacts">
          <Artifact title="Top copper around U7" file="build/2026-09-09/gerber.zip">
            <div className="gerber-glow">
              <img
                src={gerberU7}
                alt="Top copper, pads and silkscreen of board A around the STM32, drawn from the fabrication Gerbers"
                loading="lazy"
              />
              <Traces mask={traceU7} />
            </div>
          </Artifact>
          <Artifact title="Bill of materials" file="bom.csv">
            <div className="body">
              <table>
                <tbody>
                  {[
                    ["U7", "STM32G0B1RET6 · LQFP-64"],
                    ["U8", "ESP32-C6-WROOM-1-N8"],
                    ["U3–U5", "MAX13487EESA+T · RS-485"],
                    ["U9", "FM24W256 · FRAM"],
                  ].map(([ref, part]) => (
                    <tr key={ref}>
                      <td>{ref}</td>
                      <td>{part}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Artifact>
          <Artifact title="Layout rules, with their reasons" file="LAYOUT-REQUIREMENTS.md">
            <div className="body">
              <ul className="issues">
                {[
                  [
                    "A-01",
                    "100 × 125 mm, 1.6 mm FR-4. The board is the master dimension; the enclosure is printed around it.",
                  ],
                  ["A-15", "No copper on any layer under the ESP32 module’s antenna keep-out."],
                  [
                    "A-24",
                    "The 1-Wire supply leaves the board on field cable, so it gets its own 100 mA fuse. A chewed probe cable can’t take the Controller down.",
                  ],
                ].map(([id, rule]) => (
                  <li key={id}>
                    <span className="mono rule-id">{id}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Artifact>
          <Artifact title="Firmware budget" file="firmwares/o89-stm32">
            <div className="body budget">
              <p>
                The budget is <b>about 256 KB, not 512</b>. Dual-bank A/B updates keep the new image
                in one half while the other holds the one it replaces.
              </p>
              <p className="budget-fig">
                <span className="mono">binary 67,696 B</span>
                <b>25 % of one slot</b>
              </p>
            </div>
          </Artifact>
        </div>
      </div>
    </section>
  );
}

const COLUMNS = ["origin89", "cerbo", "solarassistant", "home-assistant"] as const;
type Mark = "yes" | "no" | "part";
type Cell = { mark?: Mark; text: string; note?: string; pending?: boolean };
type Row = { feature: string; cells: [Cell, Cell, Cell, Cell] };
const COMPARE: { group: string; rows: Row[] }[] = [
  {
    group: "Built to keep running",
    rows: [
      {
        feature: "Control and networking",
        cells: [
          {
            mark: "yes",
            text: "On separate chips",
            note: "A microcontroller decides; a radio module only talks, so a Wi-Fi fault can’t stop the rules",
          },
          {
            text: "One Linux computer",
            note: "Venus OS runs networking, the display and generator control on one dual-core processor",
          },
          { text: "One Raspberry Pi", note: "Linux-based image" },
          {
            text: "One Linux computer",
            note: "Home Assistant OS; HA Green uses a quad-core RK3566",
          },
        ],
      },
      {
        feature: "After a power cut",
        cells: [
          {
            mark: "yes",
            text: "No operating system to boot",
            note: "The firmware runs directly on the microcontroller; start-up time not yet measured",
          },
          {
            mark: "part",
            text: "Linux boots first",
            note: "About 2 to 2.5 min, as reported on Victron’s community forum",
          },
          { mark: "part", text: "Linux boots first", note: "Time not stated" },
          {
            mark: "part",
            text: "A few minutes",
            note: "Up to 5 min, per Home Assistant support",
          },
        ],
      },
      {
        feature: "If the controller stops",
        cells: [
          {
            mark: "yes",
            text: "The generator contact opens by itself",
            note: "A hardware watchdog on the generator board opens two relays in series. About 4.5 s by design; bench timing pending",
          },
          {
            text: "Not documented",
            note: "Its watchdog restarts the computer; no documented interlock on the generator relay",
          },
          { text: "Not stated" },
          { text: "Depends on your relay and automation" },
        ],
      },
      {
        feature: "Temperature rating",
        cells: [
          {
            mark: "yes",
            text: "Parts rated −40 to +85 °C",
            note: "Controller board. Generator board relays: −25 to +65 °C. Product rating pending testing",
          },
          { text: "−20 to +50 °C" },
          { text: "0 to 50 °C", note: "Raspberry Pi 4 board" },
          { text: "0 to 40 °C", note: "Indoor use only" },
        ],
      },
      {
        feature: "Idle draw",
        cells: [
          {
            mark: "yes",
            text: "About 0.5 W",
            note: "Under a fifth of a Cerbo GX. 38 mA at 13.1 V with Wi-Fi and Bluetooth on; 11 mA with the radio off. First bench readings",
          },
          { text: "2.8 W", note: "At 12 V, without the GX Touch display" },
          { text: "Not stated", note: "A Raspberry Pi board" },
          { text: "About 1.7 W", note: "HA Green at 12 V, plus adapters" },
        ],
      },
    ],
  },
  {
    group: "Connects to",
    rows: [
      {
        feature: "Mixed-brand gear",
        cells: [
          { mark: "yes", text: "Designed for it", note: "Each model verified before it’s listed" },
          {
            mark: "part",
            text: "Victron-first",
            note: "Some third-party PV inverters and CAN batteries",
          },
          { mark: "part", text: "20+ inverter brands", note: "EPEver and Renogy not supported" },
          { mark: "yes", text: "Anything", note: "If you write the integration" },
        ],
      },
      {
        feature: "RS-485",
        cells: [
          { mark: "yes", text: "3 ports, one bus each" },
          { mark: "part", text: "USB adapter" },
          { mark: "part", text: "USB adapter per device" },
          { mark: "part", text: "DIY adapters" },
        ],
      },
      {
        feature: "CAN and VE.Direct",
        cells: [
          { mark: "yes", text: "1 × CAN, 2 × VE.Direct" },
          { mark: "yes", text: "2 × VE.Can, 3 × VE.Direct" },
          { mark: "part", text: "USB adapter per device" },
          { mark: "part", text: "DIY" },
        ],
      },
      {
        feature: "Temperature probes",
        cells: [
          { mark: "yes", text: "1-Wire probes on one cable" },
          { mark: "yes", text: "4 inputs", note: "Victron sensors" },
          { mark: "no", text: "BMS-reported only" },
          { mark: "part", text: "DIY with ESPHome" },
        ],
      },
      {
        feature: "Tank level",
        cells: [
          { mark: "yes", text: "4–20 mA input" },
          {
            mark: "yes",
            text: "4 resistive inputs",
            note: "4–20 mA through the GX Tank 140 add-on",
          },
          { text: "Not stated" },
          { mark: "part", text: "DIY" },
        ],
      },
      {
        feature: "Generator start",
        cells: [
          { mark: "yes", text: "Two-wire start", note: "On its own generator board" },
          {
            mark: "yes",
            text: "Built-in relay",
            note: "State of charge, voltage, load and quiet hours",
          },
          { text: "Not stated" },
          { mark: "part", text: "DIY relay and automation" },
        ],
      },
      {
        feature: "Decides with no internet",
        cells: [
          { mark: "yes", text: "Yes" },
          { mark: "yes", text: "Yes" },
          { mark: "part", text: "Monitoring yes", note: "Offline rules not stated" },
          { mark: "yes", text: "Yes" },
        ],
      },
    ],
  },
  {
    group: "Open and available",
    rows: [
      {
        feature: "Open source",
        cells: [
          { mark: "yes", text: "Firmware and board files" },
          { mark: "part", text: "Partly", note: "Parts of Venus OS; no hardware files" },
          { mark: "no", text: "No" },
          { mark: "part", text: "Software yes", note: "Hardware varies" },
        ],
      },
      {
        feature: "Availability",
        cells: [
          { text: "In active development, not for sale yet", pending: true },
          { text: "Shipping" },
          { text: "Shipping" },
          { text: "Shipping" },
        ],
      },
    ],
  },
];

function CompareCell({ cell, us }: { cell: Cell; us?: boolean }) {
  return (
    <td className={us ? "us" : undefined}>
      {cell.mark ? (
        <span className="mark">
          <MarkIcon kind={cell.mark} />
          {cell.text}
        </span>
      ) : (
        <span className={cell.pending ? "o89-pending" : undefined}>{cell.text}</span>
      )}
      {cell.note && <span className="note">{cell.note}</span>}
    </td>
  );
}

function Compare() {
  return (
    <section className="section" id="compare" aria-labelledby="compare-title">
      <div className="o89-wrap">
        <div className="compare-head reveal">
          <h2 id="compare-title" className="h-l">
            How it compares.
          </h2>
          <p className="lede">
            The difference is in how it’s built. A microcontroller decides without an operating
            system to boot, the radio can fail without taking the rules with it, and the generator
            contact opens by itself if the Controller stops.
          </p>
        </div>
        <section
          className="table-scroll reveal"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the scroll region must be keyboard scrollable.
          tabIndex={0}
          aria-label="Comparison table, scrolls sideways on small screens"
        >
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col" className="us">
                  Origin89 Controller
                </th>
                <th scope="col">Victron Cerbo GX MK2</th>
                <th scope="col">SolarAssistant</th>
                <th scope="col">Home Assistant, DIY</th>
              </tr>
            </thead>
            {COMPARE.map(({ group, rows }) => (
              <tbody key={group}>
                <tr className="group">
                  <th scope="rowgroup" colSpan={5}>
                    {group}
                  </th>
                </tr>
                {rows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {row.cells.map((cell, i) => (
                      <CompareCell key={COLUMNS[i]} cell={cell} us={i === 0} />
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </section>
        <div className="compare-notes">
          <p>
            Checked on 17 September 2026 against Victron’s Cerbo GX datasheet, GX manual and
            developer wiki; SolarAssistant’s documentation and supported-inverter list; the
            Raspberry Pi 4 product brief; Home Assistant Green’s specifications and support pages;
            and the datasheets of the Controller’s parts. The Cerbo’s boot time comes from Victron’s
            community forum, not an official figure. The Origin89 column comes from the revision A
            design files; temperature figures are part ratings, the idle draw is a first bench
            reading and other values are not yet measured. Corrections welcome at{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

function AppSection() {
  return (
    <section className="section" id="app" aria-labelledby="app-title">
      <div className="o89-wrap">
        <div className="app">
          <AppPreview />
          <div className="app-copy">
            <h2 id="app-title" className="h-l reveal">
              Your site, wherever you are.
            </h2>
            <p className="lede reveal">
              The Offgrid app shows what the Controller reads and what it decided, each value with
              the time it was taken. When the site is offline, you see the last reading and its age,
              never a number that only looks fresh.
            </p>
            <ul className="app-points">
              {[
                [
                  "Stale looks stale",
                  "A reading past its interval is marked, and a missing one says so.",
                ],
                [
                  "Requests, not remote switches",
                  "Ask for the generator from the app; the Controller’s rules still decide.",
                ],
                [
                  "History on the site",
                  "The event log lives on the Controller and syncs when there’s a connection.",
                ],
                [
                  "Several locations",
                  "Planned: one account for every Controller you look after, grouped by site.",
                ],
              ].map(([title, text]) => (
                <li key={title}>
                  <b>{title}</b>
                  {text}
                </li>
              ))}
            </ul>
            <p className="app-status">
              The app is in development. Screens and readings here are samples.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuddySection() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const openSetup = () => {
    setOpened(true);
    dialog.current?.showModal();
  };
  return (
    <section className="section" id="buddy" aria-labelledby="buddy-title">
      <div className="o89-wrap buddy">
        <div className="buddy-stage">
          <BuddyAvatar
            className="buddy-portrait reveal"
            expression="explaining"
            framing="portrait"
            size={560}
            sizes="(max-width: 980px) 240px, 28vw"
            alt="Buddy, the Origin89 moose, explaining with one hoof raised"
            loading="lazy"
          />
          <section className="chat reveal" aria-label="Sample conversation with Buddy">
            <p className="bubble you">Why did the generator start at 5:40?</p>
            <div className="bubble buddy-says">
              <p>
                The charge controller reported the battery bank at 11.84 V at 05:38. That’s under
                your 11.9 V start rule, so the Controller asked the generator box to run.
              </p>
              <p style={{ marginTop: 10 }}>
                The outdoor probe hasn’t reported for 14 minutes, so I left it out.
              </p>
              <div className="src">
                <span>RS-485 1 · 11.84 V · 05:38</span>
                <span>Rule · start below 11.9 V</span>
                <span className="old">1-Wire · outdoor · 14 min old</span>
              </div>
            </div>
            <p className="bubble you">Is the fridge okay?</p>
            <div className="bubble buddy-says">
              <p>
                Yes. The middle shelf read 3.8 °C 41 seconds ago, and it has stayed between 3 and 5
                °C since last night.
              </p>
            </div>
          </section>
        </div>
        <div className="buddy-copy">
          <h2 id="buddy-title" className="h-l reveal">
            Buddy explains what changed.
          </h2>
          <p className="lede reveal">
            Ask in plain words. Buddy answers from the site’s own readings and rules, says where
            each number came from and how old it is, and leaves out what it can’t trust.
          </p>
          <p className="boundary reveal">
            <span>
              <b>Advice, not control.</b> Buddy can’t start, stop or switch anything. Only the
              Controller’s rules act on equipment.
            </span>
          </p>
          <div className="buddy-actions reveal">
            <button
              className="o89-plate o89-plate-ghost"
              type="button"
              data-open-setup
              onClick={openSetup}
            >
              Show Buddy your setup
            </button>
            <a className="o89-text-link" href="/buddy/">
              Open the full preview <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
      <dialog ref={dialog} className="setup-dialog" data-setup-dialog aria-label="Buddy setup chat">
        {opened && (
          <Suspense
            fallback={
              <p className="chat-loading" role="status">
                Opening Buddy…
              </p>
            }
          >
            <BuddyWorkspace
              buddyUrl={journalAssets.buddy}
              plateUrl={journalAssets.plate}
              photoUrl={journalAssets.cottage}
              site="cottage"
              onClose={() => dialog.current?.close()}
            />
          </Suspense>
        )}
      </dialog>
    </section>
  );
}

type SpecRow = [string, ReactNode, boolean?];
const SPECS: { icon: keyof typeof SpecIcons; title: string; rows: SpecRow[] }[] = [
  {
    icon: "chip",
    title: "Processors",
    rows: [
      ["Controller", "STM32G0B1RET6, Arm Cortex-M0+, 512 KB flash in two banks"],
      ["Radio", "ESP32-C6-WROOM-1-N8, RISC-V"],
      ["Link", "UART with hardware flow control"],
      ["Radio power", "Switched by the controller"],
    ],
  },
  {
    icon: "bus",
    title: "Field buses",
    rows: [
      [
        "RS-485",
        "3 ports, MAX13487E, SM712 surge clamp, 120 Ω termination on a jumper, 560 Ω fail-safe bias",
      ],
      ["CAN", "1 port, TJA1051T/3, PESD1CAN clamp, 120 Ω on a jumper"],
      ["VE.Direct", "2 ports, JST PH 4-pin"],
      ["Terminals", "Pluggable screw, 3.5 mm pitch"],
    ],
  },
  {
    icon: "temp",
    title: "Sensing",
    rows: [
      ["1-Wire", "3.3 V probe supply through a 100 mA resettable fuse, ESD clamp"],
      ["Probes per bus", "Pending bench test", true],
      ["SNS", "Start-battery voltage, about 36 V full scale by design"],
      ["TNK", "4–20 mA, 150 Ω sense"],
      ["SEL", "Panel selector input"],
    ],
  },
  {
    icon: "power",
    title: "Power",
    rows: [
      ["Input", "12 V DC, straight from the battery bank"],
      ["Protection", "SMBJ18A clamp, 2 A resettable fuse, reverse polarity"],
      ["Regulators", "2 × TPS54331 bucks, 5 V and 3.3 V"],
      ["Idle, radio on", "38 mA at 13.1 V, about 0.5 W, Wi-Fi and Bluetooth on"],
      ["Idle, radio off", "11 mA at 13.1 V, about 0.14 W, ESP32 rail switched off"],
      ["Source", "First bench readings, board revision A"],
    ],
  },
  {
    icon: "gen",
    title: "Generator board",
    rows: [
      ["Contact", "Two G5V-2 relays in series, gold-clad contacts"],
      ["Watchdog", "Hardware timer, opens about 4.5 s after the kicks stop, by design"],
      ["Output", "Dry contact, 30 V DC max, 2 A fuse, SMBJ30CA clamp"],
      ["Link", "JST VH 5-pin to the Controller"],
      ["Status", "Assembled, bench proof pending", true],
    ],
  },
  {
    icon: "radio",
    title: "Wireless",
    rows: [
      ["Wi-Fi", "2.4 GHz Wi-Fi 6"],
      ["Bluetooth", "Bluetooth LE, for setup"],
      ["Antenna", "On the module, under the cover"],
      ["Range in the enclosure", "Pending bench test", true],
    ],
  },
  {
    icon: "store",
    title: "Storage and time",
    rows: [
      ["State", "FM24W256 FRAM, 256 kbit"],
      ["Event log", "W25Q128JV NOR flash, 128 Mbit"],
      ["Clock", "32.768 kHz crystal, ±20 ppm, backup cell input"],
    ],
  },
  {
    icon: "board",
    title: "Board",
    rows: [
      ["Size", "100 × 125 mm"],
      ["Stack", "4 layers, 1.6 mm FR-4, solid ground plane under every pair"],
      ["Finish", "ENIG, green mask, white silkscreen"],
      ["Revision", "A, fabricated, bench measurements in progress"],
    ],
  },
  {
    icon: "box",
    title: "Enclosure",
    rows: [
      ["Face", "132 × 157 mm, 40 mm off the wall"],
      ["With ears", "160 × 157 mm"],
      ["Indicator", "One status light"],
      ["Build", "Printed around the finished board"],
    ],
  },
  {
    icon: "code",
    title: "Software and files",
    rows: [
      ["Firmware", "Rust, one image per processor"],
      ["Protocol", "KM43, shared by both processors"],
      [
        "Hardware",
        <>
          Board projects, Gerbers, BOM and enclosure CAD in{" "}
          <a href={siteConfig.repositories.hardware}>origin89hq/hardware</a>
        </>,
      ],
    ],
  },
];

const BENCH_ITEMS: [string, string, boolean][] = [
  ["Idle draw", "11 mA radio off, 38 mA with Wi-Fi and Bluetooth, at 13.1 V", true],
  ["Generator watchdog timing", "Designed for about 4.5 s", false],
  ["1-Wire probes per bus", "And the longest outdoor run", false],
  ["Start-battery accuracy", "SNS calibration against a meter", false],
  ["Wi-Fi range in the enclosure", "Through the closed cover", false],
  ["RS-485 with three buses", "All three ports talking at once", false],
];

function Specs() {
  return (
    <section className="section" id="specs" aria-labelledby="specs-title">
      <div className="o89-wrap">
        <h2 id="specs-title" className="h-l reveal">
          Technical specifications
        </h2>
        <p className="spec-foot">
          From the revision A design files, exported 9 September 2026. Values marked in amber wait
          on bench measurement.
        </p>
        <section className="bench reveal" aria-label="Bench progress on board revision A">
          <div className="bench-head">
            <b>On the bench</b>
            <span>Board revision A · updated 16 September 2026</span>
          </div>
          <ol className="bench-list">
            {BENCH_ITEMS.map(([title, text, done]) => (
              <li className={done ? "done" : undefined} key={title}>
                <i aria-hidden="true" />
                <span>
                  <b>{title}</b>
                  {text}
                  {!done && <span className="o89-sr"> (pending)</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
        <div className="spec-grid">
          {SPECS.map((group) => (
            <section className="spec-group" key={group.title}>
              <h3>
                {SpecIcons[group.icon]}
                {group.title}
              </h3>
              <dl>
                {group.rows.map(([label, value, pending]) => (
                  <div className="spec" key={label}>
                    <dt>{label}</dt>
                    <dd className={pending ? "o89-pending" : undefined}>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function Waitlist() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Origin89 waitlist")}&body=${encodeURIComponent(`Please add ${email} to the Origin89 Controller waitlist.`)}`;
    setSent(true);
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
        <form className="waitlist reveal" onSubmit={submit}>
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
          <button className="o89-plate o89-plate-action" type="submit">
            Join the waitlist
          </button>
        </form>
        <p className="waitlist-note" data-state={sent ? "done" : undefined} aria-live="polite">
          {sent
            ? `Your email app should open with the message ready. If it didn’t, write to ${siteConfig.email}.`
            : `Opens an email to ${siteConfig.email} with your address. A real sign-up form comes before launch.`}
        </p>
      </div>
    </section>
  );
}

export function HomePage() {
  useReveal();
  return (
    <div className="website-concept web-journal home">
      <SiteHeader />
      <main id="main">
        <HeroFilm />
        <Statement />
        <Audiences />
        <OpenHardware />
        <section className="section" id="device" aria-labelledby="device-title">
          <div className="o89-wrap">
            <div className="device-head reveal">
              <h2 id="device-title" className="h-l">
                Every terminal, named.
              </h2>
              <p className="lede">
                Pluggable screw terminals for field wiring, keyed headers for VE.Direct and the
                generator link. Point at a terminal to see what it connects to, its pins and its
                limits.
              </p>
            </div>
            <PortExplorer />
            <Viewer3D />
          </div>
        </section>
        <DualMcu />
        <Connections />
        <Integrations />
        <Compare />
        <AppSection />
        <BuddySection />
        <Specs />
        <Waitlist />
      </main>
      <SiteFooter />
    </div>
  );
}
