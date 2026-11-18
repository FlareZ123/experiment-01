# V3 first-trace policy-audit inventory

**Status:** source-level implementation specification; not gameplay evidence.  
**Reviewed revision:** PR #58 head `94f38a70995bdaed4db13c0328303e345d219aad` (pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`).  
**Review date:** 2026-11-18T15:16:09.780Z.

## Question

What must the first registered V3 trace record to explain each worker-originated decision without fabricating policy rationale, leaking hidden state, or changing the registered policies' choices?

## Sources inspected

| Source | Blob at reviewed PR head | Purpose |
|---|---|---|
| `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` | `990ed2cce06358a0e6e6bc505514469b0de82b05` | Candidate root and prompt policy |
| `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` | `69fc071a4ca862e2e3772802f1a3757055b043a2` | Rank-1 opponent policy |
| `simulation/evaluation/2026-11/agent36-v3-runner.cjs` | `5ea00ac5e2e3491d11ae136711ce32f4f314c7f1` | Worker request/response and runner audit |
| `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` | `d5b0b63e4990fa318f03c8e3538ec002c296c587` | Native prompt projection, action dispatch, validation |

The reviewed runner/game-driver revision has actor-scoped frontiers and validation machinery, but no versioned `policyAudit` field in the worker response or persisted decision record. This document describes the missing diagnostic contract; it does not authorize edits before the exact-SHA no-game acceptance gate.

## Candidate policy: prompt decision semantics

The candidate's prompt handlers are not uniformly numeric. Preserve the exact computation actually used by each branch.

| Handler | Actual behavior to audit | Audit representation |
|---|---|---|
| `chooseCardCombination` | `searchCandidates(view,prompt,choices)` scores each visible actor-owned choice; descending score, then printing lexicographic tie-break. Hand and Battle Compressor deck paths take the first minimum-count rows; other paths take positive-score rows up to max, falling back to minimum-count rows. Arven enforces an Item+Tool pair; empty-selection is a special rule. | Per-choice actual score, sort/tie order, selected tokens; explicit rule code for Arven pair, fallback, empty-selection, or abstention. |
| `choosePokemonRecipient` | Guzma actor-side choices use `bestAttackForSlot` score + 100,000 lethal bonus − 2,000 × Prize liability. Guzma opponent-side choices use attack score (−1,000 if absent) + 1,200 × Prize liability − remaining HP. Other actor targets start at 100 − 5 × attached Energy, with +1,000 Mimikyu vs Regidrago under two Energy, +700 Shadow Rider VMAX when Psychic Energy count <5, +600 Lillie's Clefairy ex vs Dragon under two Energy, and +100 Shadow Rider V. Sort descending, then native target index. | Each actual score and its components/branch, selected tokens, target index tie-break. |
| `chooseEnergyPayment` | Scores each eligible visible actor-owned Energy with `discardValue`; lowest score first, then printing lexicographic order; selects one. | Actual `discardValue`, ascending order, selected token. |
| `chooseAttackPrompt` | Scores attack choices. Apex Dragon→Timeless-GX is 50,000 only with Dialga-GX in discard, unused GX, Dragon target, and Fairy Zone active. Copycat→Apex Dragon is 50,000 only with the recorded opponent Copycat source being Regidrago VSTAR and Dialga-GX/GX-use conditions. Power Beam 200; ordinary Timeless-GX 150; Max Geist (10+30\times PsychicEnergyCount); Full Moon Rondo (20+20\times(total bench count)); Night Watch 150; otherwise parsed damage. Descending score, then token lexicographic tie-break; nonpositive top score abstains. | Actual score per attack, condition/branch code, selected token, tie-break. |
| `chooseCardOrder` | Scores each visible actor-owned card with `searchNeedScore`; descending score, then printing lexicographic order; requires exact count. | Actual score, ordered tokens, tie-break. |
| `choosePrizeSlots` | Selects the first required `selectionIndex` values. No numeric evaluation. | Rule code and selected tokens/indexes. |
| `chooseStartingPokemonSetup` | Preserves native choice order and selects up to max; native prompt has already filtered non-Basics. No policy score. | Rule code, selected tokens, native indexes. |
| `chooseGoFirstSetup` | Deterministically chooses Yes. | Rule code and selected token. |
| `chooseMulliganDrawSetup` | Selects the option maximizing `count - 1 - choiceIndex` (maximum draw count). | Rule code, each option's derived draw count/index, selected token. |
| Single-choice/simple confirmation | Uses safe/known choice rules or abstains. | Rule code, selected token, or explicit abstention reason. |

The candidate's card-selection logic also includes explicit abstention codes for untrusted/hidden choices, invalid bounds, hidden Prize identity, unavailable Arven Item+Tool pair, and no legal set. These are policy outcomes, not scores.

## Rank-1 opponent policy: prompt decision semantics

| Handler | Actual behavior to audit | Audit representation |
|---|---|---|
| `engineSetupPromptDecision` | Starting Pokémon preserves first eligible native order; GO_FIRST chooses Yes; WANT_TO_DRAW_CARDS maximizes draw count. | Rule code, selected token/index, derived draw count for draw options. |
| Guzma Pokémon targeting in `promptDecision` | `500 - remainingHp + 40 \times PrizeLiability`. | Actual score per target and native option-index tie-break. |
| `scorePokemonChoice` | Underworld/Raihan: Latias (135-5E) if E<2; Trevenant (125-5E) if E<3; Girafarig 115 if E<1 and no Dimension Valley; Mimikyu (100-5E) if E<2; Shadow Rider VMAX (95-E); Shadow Rider V (80-E); fallback 25−E for Raihan or 20−E for Underworld. Promotion: if remaining HP>150, (1000-250L+HP), else (100-20L+HP). Acerola: damaged slot (500+damage), plus 100 for Latias; otherwise −1. Evolution mode: Shadow Rider V gets 500, others −1. | Actual mode, per-choice score, branch code, selected token, native order tie-break. |
| `cardSearchScore` | Effect-specific card scores. VS Seeker/Wonder Tag: Acerola 180 for prior Pale Moon + damaged active Latias; Tulip 170 with ≥2 Psychic discard and no Tulip in hand; Raihan 160 after opponent-turn KO; Unfair Stamp 155 after KO or opponent hand ≥ own+3; Teammates 150 after KO; Guzma 140 with weak bench target; Lillie/Carmine 125 at hand≤4; Iono 130 when opponent hand≥own+3; default 20. Other branches score Marshadow/Tapu Lele/Clefairy; Star Alchemy/Forest Seal Stone; Raihan; Fog Crystal; Battle Compressor; Psychic Energy; Mimikyu; Shadow Rider V/VMAX; Radiant Eternatus; Trevenant; Latias; Girafarig; Dialga. | Actual score per option, effect/source branch, selected token, sort order. Preserve the exact source code branch; do not flatten to a single generic card-value score. |
| `discardChoiceScore` | Psychic Energy 10 if another Psychic or Tulip is available, else −100; duplicate Shadow Rider VMAX 20; Carmine/Lillie 30; Unfair Stamp/Raihan/Tulip/Acerola −80; duplicate Shadow Rider V 35; default 50. | Actual score per discard option, selected token, tie-break. |
| `fieldBlowerChoiceScore` | Opponent-owned Path to the Peak/Silent Lab/Garbotoxin 180; opponent Tool 110; opponent Stadium 100; other targets −1. | Actual score per eligible option and selected token. |
| `getLostChoiceScore` | Opponent discard recovery cards 150; Special Energy 140; Supporters 120; VMAX/GX/ex 90; Psychic Energy 65; default 30; only opponent-owned discard-zone choices are eligible. | Actual score per eligible option and selected token. |
| Energy payment | Selects the first eligible Energy choices, up to required count; no score. | Rule code, native order, selected tokens. |
| Prize-slot selection | Selects first required `selectionIndex` values; no score. | Rule code, selected tokens/indexes. |
| Card-order selection | Uses `cardSearchScore` and stable sorting; scores and order must be preserved. | Actual score per option and resulting order. |
| `ChoosePrizePrompt` | Chooses the lowest `choiceIndex`; no score. | Rule code, selected token/index. |
| Copycat `ChooseAttackPrompt` | Max Geist 100; Eon Blade 90; Night Watch −100; default 50. | Actual score per attack, selected token, tie-break. |
| Confirm prompts | Prefer Yes where available, otherwise first safe option. | Rule code, selected token. |
| Fallback/unsupported prompts | Explicitly abstain or choose first supported option as encoded. | Versioned rule/reason code; never invent a score. |

## Required trace contract

1. **Host stores the exact actor-scoped input.** Persist the root `actionFrontier` or prompt projection actually sent to the worker, its digest, the selected token/item(s), the cloned-Store validation receipt, dispatch status, and action ordinal in the encrypted private trace. The host already has the frontier; do not echo large option arrays in the worker response.
2. **Worker reports truthful policy rationale.** Add a versioned actor-only `policyAudit` for every worker-originated root and prompt decision. It contains only scores actually computed in the same scoring pass, component scores where they exist, deterministic tie-break metadata, and explicit rule/reason codes for deterministic/fallback branches. A handler that does not score must not receive a fabricated numeric score.
3. **Host validates correspondence.** Selected tokens must be members of the exact supplied frontier; multi-select count/bounds and selection consistency must validate against the cloned Store. Missing, malformed, oversized, or mismatched required audit fails closed before dispatch.
4. **Prove behavior preservation.** Run audit-on/audit-off paired tests on identical observations/frontiers and policy RNG state. Chosen token(s), action payload, dispatch outcome, and policy RNG draw count must be identical. Test root actions and every supported prompt family for both policies, including worker-originated setup prompts. Host-only physical-randomization prompts are separately tagged and do not fabricate a worker audit.
5. **Respect information boundaries.** Audit fields remain only in the encrypted private trace and owner-generated restricted redacted review export. Do not put hidden opponent cards, deck order, face-down Prize identities, physical RNG state/seed, or omniscient full-state fields into worker inputs or sanitized/public telemetry. The AI-facing export may include only actor-visible options and policy rationale.
6. **Respect size limits.** The current worker response limit is 16 KiB. Do not duplicate the full frontier in the worker audit. If a real worst-case audit exceeds the cap, change worker and host limits together and add boundary tests before dispatch.

## Current status and limitations

- This is source inspection of the frozen policy files at PR head 94f; it is not proof that either policy is strong, legal in every game state, or correctly implemented by Twinleaf.
- The current runner/game-driver revision has no `policyAudit` field. The registered experiment must remain fixed; any post-acceptance instrumentation change must preserve policy behavior and pass its own exact-SHA contract-only → compile/no-fixture → both-role/both-seat native no-game gates before the first fixture.
- If instrumentation changes policy module bytes, update registered policy bundle hashes transparently while keeping the registered 60-card lists, public seed, seat assignments, and actual decisions unchanged.
- The owner requires encrypted-full state capture for the first trace. If `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent or invalid, the registered fixture is owner-blocked; sanitized-only is not an acceptable fallback.

## Next use

Agent49 should use this inventory when implementing the post-acceptance trace-only audit. Agent6 owns first-trace integrity and will review the owner-generated redacted export; Agent42 has offered independent review. Do not dispatch or modify the canonical branch before the existing no-game gate passes.
