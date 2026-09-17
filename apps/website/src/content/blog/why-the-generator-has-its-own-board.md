---
title: Why the generator start has its own board
date: 2026-09-17
summary: The Controller's main board never closes the generator's start contact itself. A second board with two relays, a hardware watchdog and no firmware does, and only while the controller keeps asking. It now holds and drops on the bench, 4.3 s after the last kick.
---

A controller that starts a generator also has to stop it. If the controller hangs with the start contact closed, the generator runs until the tank is empty. So the Controller's main board, board A, doesn't switch the generator. A second board, board B, holds the start contact.

## Two signals, two relays

Board A talks to board B over a five-wire cable. Two of the wires are logic lines: `RUN` asks for the generator, and `KICK` is a pulse board A sends once a second while its firmware is running.

Board B closes a dry contact toward the generator's two-wire start input through two relays in series:

- Relay B follows `RUN` directly.
- Relay A follows a hardware watchdog, a retriggerable monostable (74HC123). Each `KICK` keeps it on for about 4.5 s by design, 4.3 s on the bench, and `RUN` going low resets it.

The contact closes only while both relays are closed. Board B has no microcontroller and no firmware, so there is no code on it to hang.

## What each fault should do

| Fault | Designed result |
| --- | --- |
| Board A stops sending `KICK` while `RUN` is still high | Relay A opens after about 4.5 s |
| `RUN` goes low | Both relays open at once, whatever `KICK` does |
| The cable between the boards comes out | Pull-down resistors read `RUN` and `KICK` as low, and the contact opens |
| One relay's contact welds shut | The other relay still opens the circuit: relay B on `RUN`, relay A when the kicks stop |
| Board A resets for less than 4.5 s | The contact stays closed |

The first two rows now have bench results, below; the others still rest on the design.

Each relay has a second pole, and those poles form a feedback line back to board A. Board A reads that line to confirm both contacts actually closed.

## Parts chosen for a generator input

- The generator start inputs we checked switch a few milliamps behind a pull-up. Plain silver relay contacts can stop making reliable contact at that level, so board B uses Omron G5V-2 relays, whose contacts are specified from 10 µA to 2 A.
- The start input's polarity varies between generators: most switch to negative, some carry battery positive. The surge suppressor across the output is bidirectional for that reason.
- The generator pair has a 2 A, 5 × 20 mm fuse in a holder, replaceable without a tool.

## What the bench showed

On 17 September the interlock ran end to end for the first time. The contact closes within 3 s of `RUN` going high while kicks arrive, holds while they keep coming, opens 4.3 s after the last one, closes again when the kicks resume, and opens at once when `RUN` goes low. Since then 68 sequences have passed and none has failed.

The dropout, measured from the last kick to the contact opening, came in at 4.34 to 4.46 s over the thirteen runs that were timed. The specification is 3.0 to 6.5 s and the design figure is 0.45 × 1 MΩ × 10 µF, about 4.5 s. Every reading sits inside a 120 ms band that drifts gently downward as the board warms.

Two things had to be fixed before any of it worked. On revision A both relay chains run from each pole's normally-closed terminal to its normally-open one with the commons unconnected, so the chain could never conduct however well the coils switched; four wire links per board tie each common to its trace, and revision B is to fix the footprint. Then the sequence still failed for most of a day: the five-wire cable had been crimped with ferrules inside the terminals, which a crimp cannot bite through. Three conductors happened to conduct, so the board powered up and `RUN` arrived, but `KICK` never did and the watchdog never released. The symptom followed the cable across a board swap. Recrimping without ferrules fixed it.

With a lamp across the contact, relay B's light shows the Controller asking, relay A's shows the watchdog agreeing, and the contact's light shows the result. Stop the kicks and the last two go out together, 4.3 s later.

## Still to prove

- A long run, and a cold one. 68 passes over about 40 minutes is not a night, and the dropout drifts as the board warms, so the 3.0 to 6.5 s window is not yet proven across a working day outdoors.
- Brown-out and surge behaviour of the contact pair, and watching the watchdog line while the contact makes and breaks.

The [board B bench log](https://github.com/origin89hq/hardware/blob/main/boards/generator-b/bench/2026-09-17.md) has the wiring, the raw dropout readings and what each test proved. The full design, with each layout rule and the failure it prevents, is in [GENERATOR-BOARD.md](https://github.com/origin89hq/hardware/blob/main/boards/generator-b/GENERATOR-BOARD.md).
