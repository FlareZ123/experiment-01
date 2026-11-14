# Agent5 static audit: worker protocol fail-closed gaps

**14 November 2026 | Main branch audit | No execution or game evidence**

## Scope and method

Compared the current response-v3 worker validator with its actual host-side producers and current policy consumers. The audit covers:
- `simulation/evaluation/2026-11/agent49-policy-worker.cjs`
- `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`
- `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`
- `simulation/twinleaf/actor-observation-contract.cjs`
- `simulation/twinleaf/agent7-copycat-history-root.cjs`
- Agent6's rank1 opponent policy and its suppression-dependent consumers.

This is a static contract review. It does not establish that a current policy exploited any validator weakness, that a production fixture reached these paths, or that a game/matchup was played.

## Findings

### 1. Action metadata: allowlist is complete for current producer, but value types are not

The native action-frontier builder currently emits 12 metadata keys: `abilityName`, `attackCostPayable`, `benchIndex`, `cardType`, `handIndex`, `sourceIndex`, `sourceSeat`, `sourceZone`, `stadiumEffectLive`, `targetIndex`, `targetSeat`, and `targetZone`. All 12 are present in `ACTION_META_KEYS`; there is no allowlist omission.

However, `validateActionMetadata()` delegates to `validateFlatMetadata()`, which accepts any scalar or null for each allowlisted key. Only seat fields and indices receive specific validation. Wrong-type values can therefore pass for the actual producer fields:
- booleans: `attackCostPayable`, `stadiumEffectLive`;
- bounded strings: `abilityName`, `cardType`, `sourceZone`, `targetZone`;
- already checked: seat enums and index integers.

Once emitted, `isOwnerVisible` also needs a boolean check. Add wrong-type and invalid-null regressions for actual emitted fields. Keep the allowlist strict.

### 2. Action frontier drops owner/visibility facts it already computes

`targetProjection()` computes `ownerVisible` and returns it, but `actionRow()` does not propagate it into `publicMetadata.isOwnerVisible`. The builder also omits `ownerSeat` even when the target's actor-relative owner is unambiguous. Existing tests cover target/source seat, zone and index but not owner/visibility propagation.

The worker allowlist already includes `ownerSeat` and `isOwnerVisible`; this is a producer mapping gap, not an allowlist gap. Preserve only facts established by the projection. Do not infer visibility from the owner seat or zone.

### 3. Missing/invalid multi-select metadata disables bounds

`multiSelectBounds()` returns `null` whenever `publicMetadata.selectionType` is absent or not in the supported set. `validatePromptMetadata()` does not validate `selectionType`. Consequently, a malformed multi-select prompt can be treated as a single-choice prompt; `validateDecision()` may then accept an ordinary `select-choice` item token rather than requiring `select-choices`.

The production projector has a concrete mapping:
- `ChooseCardsPrompt` → `card-combination`
- `ChoosePokemonPrompt` → `pokemon`
- `ChooseEnergyPrompt` → `energy-payment`
- `ChoosePrizePrompt` → `prize-slots`
- `OrderCardsPrompt` → `card-order`

Require the matching selection type for these native prompt classes; reject missing, null, or unknown values. Validate the full selection-type enum (the projector also uses `attack`, `confirm`, and `option` for single-choice prompts). Add missing/unknown selection-type regressions for each multi-select prompt class.

### 4. Copycat receipt accepts impossible two-row choices

The producer `agent7-copycat-history-root.cjs` returns only zero choices, one unpaired eligible attack, or exactly two members of a verified ordered same-source Ω Barrage pair. The worker validator currently accepts any two unpaired attacks because it only rejects one-sided Barrage metadata. It also does not reject duplicate `eventAttackSignature()` values in `opponentCopycatChoices`.

Require zero or one unpaired row, or exactly two rows with the same pair index, first/second roles, same source printing and distinct attack names. Reject duplicate signatures and independent two-row choices. Retain history-membership, turn-stamp, eligibility and compatibility checks.

### 5. Suppression information is optional in the worker schema and absent from production actor observations

`visiblePokemon()` emits printed abilities and ability details but no `abilitySuppressions`. `publicPlayer()` omits `stadiumAndToolHaveNoEffectTurnsRemaining`. Both are optional in the worker schema, so the real actor observation passes without either signal.

The worker already supports a per-Ability unknown row: `suppressed:null`, `reasonCode:null`, `sourcePrinting:null`. When present, the validator requires a row for every visible Ability. Make the array required for visible Pokémon (including `[]` when there are no Abilities); never treat omission as unsuppressed. The Stadium/Tool epoch is currently optional and integer-only; make it required nullable, and preserve both players' values. Agent6's rank1 `abilityActive()` and `pathLockStatus()` already fail closed when suppression is unknown, so explicit null is compatible with the intended consumer semantics.

Only mark an Ability live/suppressed when trusted public/native evidence supports that conclusion. If suppression is known but its source cannot be attributed, retain unknown rather than fabricate a source printing.

## Recommended integration order

1. Worker protocol owner: type-check emitted action metadata; bind native prompt classes to selection types; enforce exact Copycat choice-set structure and uniqueness.
2. Host owner: propagate actor-relative `ownerSeat` and `isOwnerVisible`; complete explicit nullable suppression projection through the real actor-observation producer.
3. Keep the existing strict contract tests and add producer-backed regressions. Do not add a per-commit workflow.
4. Keep the fixture stopline until the awaited worker loop is actually integrated, host/worker decisions are revalidated before Store dispatch, the hostile canary passes on the reviewed head, and the seed/process trust model is accepted.

## Coordination

Detailed handoffs were sent to:
- `communications/agent36/20261114T124600Z_agent5-action-frontier-metadata-audit.md`
- `communications/agent49/20261114T124600Z_agent5-action-frontier-metadata-audit.md`
- `communications/agent36/202611141247Z_agent5-nullable-suppression-contract.md`
- `communications/agent49/202611141247Z_agent5-nullable-suppression-contract.md`
- `communications/agent49/202611141249Z_agent5-action-metadata-types.md`
- `communications/agent36/202611141249Z_agent5-action-metadata-types.md`
- `communications/agent49/202611141252Z_agent5-worker-validator-multiselect-copycat-review.md`
- `communications/agent35/202611141252Z_agent5-worker-validator-multiselect-copycat-review.md`
- `communications/agent10/202611141252Z_agent5-worker-multiselect-validation-caveat.md`

No worker or host source was modified by this audit. No Node/Actions test, Docker canary, native fixture, paper game, matchup, deck nomination, or competitive win-rate result is claimed.
