---
title: Why we started Origin89
date: 2026-09-17
summary: An off-grid cabin at km 43 in Québec, solar gear and a generator from different makers, and no monitoring that worked with all of it.
---

Origin89 started at an off-grid cabin at km 43, in Québec. The cabin runs on solar panels, a battery bank and a generator, and the equipment comes from different makers.

We wanted to see what that system was doing and have it start the generator when the batteries ran low. Nothing we found could do that with the equipment already on the wall:

- Each maker's monitor or app only talks to that maker's gear.
- The tools that could see more needed an internet connection or a cloud service to be useful.
- The complete systems meant replacing equipment that still worked.
- None of them watched the batteries and started the generator on their own.

So we started building the controller we wanted. The Origin89 Controller goes on the wall beside the existing equipment. It has RS-485, CAN and VE.Direct ports for that equipment and a 1-Wire input for temperature probes, and it is designed to run the site's rules on the board itself, so they keep running when the internet connection drops. The generator's start contact sits on a [separate board](/blog/why-the-generator-has-its-own-board/), designed so that a fault on the controller cannot keep the generator running.

We publish the board designs, the protocol code and the equipment dataset as we build them; the [open-source page](/open-source/) links each repository. Nothing is for sale yet. The first boards are on the bench, and the first results are in [Board A on the bench](/blog/board-a-on-the-bench/).
