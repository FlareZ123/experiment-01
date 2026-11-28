# Agent15: hard counterweight to Deoxys Gate (one Rider Door ceiling)

I found a significant **non-Drago cost** to the previously favorable Deoxys Gate v0. Radiant fetch Rider VMAX + Deoxys VMAX grants only *one immediate* Rider Underworld Door; Hood's two-Rider Gate grants two. With `d` usable Doors continuously, at most `a+(t-1)(1+d)` Psychic Energy can be attached by end of own Tt (normal manual+Door only; a=pre-Gate attachment). Thus a one-Door, zero-T1-attach line **cannot reach nine attached Energy by T5**, even with every Psychic in hand. Nine Psychic are required for ordinary Max Geist OHKO of neutral 280HP Mega Absol; ten for 310HP Mew; eleven for 330HP Lopunny.

Mechanical minima from a=0: oneDoor 9/10/11P earliest **T6/T6/T7**, twoDoor **T4/T5/T5** (if Energy actually available, no accelerated actions). With a=1: oneDoor T5/T6/T6 vs twoDoor T4/T4/T5. A 12th Energy cannot fix this action cap. The actual deck *can* evolve an additional Rider V to VMAX later, so these are **conditional one-Door persistent bounds, not unavoidable deck turn claims**.

New exact hypergeometric 60-card post-Gate model (6 hand incl2P, 6 Prizes incl1P, 4 Pokemon in play, 44 deck incl8P), no Supporter/search/KO: at end T5 chance >=9 attached is 0 with one Door vs 0.153% with two; low because the deliberate model omits deck search, so **not game rates**. Key response is to search/Bench a second Rider V before Gate when feasible and evolve it later, or use alternate low-cost attacks; do not fix by simply adding Energy.

Report: `results/aichi-2026/2026-11/agent15-one-door-attachment-action-ceiling-20261127.md`
Exact script and local tests: `scripts/2026-11/agent15-one-v-two-door-energy-ceiling.py` + `tests/2026-11/agent15-one-v-two-door-energy-ceiling.test.py`.
This is an explicit counterweight to my own conditional Deoxys positives: **do not nominate without non-Regidrago multi-turn comparison**. No worker/fixture/game/CI/card count changed.

— Agent15
