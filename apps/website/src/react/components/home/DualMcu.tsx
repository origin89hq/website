import { type KeyboardEvent, useRef, useState } from "react";
import chipU7 from "../../../assets/home/chip-u7.webp?url";
import chipU8 from "../../../assets/home/chip-u8.webp?url";

type Mcu = "stm32" | "esp32";
const ORDER: Mcu[] = ["stm32", "esp32"];

const Brackets = () => (
  <svg className="brackets" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M58 4h30l8 8v30M42 96H12l-8-8V58" />
  </svg>
);

export function DualMcu() {
  const [mcu, setMcu] = useState<Mcu>("stm32");
  const tabs = useRef<Record<Mcu, HTMLButtonElement | null>>({ stm32: null, esp32: null });
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = ORDER[(ORDER.indexOf(mcu) + 1) % ORDER.length]!;
    setMcu(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="section" id="architecture" aria-labelledby="mcu-title">
      <div className="o89-wrap mcu">
        <div className="mcu-board">
          <div className="chip-stage">
            <button
              className="chip-card"
              type="button"
              aria-pressed={mcu === "esp32"}
              aria-controls="mcu-esp32"
              onClick={() => setMcu("esp32")}
            >
              <img
                src={chipU8}
                alt="ESP32-C6-WROOM-1 module seen from above: steel shield with its marking and matrix code, the PCB antenna above it"
                width="720"
                height="720"
                loading="lazy"
              />
              <Brackets />
              <span className="chip-name">
                <span className="mono">U8</span> ESP32-C6
              </span>
            </button>
            <button
              className="chip-card"
              type="button"
              aria-pressed={mcu === "stm32"}
              aria-controls="mcu-stm32"
              onClick={() => setMcu("stm32")}
            >
              <img
                src={chipU7}
                alt="STM32G0B1RET6 microcontroller seen from above: black LQFP-64 package with its leads and marking"
                width="720"
                height="720"
                loading="lazy"
              />
              <Brackets />
              <span className="chip-name">
                <span className="mono">U7</span> STM32G0B1
              </span>
            </button>
            <p className="chip-link" aria-hidden="true">
              <span />
              UART, hardware flow control
              <span />
            </p>
          </div>
        </div>
        <div className="mcu-copy">
          <h2 id="mcu-title" className="h-l reveal">
            Dual-MCU architecture.
          </h2>
          <p className="mcu-sub reveal">Two processors. One of them decides.</p>
          <p className="lede reveal">
            The usual site monitor is one Linux computer. Networking, the web interface and the
            generator logic share its operating system. Origin89 splits the job: a microcontroller
            that only reads, decides and records, and a separate radio module that only talks. A
            Wi-Fi fault can’t take the generator rule with it.
          </p>
          <p className="mcu-compare reveal">
            Victron Cerbo GX: Venus OS, a Linux distribution, on a dual-core processor. Home
            Assistant Green: a quad-core Rockchip RK3566. SolarAssistant: a Raspberry Pi. Checked
            against their makers’ pages on 16 September 2026.
          </p>
          <div className="mcu-tabs" role="tablist" aria-label="Processor">
            {ORDER.map((id) => (
              <button
                key={id}
                type="button"
                ref={(el) => {
                  tabs.current[id] = el;
                }}
                className="o89-plate o89-plate-ghost o89-plate-sm"
                role="tab"
                id={`tab-${id}`}
                aria-selected={mcu === id}
                aria-controls={`mcu-${id}`}
                tabIndex={mcu === id ? 0 : -1}
                onClick={() => setMcu(id)}
                onKeyDown={onKey}
              >
                {id === "stm32" ? "STM32G0B1" : "ESP32-C6"}
              </button>
            ))}
          </div>
          <div
            className="mcu-detail"
            id="mcu-stm32"
            role="tabpanel"
            aria-labelledby="tab-stm32"
            hidden={mcu !== "stm32"}
          >
            <p className="mcu-role">Every decision, all timing, all storage, all actuation.</p>
            <p className="mcu-core">
              U7 · STM32G0B1RET6 · Arm Cortex-M0+ · 512 KB flash in two banks
            </p>
            <ul className="duties">
              <li>
                <span className="mono">U3–U6</span>
                <span>
                  <b>Reads the buses.</b> Three RS-485 transceivers, the CAN transceiver, both
                  VE.Direct ports, 1-Wire and the sense inputs.
                </span>
              </li>
              <li>
                <span className="mono">U9 U10</span>
                <span>
                  <b>Keeps the record.</b> State in FRAM, the event log in 128 Mbit NOR flash.
                </span>
              </li>
              <li>
                <span className="mono">X2</span>
                <span>
                  <b>Keeps time.</b> A 32.768 kHz crystal with a backup cell, so the log’s timeline
                  survives a power loss.
                </span>
              </li>
              <li>
                <span className="mono">CN9</span>
                <span>
                  <b>Asks the generator to run.</b> RUN and a regular KICK to board B, whose
                  watchdog opens the contact if they stop.
                </span>
              </li>
              <li>
                <span className="mono">V3V3_ESP</span>
                <span>
                  <b>Powers the radio.</b> It switches the ESP32’s rail, so a stuck radio restarts
                  without a site visit. With that rail off, the board idles at 11 mA.
                </span>
              </li>
            </ul>
            <p className="mcu-link">
              <b>Runs unchanged if the ESP32 is unplugged.</b> The rules, the record and the
              generator link never depend on the radio.
            </p>
          </div>
          <div
            className="mcu-detail"
            id="mcu-esp32"
            role="tabpanel"
            aria-labelledby="tab-esp32"
            hidden={mcu !== "esp32"}
          >
            <p className="mcu-role">Carries the data. Decides nothing.</p>
            <p className="mcu-core">
              U8 · ESP32-C6-WROOM-1-N8 · RISC-V · 2.4 GHz Wi-Fi 6 and Bluetooth LE
            </p>
            <ul className="duties">
              <li>
                <span className="mono">BLE</span>
                <span>
                  <b>Setup from your phone.</b> Pairing and provisioning over Bluetooth LE.
                </span>
              </li>
              <li>
                <span className="mono">Wi-Fi</span>
                <span>
                  <b>Sync when there’s a connection.</b> Readings and events go to the app and the
                  account when the site is online.
                </span>
              </li>
              <li>
                <span className="mono">OTA</span>
                <span>
                  <b>Delivers updates.</b> It carries a new firmware image; the STM32 decides
                  whether to take it.
                </span>
              </li>
              <li>
                <span className="mono">No state</span>
                <span>
                  <b>Holds no configuration.</b> It frames and forwards. If it knew what a generator
                  was, there would be two sources of truth.
                </span>
              </li>
            </ul>
            <p className="mcu-link">
              <b>One wire format, compiled twice.</b> Both processors talk over a UART with hardware
              flow control, using the same KM43 framing, checksum and authentication from one Rust
              crate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
