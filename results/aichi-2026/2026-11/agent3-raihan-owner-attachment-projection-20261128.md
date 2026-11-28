# Raihan EVS 152: native owner-visible Basic Energy attachment, V3 development adapter

**Agent 3 — 28 November 2026.** Source-bound implementation, **not installed** in the shared V3 dispatcher and **not a game**.

## Problem solved

The current Agent36 `projectAttachEnergyPrompt` admits one specific `Underworld Door` contract (Psychic Basic from owner's hand to Psychic Bench). The original Aichi rank-14 and rank-32 Regidrago 60s both run `Raihan EVS 152`: after the printed previous-opponent-turn KO condition, Raihan attaches a Basic Energy from **the actor's discard** to **one of the actor's Pokémon** and then searches the deck. A legal worker Raihan play could therefore be blocked by V3's `UNSUPPORTED_ATTACH_ENERGY_PROMPT_SOURCE`, even if all game prerequisites were met. This is a missing projector, not a missing Regidrago search-graph edge.

The pinned source-game physical continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` provides an independently observed native transfer: `AttachEnergyPrompt` from owner discard, followed by `ResolvePromptAction` with one **physical Energy card reference** in `[{to:{player:BOTTOM_PLAYER,slot:ACTIVE,index:0},card:discardedPsychic}]` (not the index form used by Underworld Door). The native Raihan follow-on then opens `ChooseCardsPrompt` against the owner's deck. Our adapter uses this actual pinned **Raihan transfer shape** and keeps native prompt validation authoritative.

## Implementation

- `simulation/evaluation/2026-11/agent3-raihan-owner-attach-projection.cjs` exposes `projectRaihanOwnerAttachPrompt` and `createOptInRaihanPromptProjection()`. The latter returns a frozen object with the original projector's `resolveHostOnlyPrompt` and `validateRawPromptResult`, but overrides `projectPrompt` **only when expressly injected** into `createV3WorkerDecisionResolver({promptProjection:...})`. No shared projector or vendor source is mutated.
- Require typed `card-effect` provenance for the **exact** Raihan `EVS 152` card, with actor-visible physical source reference and matching `sourcePrinting`. Require actor-seat/perspective ID consistency, a pending unreconciled native prompt, `prompt.cardList === actor.discard`, owner-only target player type, one Basic Energy transfer, and only ACTIVE/BENCH/BOARD slot selectors.
- Filter the physical actor discard's native eligible Energy cards and enumerate actor-owned in-play Active/Bench Pokémon. Each `[{to:{...},card:physicalCard}]` candidate is submitted to **native decode+validate** before receiving a token. No token is produced for opponent cards, non-Basic Energy, foreign objects or invalid assignments. Cap frontier at 512 choices.
- Bind each result token back to the exact physical `card` and destination slot; emit the frozen `AttachEnergyPrompt` /`energy-attachment` actor-only V3 schema, validated under Agent49 strict protocol. Strict native single-selection is `select-choice`, **not** `select-choices`.
- The rank32 worker `raihanAttachPriority` and rank14 inheritor now choose an **actual offered token**, prioritizing Basic Grass/Fire that reduces Regidrago's typed Apex deficit. If already funded, preserve native legality with a low-score otherwise legal attachment; no invented targets.

## Exact development tests

`tests/2026-11/agent3-raihan-owner-attach-projection.test.cjs`: **10/10** in a V8 synchronous CommonJS/Node assert emulation. Both acting seats; four Basic-card/own-slot assignments; physical return-card identity; protocol validation; no opponent discard exposure; source/card/seat/stale/alien-discard/unsupported-shape negative cases; empty Basic discard abort; BOARD wildcard; unrelated prompt delegated; explicit V3 injection; and end-to-end projected-token selection through **both** source 60 workers. Source decision test `tests/2026-11/agent3-rank32-regidrago-opponent-policy.test.cjs` additionally verifies both-seat Fire-versus-Grass active/Bench prioritization and source-zone spoof refusal.

**Evidence limitations:** fake native `AttachEnergyPrompt` in tests reflects the already-observed physical transfer form; **no pinned Twinleaf Store hand, Raihan native effect execution, actual worker process, Docker, GitHub Actions, scored game, or comparative field trial has been run**. The source fullName and number are bounded by the observed `Raihan EVS` physical source and published `EVS 152` identity. The actual prompt's slot-selector mode and owner `sourceEffect` must be checked during independent native review. Never change the default Agent36 projector or admit this path to the V3 owner fixture on synthetic evidence alone. Owner17/Agent46 review and source-game reproduction are required before production registration.

## Why this matters to the fixed 60

A frozen candidate cannot be compared fairly against its full opponent field while the opponent's printed Energy-acceleration Supporter resolves to an unsupported prompt. This patch does not select a deck, invent a win rate, or increase qualified coverage by itself; it provides the **specific, opt-in code path and a frozen-protocol compliant decision** needed to get two original Regidrago opponents closer to genuine, uninterrupted native-turn competence.

