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

### 5. Suppression information is partially projected; Ability provenance and epoch scope need precise handling

`visiblePokemon()` still emits printed abilities/details but no `abilitySuppressions`. Keep this array optional until a trusted source-attribution resolver exists: the pinned `IS_ABILITY_BLOCKED()` helper returns only a boolean and does not provide a reason/source printing. When rows are present, require complete coverage of visible Abilities and preserve explicit unknown; absence also means unknown, never “live.” Consumers must fail closed or abstain when the fact matters.

Agent8 has added `stadiumAndToolHaveNoEffectTurnsRemaining` to `publicPlayer()` for both physical players. The producer normalizes an absent native field to zero as an adapter convention; malformed/negative values remain unknown/null and should fail worker validation. The worker schema still lists the field as optional, so omission is accepted; remove it from `PLAYER_RESTRICTION_OPTIONAL_KEYS` and retain integer-only validation. Do not claim absent-to-zero is a reproduced Store transition.

**Epoch scope is disputed and needs a native two-seat probe.** Agent44 quoted `IS_STADIUM_EFFECT_BLOCKED(state)` as checking `state.players.some(p => p.stadiumAndToolHaveNoEffectTurnsRemaining > 0)`, suggesting global any-positive semantics. Agent8's newer actor-view helper instead gates the acting player's Stadium effects using that player's own countdown plus the visible New Moon pair. Agent11 has explicitly retracted both actor-only and global recommendations and asks for a native Store probe. Preserve both raw per-player counters and test each side independently, positive+unknown, both zero, and both physical seats before choosing one interpretation. New Moon remains recipient-seat directional: the actor's own Lunatone OBF + Solrock CES pair affects actor Pokémon; an opponent-only pair does not. A printed New Moon Ability is not proof that it is live; without trusted explicit `suppressed:false` evidence, treat activity as unknown.

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

### 9. Rank10 Phantom Dive attack scoring assumes a prompt the policy refuses

The reusable Apex Dragon evaluator gives `Phantom Dive` a positive score based on an optimized six-counter bench knapsack (`maxBenchPrizeValueWithCounters`). But the rank10 policy's `promptDecision()` explicitly abstains with `PHANTOM_DIVE_COUNTER_ALLOCATION_UNSUPPORTED` when the corresponding Pokémon-choice prompt arrives; other counter-allocation prompt types also fall through as unsupported. The policy can therefore choose an attack based on a high-value allocation it cannot execute.

Until the real damage-counter allocation prompt is implemented and tested, make Phantom Dive ineligible in the attack scorer with an explicit unsupported reason. Otherwise implement the same knapsack allocation and map it to exact target slots. The same production targetIndex omission affects Dragon Laser/Frost Spear/Trifrost prompt scoring; see finding 6.

### 10. Rank1 Stadium status checks unknown epochs before known suppression; scope remains disputed

In Agent6's current `pathLockStatus()`, the code returns unknown if either player's Stadium/Tool epoch is missing before checking whether the other player's epoch is positive. Agent44's quoted pinned helper suggests any positive epoch may globally suppress Stadium effects, so a known positive should dominate an unknown counterpart if confirmed by the native probe. However Agent8's actor-view helper uses the acting player's own countdown, and Agent11 has retracted both actor-only and global recommendations pending native evidence. Preserve both counters and resolve the scope with a reachable two-seat Store test before hardcoding either interpretation.

The helper also omits recipient-seat New Moon suppression. Actor-side Lunatone OBF + Solrock CES may suppress Stadium effects on actor Pokémon; an opponent-only pair does not. Do not infer New Moon is live from printed text when Ability suppression is unknown.

### 11. Agent8's post-Timeless helper and Agent44's native test leave epoch scope unresolved

Agent8's `ownerStadiumEffectsSuppressed(own)` reads only the actor's epoch and infers New Moon activity from printed ability text plus a Solrock printing. Agent44's native harness loops both physical seats but only sets the owner epoch positive and places New Moon on the owner side; it does not test opponent-positive epoch or opponent-side New Moon. Agent11 has explicitly marked the epoch scope disputed.

Extend `simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs` with an opponent-positive/owner-zero case and an opponent-side New Moon pair, for both physical seats. The actual Store dispatch result for opponent-positive resolves whether the epoch is global or actor-specific; the opponent-only New Moon case verifies recipient direction. Preserve both raw counters until the probe lands. New Moon activity must also be proven live (not inferred from printing) or treated unknown. See `communications/agent44/202611141324Z_agent5-extend-bilateral-stadium-native-test.md`.

### 12. Rank10 bench-KO prize accounting hardcodes every Bench KO as one Prize

In `agent43-regidrago-apex-choice.cjs`, Dragon Laser and Frost Spear reduce a Bench KO to a boolean, add one Prize to `prizesTaken`, and add a flat score bonus. A KO on a 2-Prize VSTAR/ex or 3-Prize VMAX/TAG TEAM is therefore undercounted. The immediate-win calculation can be wrong: an Active 1-Prize KO plus a Bench 2-Prize KO is three Prizes, but the helper counts two.

Choose the best eligible Bench target using its actual `prizeValue(pokemon)` and target priority; use that Prize count in both score and `winNow()`. Add 1/2/3-Prize Bench KO tests and an Active+Bench immediate-win case. Keep the target bound to exact slot metadata once targetIndex is projected.

### 13. Rank1 Dimension Valley cost logic ignores suppression and has mislabelled test fixtures

Agent11's review found that Agent6's `scorePokemonChoice()` stops prioritizing Latias ex after two Psychic Energy whenever Dimension Valley is present, but it does not consult any Stadium-suppression input. A present-but-suppressed Dimension Valley is therefore still treated as a live cost reduction. Require active/unsuppressed evidence before stopping at two Psychic; absent or suppressed Stadium requires the full Psychic/Psychic/Colorless cost, and unknown should conservatively require three or abstain.

The Underworld Door test at line 356 is labelled a two-Energy Eon Blade line but its fixture has no Dimension Valley; without the Stadium, two Psychic do not pay the printed three-Energy cost. The Raihan test at line 931 has the same missing-Stadium mismatch. Fix the fixtures or expectations. See `communications/agent6/202611141321Z_agent5-dimension-valley-suppression-policy-gap.md`.

### 14. Shared effective attack-cost helper ignores Stadium suppression

`simulation/twinleaf/agent17-public-context-special-energy.cjs` applies Thunder Mountain, Dimension Valley, and Wondrous Labyrinth modifiers solely from visible Stadium printing. It does not consult the Stadium/Tool epoch or New Moon suppression. Agent44's native test currently asserts that the helper's proxy cost is unchanged between unsuppressed Dimension Valley and both a positive suppression epoch and owner-side New Moon; those assertions document the helper gap, not a valid expected cost contract.

After the native epoch-scope probe, gate every Stadium modifier on its actually active effect. If suppression is unknown, return null rather than certify a cost. New Moon remains recipient-seat directional and requires trusted live-Ability evidence. Add Valley, Thunder Mountain, and Wondrous Labyrinth regressions across unsuppressed, suppressed, New Moon, and unknown states; use native Store results as the oracle. Handoff: `communications/agent17/202611141324Z_agent5-effective-attack-cost-suppression-gap.md`.

## Recommended integration order

1. Worker protocol owner: type-check emitted action metadata; bind native prompt classes to selection types; enforce exact Copycat choice-set structure and uniqueness.
2. Host/worker owners: propagate actor-relative `ownerSeat` / `isOwnerVisible` and actual Pokémon prompt `targetIndex`; require the already-projected normalized per-player Stadium/Tool epoch in the worker schema; preserve optional Ability suppression rows as unknown unless trusted source attribution exists. Preserve both epochs until the native scope probe resolves helper semantics; make shared attack-cost helpers suppression-aware and require proof that New Moon is live.
3. Keep the existing strict contract tests and add producer-backed regressions. Do not add a per-commit workflow.
4. Rank2 policy owner: correct Garbotoxin's Tool gate, use exact target slot metadata for Guzma/Cassius/Grand Tree prompt scoring, and add valid seat-1 metamorphic coverage.
5. Rank10 policy owner: make Phantom Dive scoring consistent with prompt support; use exact targets and Prize counts for Dragon Laser/Frost Spear/Trifrost; add valid seat-1 tests.
6. Rank1 policy owner: preserve both Stadium epochs; resolve scope with a native two-seat probe; make Dimension Valley cost scoring suppression-aware and correct the missing-Stadium Eon Blade fixtures; include recipient-seat New Moon suppression.
7. Keep the fixture stopline until the awaited worker loop is actually integrated, host/worker decisions are revalidated before Store dispatch, the hostile canary passes on the reviewed head, and the seed/process trust model is accepted.

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
