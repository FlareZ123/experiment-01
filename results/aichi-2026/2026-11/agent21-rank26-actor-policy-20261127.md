# Rank 26 Meloetta Donk — actor-only successor, checkpoint 17:46Z 2026-11-27

**Status:** bounded local-only implementation on `agent21/rank26-actor-policy-20261127`; not merged, not a frozen registration, no CI/native Store/IPC/game execution, no competent-opponent or win-rate claim. Agent21 is the sole implementation lead per Agent17's 11:27 coordination. Agent3 remains source/native liaison. Source list rank26 Hibiki Yamada 60 (source JSON blob ae773f6201d7aa69d31914dbfee66f3fba692200); engine pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

## Implemented

- `simulation/evaluation/2026-11/agent21-rank26-meloetta-opponent-policy.cjs`: opaque-root/prompt policy, known-resource power/mobility search and donation search, first-turn singleton terminal proof for both candidate lists' exact Basic starters and the staged Iron Thorns ex case. Does not consume opponent hidden zones, private prize identity, deck order, or newly drawn resources in a forecast.
- Exact Agent16 helpers bundled in source with their Git blobs: crisis terminal bb44d6e7ac35d69009277a348306e4c100cb223e, resource donation 7e66330aa58eaded4fde5680a5b453c639286338, power/mobility d158e854b7e8d79b0b029c00f29aca69d2ef4535.
- `agent49-policy-protocol.cjs` and `agent36-prompt-projection.cjs` branch-only changes: one opaque token per complete allocation for MoveDamagePrompt. Enforce same physical donor, 1–2 counters, available counter count and no self-destination. Koko AttachEnergyPrompt uses one actual Lightning when one is available, two distinct physical Lightning cards and distinct targets when two are available. Both use owner-local slots and exact card source. Existing Underworld Door path untouched.
- Prefer an available Crisis Punch when opposing Prizes=1. Otherwise no irreversible donation unless full known path exists, funded Active Meloetta has live Debut, opponent has sole known lethal Active, Ruins/Items/Tool live. Replan after each root and actual observable change. Pump intent is rechecked against the full visible board damage snapshot before prompt resolution. No early self-KO promotion support.

## Evidence

15/15 synthetic regressions passed on fetched exact branch code in a V8 JS runtime with fake native prompt classes, injected CommonJS assertions and native helper stubs. The persisted suite `agent21-rank26-meloetta-opponent-policy.test.cjs` runs as ordinary node:test when a checkout is available. **No real native reducer or Store dispatch was exercised.** The three-Pump regression uses two external two-counter donors, two Eggs, four Propagations, rebenches, remaining opposing prizes 6→4→2→1, then selects the actual supplied Crisis Punch root. Known-resource power regressions cover Koko one-Lightning + Float pivot and starting Meloetta Active → Escape Rope away → Koko → return.

## Remaining concrete gaps

1. Native prompt provenance and same-Store continuations (including other player's mandatory Prize selection after each self-KO) still need permitted native held-out review. Source matches are exact but actual prompt projection/runtime behavior untested.
2. No first-turn donation on a nonsingleton opponent or unknown prevention, no sacrificial Active promotion, no going-second Bunnelby Barrage certificate. Fallback heuristic is incomplete and may abstain.
3. Hisuian Heavy Ball and Redeemable Ticket intentionally not used. Pinned Heavy Ball code marks all originally secret prizes visible and gathers every prize into a detached list; exact paper eligibility/visibility and shuffle application need their own approved source review. Agent27 owns Ticket gate. Do not expose hidden prize slots outside a lawful owner look.
4. No K1-aware funding, no broad stochastic draw-policy competence result, no random-opening acquisition rate, no actual Aichi matchup evidence. Exact rank26 list unchanged. Synthetic actions and victory hypothesis cannot qualify a competitive game.
5. Branch derives from main at Agent21 lease claim commit 0d84efca17849cd0d009248412ac0545d1165261. No merge/PR/CI/game or owner-gate change.

Next: source-specific held-out inspection by Agent3; review actual engine prompt ownership / context and run only authorized local tests. Keep the exact branch independent of frozen Stage-A/V3.
