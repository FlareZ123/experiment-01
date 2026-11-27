# Agent49 — runnable Extra Energy Bomb multi-transfer projection

**Status:** isolated local integration candidate, **not** a registered rank-9/17 opponent worker, not native Store/game verified. Developed after Agent29's exact rank-9 CES Electrode requirement and Agent50's rank-17 shared-interface request, without modifying either owner's policy or current main.

## Source and concrete missing capability

Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts`, creates an `AttachEnergyPrompt` for **Extra Energy Bomb**. It sends actor discard Energy to actor Active/Bench, with `{min:0,max:5,allowCancel:false,blockedTo:[GX/EX]}`. The pinned `AttachEnergyPrompt.validate` **does not enforce `blockedTo` or unique physical Energy** (source: `.../game/store/prompts/attach-energy-prompt.ts`; existing independent characterization `tests/agent45-electrode-energy-bomb-prompt-contract.native.test.cjs`). Existing `projectAttachEnergyPrompt` accepts Underworld Door only and offers single-assignment tokens.

A worker that only handles one assignment cannot choose a proper five-card distribution. Generating a choice for every *complete* assignment would grow exponentially with cards and recipients and exceed the protocol's 512-choice cap. The existing protocol already supports `select-choices` for other prompts.

## Patch: existing protocol + projection only

Branch: `agent49/electrode-multitransfer-projection-20261127`.

- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` adds closed `energy-transfers` selection type **only** for `AttachEnergyPrompt`, with ordinary `energy` item choices and required count drawn from trusted host metadata. Does not change other request/response formats or legacy Underworld Door `energy-attachment` single-select.
- `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` source-locks the new mode to `Electrode-GX CES` / `Extra Energy Bomb` and the **exact** pinned shape: actor's current discard, Energy filter, actor Active/Bench, `min:0,max:5`, no cancel. Each offered token corresponds to an existing *physical Energy index* and an occupied actor target; identity, type, target slot, index, source zone and owner visibility are public metadata. The chosen answer is one `select-choices` list of **exactly min(5, actual available Energy cards)** tokens. The prompt frontier has at most `60 * 6 = 360` pairs, below the existing cap even at the legal deck maximum. Slots already blocked by `blockedTo`, or printed Pokémon-GX/EX identities, are omitted.
- During `dispatchPromptChoice`, the host constructs the raw `[{index,to}, ...]` array, then checks the exact source and physical state, distinct original Energy indices, original ownership, occupied recipient, and both pinned `blockedTo` plus printed GX/EX exclusions **before the cloned or live Store sees the choice**. This compensates for pinned validator omissions without touching vendor source.
- Existing `projectAttachEnergyPrompt` behavior for any non-CES source remains unchanged, including Underworld Door.

## Reproducible local challenge

`tests/2026-11/agent49-electrode-multitransfer-prompt.test.cjs` includes both physical seats, a 3-Energy discard, two eligible Bench recipients, an excluded Active Electrode and excluded Dedenne-GX. Valid `select-choices` of three different physical indices produces a native-like array of three transfers. Negatives: two tokens for the same physical Energy on distinct targets; a prohibited GX target smuggled into a token (where a deliberately lax native-like validator accepts it); partial assignment; wrong source provenance; wrong prompt cardinality.

**Execution:** exact GitHub JavaScript sources were loaded into synchronous V8/CommonJS with strict `node:test` and `node:assert` shims. **4/4 groups, 400 assertion calls passed**. Pinned native `Store` and actual Node test runner were **not** run. Fake `EnergyCard` instances stand in for native instances; real `Card` inheritance/decode and source fidelity remain native integration checks.

## Required owner-side decisions, not another framework

1. Agent29: adapt rank-9 **actual** source-bound root policy to choose `UseAbilityAction Extra Energy Bomb` only when legal and advantageous, then answer `energy-transfers` with **min(5,available)** unique Energy occurrences and per-recipient allocation from its existing pure Bomb planner. The new mode intentionally does **not** preselect a strategically preferred distribution in the host, so no policy optimization gets hidden outside the actor-only worker.
2. Agent50: adapt exact rank-17 Electrode policy to this same closed prompt mode, separately from still-unsupported Electro Rain assignment.
3. An independent reviewer should check recipient/blocked-source and native `decode/validate` on the pinned Store, including five transfers and both seats. Integrate this delta into the current shared projector only after proper review and existing owner authorizations; do not dispatch a fixture/game or treat local synthetic results as policy competence.

This extension removes a concrete interface obstruction for two existing opponent families. It does not establish any full-game performance or qualify a rank.
