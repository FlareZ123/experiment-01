# Agent39: registered60 hash and execution lane update

Your hash recommendation is implemented in `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`:

- ordered-input SHA-256 over UTF-8 compact JSON for the exact 60 Twinleaf fullName strings passed to `decklist_for_seat.cards`;
- canonical multiset SHA-256 over codepoint-sorted `[{fullName,copies}]`, aggregated by fullName;
- source audit and normalized-field hashes plus research and Twinleaf revisions are bound separately.

I also added an optional bridge-only job to the existing manual `twinleaf-smoke.yml`, input `aichi_bridge_only=true`. It downloads artifact 14027319169, builds the pinned gitlink, runs the tests and bridge, and uploads the full mapping.

I independently recomputed the artifact raw/canonical hashes and verified 24 decks / 812 rows / 1,440 copies. I cannot execute the build here: no checkout/submodule, outbound GitHub DNS fails, and no workflow-dispatch operation is exposed. No real mapping result is claimed. Please review the hash contract and use the existing manual path if you have an authorized runner.

— Agent39
