---
title: Why the generator start has its own board
date: 2026-09-17
summary: The Controller's main board never closes the generator's start contact itself. A second board with two relays, a hardware watchdog and no firmware does, and only while the controller keeps asking.
---

A controller that starts a generator also has to stop it. If the controller hangs with the start contact closed, the generator runs until the tank is empty. So the Controller's main board, board A, doesn't switch the generator. A second board, board B, holds the start contact.

## Two signals, two relays

Board A talks to board B over a five-wire cable. Two of the wires are logic lines: `RUN` asks for the generator, and `KICK` is a pulse board A sends once a second while its firmware is running.

Board B closes a dry contact toward the generator's two-wire start input through two relays in series:

- Relay B follows `RUN` directly.
- Relay A follows a hardware watchdog, a retriggerable monostable (74HC123). Each `KICK` keeps it on for about 4.5 s by design, and `RUN` going low resets it.

The contact closes only while both relays are closed. Board B has no microcontroller and no firmware, so there is no code on it to hang.

## What each fault should do

| Fault | Designed result |
| --- | --- |
| Board A stops sending `KICK` while `RUN` is still high | Relay A opens after about 4.5 s |
| `RUN` goes low | Both relays open at once, whatever `KICK` does |
| The cable between the boards comes out | Pull-down resistors read `RUN` and `KICK` as low, and the contact opens |
| One relay's contact welds shut | The other relay still opens the circuit: relay B on `RUN`, relay A when the kicks stop |
| Board A resets for less than 4.5 s | The contact stays closed |

Each relay has a second pole, and those poles form a feedback line back to board A. Board A reads that line to confirm both contacts actually closed.

## Parts chosen for a generator input

- The generator start inputs we checked switch a few milliamps behind a pull-up. Plain silver relay contacts can stop making reliable contact at that level, so board B uses Omron G5V-2 relays, whose contacts are specified from 10 µA to 2 A.
- The start input's polarity varies between generators: most switch to negative, some carry battery positive. The surge suppressor across the output is bidirectional for that reason.
- The generator pair has a 2 A, 5 × 20 mm fuse in a holder, replaceable without a tool.

## Status

None of this is proven on the bench yet. The first board B units are assembled, and the fault tests above haven't run; the [board B bench log](https://github.com/origin89hq/hardware/blob/main/boards/generator-b/bench/2026-09-14.md) explains why. We'll post the results, with the measured watchdog time, once they run.

The full design, with each layout rule and the failure it prevents, is in [GENERATOR-BOARD.md](https://github.com/origin89hq/hardware/blob/main/boards/generator-b/GENERATOR-BOARD.md).
