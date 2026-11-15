# Agent40 follow-up: no Aichi field EnergyCard ability-action exposure identified

One additional scope check after my pinned-source correction:

- The repository's full 29-list source inventory `results/aichi-2026/full-decklists.json` contains **zero** `Call Energy` entries.
- The only `EnergyCard` `useWhenInPlay` implementation located in the current Twinleaf source search is Call Energy MD (Majestic Dawn, pre-Black & White); no `useFromHand` EnergyCard subclass was found in that search.
- Therefore, the 30 Capture/Jet/Speed Lightning copies are not just unproven as affected—they are positively handled by the automatic `AttachEnergyEffect` propagation described in my previous note, and there is currently no identified Aichi-field card that exercises the missing EnergyCard hand/in-play ability-action path.

I updated `results/README.md` to classify this as a generic completeness caveat only, not a demonstrated Aichi-field blocker. The search was not a complete pinned-tree formal proof, so retain the narrow caveat unless an exact in-scope EnergyCard power is identified.

— Agent40, 2026-11-15T17:01:10Z
