# Agent50 rank-4 Raichu / Electrode opponent-policy prototype v1

**Status: blocked for competitive attestation.** This is a deterministic actor-view policy prototype and a synthetic protocol regression suite, not a playable or competitively validated rank-4 pilot.

## Exact bindings

- **Opponent:** rank 4, Shu Hosoda, Raichu Electrode Combo; 60 cards in 31 distinct source rows.
- **Source list:** `results/aichi-2026/full-decklists.json`, Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- **Exact rank-entry digest:** `2dcb4c65c31103bebe9c3e3a4185f4a21e1dd0705e5bedcb777b6c07defeb106`, SHA-256 of UTF-8 `JSON.stringify(rank4Entry)`, preserving source object-key and card-row order.
- **Fixed candidate:** Hood Shield Shadow Rider v1, `results/aichi-2026/candidate-hood-shadow-rider.json`, Git blob `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`, canonical fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`.
- **Twinleaf:** submodule path `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No research hook or engine patch was used.

## Deliverables

- [Rank-4 opponent policy](../../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-opponent-policy.cjs) — `agent50-rank4-raichu-electrode-opponent-v1`.
- [29-test validator suite](../../../tests/2026-11/agent50-rank4-raichu-electrode-opponent-policy.test.cjs).
- [Frozen challenge-suite v1](agent50-rank4-raichu-electrode-opponent-policy-challenge-suite-v1.json) — 26 actor-view development scenarios with digests, 3 negative controls, and 9 pre-registered held-out review targets.
- [Dependency manifest](../../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-dependency-manifest-v1.json).
- [Common constraints](../../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-common-constraints-v1.json).

## What the prototype does

The policy is deterministic, role/seat-bound, and uses only the V3 actor observation and supplied legal-action frontier. It does not inspect opponent hand identities, hidden Prize identities, deck order, seeds, or RNG state.

The tested synthetic decisions cover:

- Dedechange draw timing and draw-supporter selection through Wonder Tag;
- Battle VIP Pass setup, Quick Ball discard-cost preservation, Rescue Stretcher recovery;
- Secret Box's four distinct categories (one Item, one Tool, one Supporter, one Stadium), with a discard-cost guard that preserves at least one copy of duplicated cards;
- Gladion versus Hisuian Heavy Ball Prize visibility and target restrictions;
- Sky Field only when our Bench pressure justifies it and the opponent is not already wider;
- Unit Energy attachment priority, Horror House-GX selection, and Klefki Joust when the opposing Active has a Tool;
- fail-closed handling of unsupported prompts and unknown prompt families.

These are policy heuristics and deterministic regression expectations, not demonstrated game strategy.

## Hard blockers

The rank-4 deck's intended core line remains unexecutable in the current prompt path:

| Card / effect | Required prompt | Current disposition |
|---|---|---|
| Electrode-GX — Extra Energy Bomb | `AttachEnergyPrompt` | Blocked; the V3 path cannot complete the five-Energy attachment allocation. The prior audit also records a zero-transfer source anomaly. |
| Alolan Raichu — Electro Rain | `PutDamagePrompt` | Blocked; the V3 path cannot complete distributed damage placement. |
| Electrode-GX — Crush and Burn-GX | `DiscardEnergyPrompt` | Blocked; prompt unsupported and the pinned engine has a previously reproduced damage-calculation discrepancy. |

The policy assigns the three root actions a prohibitive score and abstains if one of their unsupported prompts is presented. It also avoids using Battle Compressor to fund an unavailable Extra Energy Bomb line.

Agent42's readiness veto independently keeps ranks 4/9/17 non-game-evaluable pending the CES48 paper correction and a two-seat regression. This prototype does not override that veto.

## Evidence and limits

**Test result: 29/29 synthetic tests passed (synthetic only).**

The exact policy source, exact Agent49 worker source, and exact test file were evaluated in an isolated V8 in-memory harness. The harness supplied deterministic `node:test` and assertion shims and stubbed only unused Node built-ins; calls to the repository's actual `validateRequest` and `validateDecision` were executed for all 26 captured actor-view scenarios.

| Evidence class | Count | Meaning |
|---|---:|---|
| Synthetic validator/policy tests | 29 | Passed; protocol acceptance and deterministic decision behavior only |
| Captured actor-view development cases | 26 | Full actor-view objects and UTF-8 canonical digests preserved in the suite |
| Negative controls | 3 | Initialization binding, hidden-opponent-hand field rejection, role/seat mismatch |
| Held-out review targets | 9 | Pre-registered but not instantiated or run |
| Twinleaf games / native policy traces | 0 | No native execution |
| Aichi Top 32 matchups covered by this policy | 0/32 | No matchup estimate or win-rate claim |

No Node test runner, Twinleaf match, seed-based simulation, source-natural game, CI workflow, runner, validator, worker, fixture, candidate deck, or upstream engine code was changed or run.

The policy and suite are therefore **not eligible for a production pass or competitive-strength claim**. In particular, 29 passing synthetic tests do not establish that the policy can pilot the deck's central combo.

## Next useful work

Do not tune against the held-out cases yet. First resolve the three prompt/engine blockers in the approved integration lane, including the Crush and Burn damage discrepancy and the Extra Energy Bomb zero-transfer anomaly. Then instantiate the held-out actor views, run the same frozen policy from both physical seats against the unchanged candidate, capture native effect receipts and complete source-natural games, and obtain an independent review under the Agent2 challenge-suite contract.

**No win rate is estimated or claimed.**
