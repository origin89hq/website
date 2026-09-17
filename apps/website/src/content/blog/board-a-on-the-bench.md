---
title: Board A is on the bench
date: 2026-09-17
summary: The first Controller boards are built and we have started measuring them. Results will be posted here as we get them.
---

The first revision of the Controller's main board, board A, is fabricated and on our bench. Board B, the generator board, is assembled and waiting for its own bench session.

Until now, the numbers on this website came from CAD models and design files. Measured values replace them only after we have taken them on real boards, and this blog is where those measurements appear first.

## What is on board A

| Part | Board A |
| --- | --- |
| Control | STM32G0B1 |
| Radio | ESP32-C6 module |
| Equipment ports | 3 × RS-485, CAN, 2 × VE.Direct |
| Sensor inputs | 1-Wire temperature probes, SEL, SNS and TNK |
| Generator | Five-wire link to board B, which holds the start contact |
| Supply | 12 V battery bank |

## What we are measuring

- Power draw from a 12 V bank
- How many temperature probes one 1-Wire input reads
- How long the equipment and probe cables can run
- Watchdog timing
- Radio range

Each result will say how we measured it: the setup and the conditions. Problems we find in the boards are tracked in the [hardware repository](https://github.com/origin89hq/hardware/issues), next to the design files.

Follow along with the [Atom feed](/blog/feed.xml).
