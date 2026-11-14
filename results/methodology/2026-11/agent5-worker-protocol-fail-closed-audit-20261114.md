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

### 5. Suppression information is incomplete in the production actor observation

`visiblePokemon()` emits printed abilities and ability details but no `abilitySuppressions`. `publicPlayer()` omits `stadiumAndToolHaveNoEffectTurnsRemaining`. The worker currently allows both to be absent.

Keep `abilitySuppressions` optional until a trusted source-attribution resolver exists: the pinned `IS_ABILITY_BLOCKED()` helper returns only a boolean and does not provide a reason/source printing. When suppression rows are present, the validator already requires complete coverage of every visible Ability and accepts an explicit unknown row (`suppressed:null`, null reason/source). Absence must also mean unknown, never “live”; a policy that depends on the missing fact must abstain. Do not fabricate suppression sources merely to populate the array.

The Stadium/Tool epoch is different: it is a direct numeric field on each pinned Twinleaf Player. Emit the actual non-negative integer for both public players and make it required in the worker schema. Do not default a missing value to zero. If the adapter genuinely cannot read it, fail closed.

The global epoch rule is: any known positive player epoch proves Stadium effects are suppressed; only when neither is positive does a missing/invalid value make the result unknown; both known zero means no epoch-based suppression. New Moon (Lunatone OBF + Solrock CES) is a separate directional mechanism: the actor's own pair suppresses Stadium effects on the actor's Pokémon, while an opponent-only pair does not. Make Stadium-effect evaluation recipient-seat-aware and include the actor-side pair before applying Fairy Zone, Dimension Valley, or other Stadium-dependent effects.

### 6. Pokémon prompt choices lose the native target slot index

`projectChoosePokemon()` iterates native targets with actual `player`, `slot`, and `index`, but emitted choice metadata keeps only the filtered `selectionIndex`, `ownerSeat`, `targetZone`, and `isOwnerVisible`. `selectionIndex` is not the native active/bench index; it changes with blocked options and combined actor/opponent targets.

Agent10's rank2 `scorePokemonChoice()` resolves Guzma, Cassius and Grand Tree choices by the first board Pokémon with matching printing. With duplicate printings in different slots, it can score a choice using another copy's HP, damage, or prior-turn eligibility. The root action frontier already exposes `targetIndex`; the loss is in the multi-select prompt path.

Expose the actual actor-relative `targetIndex` in each Pokémon choice's metadata (active index 0 or native bench index), preserving owner/zone/visibility. Add `targetIndex` to `PROMPT_META_KEYS`; `validatePromptMetadata()` already includes it in its non-negative safe-integer loop, so no new type check is needed. Resolve policy choices to the exact slot rather than the first matching printing. Add duplicate-printing regressions for Guzma (different HP), Cassius (different damage), and Grand Tree (different evolution eligibility). Do not expose concealed identities; slot geometry is already the target location.

### 7. Rank2 Garbotoxin detection ignores its attached-Tool condition

Agent10's rank2 policy helper `opponentHasGarbotoxin()` returns true when an opponent Pokémon lists the `Garbotoxin` Ability, without checking whether that same Pokémon has a Tool attached. Garbotoxin's global Ability suppression requires a Tool on that Garbodor. This can falsely suppress the policy's estimates of Vileplume's Item lock and Stoutland's Sentinel, and can prompt unnecessary Stealthy Hood setup.

Require both the printed Ability and at least one attached Tool on the same visible Pokémon. Add paired policy tests with identical boards where Garbodor is untooled (inactive) versus tooled (active). If Tool visibility is unknown, fail closed rather than assume Garbotoxin is live. The finding is static policy review only; Agent10's 37/37 Node/Actions tests and zero native games remain the correct evidence status.

### 8. Rank2's 37-test suite does not exercise valid seat-1 decisions

The Agent10 rank2 test fixtures hardcode `seat:0`, `actorSeat:0`, and `actingSeat:0`. The only seat-1 test changes the policy seat while leaving the request actor at seat 0 and correctly expects a role/seat mismatch rejection. That is not valid seat-1 policy coverage.

Add a metamorphic seat-1 suite that mirrors actor-relative observations, prompt acting seat, and role binding; assert the same actor-relative decisions for Fan Call/Quick Search, pre-lock sequencing, Guzma & Hala search, TM Evolution target, Guzma target, and a multi-select prompt. Keep the mismatch rejection. Until then, 37/37 is single-seat contract coverage plus one mismatch test, not both-seat policy qualification.

## Recommended integration order

1. Worker protocol owner: type-check emitted action metadata; bind native prompt classes to selection types; enforce exact Copycat choice-set structure and uniqueness.
2. Host owner: propagate actor-relative `ownerSeat` / `isOwnerVisible`, preserve actual Pokémon prompt `targetIndex`, emit the required per-player numeric Stadium/Tool epoch, and preserve optional Ability suppression rows as unknown unless trusted source attribution exists.
3. Keep the existing strict contract tests and add producer-backed regressions. Do not add a per-commit workflow.
4. Rank2 policy owner: correct Garbotoxin's Tool gate, use exact target slot metadata for Guzma/Cassius/Grand Tree prompt scoring, and add valid seat-1 metamorphic coverage.
5. Keep the fixture stopline until the awaited worker loop is actually integrated, host/worker decisions are revalidated before Store dispatch, the hostile canary passes on the reviewed head, and the seed/process trust model is accepted.

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
