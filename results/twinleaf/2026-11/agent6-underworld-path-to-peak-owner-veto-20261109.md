# Prevent a visible Path to the Peak from authorizing Underworld Door

**Agent 6, 9 November 2026.** A concrete owner-decision correctness repair in the shared two-player Shadow Rider VMAX policy. The existing `chooseUnderworldDoorRoot` already vetoed a publicly Active Iron Thorns ex with Initialization, following Agent 3's six native abort repairs. It still proposed `Underworld Door` when a live **Path to the Peak** was in either player's public Stadium zone.

## Implemented

- Changed `simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs` in commit `acc1d6ba3a22a7e0248c26b1261ad249f848acdb`. The chooser scans only the acting owner's detached `ownPublic.stadium` and `opponentPublic.stadium` printing arrays. If either contains the exact `Path to the Peak` printed name (with optional printing suffix), it refuses the optional VMAX Underworld Door root. It otherwise retains the former source marker, Basic Psychic hand, Psychic Bench, and Active Iron Thorns criteria.
- Added five pure Node regressions under `tests/2026-11/agent6-underworld-path-stadium-owner.test.cjs` in commit `33023f80b64e4902ecaebf569fdfd4c2f6de17c2`: own/opponent Stadium in both physical actor seats; multiple print suffixes; no false lock from held/discarded Path, another Stadium, missing source-use marker, or missing Energy.
- No Twinleaf vendor files, decklists, game policy defaults, workflow triggers, or source data were altered.

## Why this correction matters

The physical Path to the Peak card states that Pokémon with a Rule Box in play have no Abilities. Shadow Rider Calyrex VMAX has a Rule Box, so while the Stadium applies, Underworld Door cannot be announced. The furnished full `resources`-equivalent card list has Path in CRE/ASR English printings; the official Pokémon explanation independently confirms the rule: https://www.pokemon.com/uk/news/watch-the-2022-pokemon-world-championships-for-a-digital-pokemon-tcg-card .

Among the **29 authenticated Aichi original source 60s**, seven lists contain Path to the Peak: **ranks 5 (2 copies), 9, 12, 15, 20, 21 and 27 (one copy each)**. This is a potential live-policy reachability surface, **not** an observed count of Path-active turns, invalid native actions, losses, or repaired games. Source data: `results/aichi-2026/full-decklists.json`.

The pinned native two-seat `tests/agent33-path-to-peak-full-lock-pinned.test.cjs` previously showed Path played into the Store suppresses Genesect V's Rule Box Ability. This tests the shared lock mechanism but is **not** a direct native Shadow Rider Underworld Door replay. This change is a conservative paper-valid proposer filter; actual Store custody remains authoritative.

## Release boundary

This is an owner-safe, narrow prevention of impossible optional Ability proposals under an unambiguously live printed Stadium, with a dedicated pure regression suite. It does not show a newly repaired native abort, establish improved adversarial opponent decisions, or qualify a match. The seven source lists do not imply a Stadium was drawn or remained in play during a game. A native same-deal replay with an actually Active Path and otherwise funded VMAX remains the decisive follow-up. Current collective status remains **zero** competitively qualified games and **no** selected final fixed 60 or demonstrated 99.5% field win rate.
