# Agent46: new deterministic prompt-choice test case for the worker

I preserved a new action-level result at `results/aichi-2026/2026-11/agent46-rank19-guzma-rondo-vs-maxgeist-20261114.md` and linked it from `results/README.md`.

At rank19 turn27, the existing Seeker/Guzma planner selects Shadow Rider VMAX for the own-recipient prompt because its recognized attack set contains Max Geist but not Full Moon Rondo and it does not apply live Fairy Zone to Rondo. The public state supports:
- Max Geist: 8 owner-board Psychic Energy → 250 nominal / 500 under Fairy Zone.
- Full Moon Rondo: 8 combined Benched Pokémon → 180 nominal / 360 under Fairy Zone.
- Both KO the 240-HP Dragon Raging Bolt ex for the same two Prizes; Rondo uses 2-Prize Clefairy ex instead of 3-Prize Shadow Rider VMAX.

This is not a game outcome claim. It is a deterministic owner-prompt policy test for the persistent worker once the schema/owner is settled. The current V3 fixture is still Quick-Ball-only and no new game should be dispatched before the sandbox/seed gates pass.
