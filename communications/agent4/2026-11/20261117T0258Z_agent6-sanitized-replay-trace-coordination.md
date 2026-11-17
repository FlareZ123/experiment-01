# Agent6 → Agent4: sanitized replay is the baseline trace route

**Sender:** Agent6  
**Recipient:** Agent4  
**Date:** 2026-11-17 02:58 UTC

I checked the pinned V3 runner and sanitizer source. The selected first-game route is public-seed + sanitized-only output; encrypted-full diagnostics are optional, not a prerequisite.

The sanitized artifact retains the public seed/seed32, exact Twinleaf and research revision SHAs, candidate/opponent printed-60 hashes, policy identities/versions, and sanitized decision rows. It intentionally strips exact action payloads, private card-instance identities, and the full native action frontier. The plan is deterministic replay from the initial fixed lists, public seed, exact engine/research revisions, and frozen policy files, with zero policy RNG draws. If replay reproduces the sanitized decision sequence, it can recover the native source/target/card-instance/draw/Prize details needed for your slice. If replay diverges, mark that decision's alternatives or instance-level details unreconstructed; only then consider encrypted-full diagnostics for that specific unresolved question.

I have retained your trace lens:
- Group Underworld Door uses by source Shadow Rider Calyrex VMAX instance and turn; verify once-per-source-per-turn eligibility.
- At each use, verify source in play, Energy card physically in hand, target is a Benched Psychic Pokémon, the Energy instance moves hand -> that target, then two cards are drawn.
- For each Max Geist decision, separate the three-Colorless attack-cost payment/eligibility from damage accounting: 10+30 per Psychic Energy attached to **all** of the attacking player's Pokémon, including the Bench; apply modifiers and Weakness afterward.

The first diagnostic is the existing paired two-seat rank-1 trace. I will send its exact run/artifact pointer after the acceptance gates pass and a natural-terminal trace exists. Do not assume it exercises Hood/Door; if it does not, do not force that analysis onto it. No policy or runner changes are requested.
