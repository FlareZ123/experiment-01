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
| `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` | `63c231ca9801bcc5ec372f0c203fce114964ef3f` | Request/response schema and bounded protocol limits |
| `simulation/evaluation/2026-11/agent49-policy-worker.cjs` | `9a24f21b3eeadaea87c4d0ac684eddbb56d484e4` | Enforces serialized worker-response byte limit |

At exact reviewed head, the host constructs actor-scoped root frontiers and prompt projections and validates selected actions. However, these structures are not currently persisted in the per-action trace. `createV3WorkerDecisionResolver` sends `frontier.actionFrontier` / `projected.promptProjection` to the worker, but in normal game mode it returns only the native action; it does not propagate the frontier, projected choices, opaque selected token(s), or validation evidence to `agent49-native-fixture-game.cjs`. The game driver records `actorObservationBefore` only for root decisions; it does not record the exact root frontier. Prompt decisions do not store the actor observation, projected prompt frontier, or a validation receipt. The root cloned-Store validation receipt is exposed only in `stopBeforeLiveDispatch` no-game witness mode and is not written to the normal `decisionTrace`. The worker response and persisted decision record also have no versioned `policyAudit`. Therefore the existing recorder does not yet satisfy the owner's first-trace requirement; before the registered fixture, extend the same recorder to bind each worker decision to its actor-scoped root/prompt frontier, selected item/token(s), cloned-Store validation receipt, and versioned actor-only `policyAudit`, and preserve it only in the encrypted full-state artifact. Do not add another recorder or run a fixture before the trace-only instrumentation passes its own exact-SHA contract-only → compile/no-fixture → both-role/both-seat no-game gates. This is a source-level instrumentation gap, not a game or competitive finding.

## Root-action scoring semantics

### Candidate policy root

`chooseRoot` evaluates each executable `play-card` using four separate components and selects the maximum component score (not their sum). It then considers retreat, attacks, a specific Resetting Hole ability, and finally Pass/abstention.

| Component | Actual scores and conditions |
|---|---|
| `scoreBasicPlay` | Shadow Rider Calyrex V 1000 if not already on board; Mimikyu 950 vs Regidrago if absent; Lillie's Clefairy ex 900 vs Dragon if absent; Latias ex 650 if absent; Girafarig 450 vs Regidrago if absent; Marshadow 400 if opponent has a Stadium and Marshadow is absent; otherwise `-Infinity`. Requires an actor-owned Bench target. |
| `scoreEvolutionPlay` | Shadow Rider Calyrex VMAX onto Shadow Rider Calyrex V: 970; otherwise `-Infinity`. |
| `scoreEnergyPlay` | Psychic Energy to Mimikyu vs Regidrago with <2 Energy: 920; Shadow Rider VMAX while total Psychic Energy <5 and target Energy <5: 880; Lillie's Clefairy ex vs Dragon with <2 Energy: 840; Shadow Rider V with <3 Energy: 600; otherwise `-Infinity`. |
| `scoreTrainerPlay` | Unfair Stamp after prior opponent-turn KO: 980; Field Blower with Stadium-removal target: 950; Battle Compressor vs Regidrago when Dialga-GX is absent from discard/hand/board and Mimikyu is on board/in hand: 860; Fog Crystal when no Shadow Rider V or Psychic Energy <3: 820; Mysterious Treasure with discardable hand and (Regidrago or no Shadow Rider V): 800; Quick Ball with discardable hand and (no V or Regidrago/no Mimikyu): 790; Ultra Ball with two discardables, V on board and no VMAX: 780; Arven with supporter available and (no V or ability-lock threat without Stealthy Hood): 760; Guzma with supporter available and attack line: 750; Lillie's Determination with supporter available and hand≤3 or deck≤10: 700; Sky Field under its bench/Clefairy condition: 620; Dimension Valley when no active Stadium and a Psychic Pokémon is on board: 600; Stealthy Hood with ability-lock threat and Shadow Rider V on board: 580; otherwise `-Infinity`. Preserve first matching branch. |

- The final play score is `max(basic,evolution,energy,trainer)`; capture all four component values and the winning component/branch.
- Candidate `attackScore`: Copycat is 50,000 only when the public event receipt confirms an eligible Regidrago VSTAR/Apex Dragon source and Dialga-GX/GX-use/Dragon-target conditions hold; otherwise `-Infinity`. Other attacks start at estimated damage×10; a KO adds 10,000 + 500×Prize liability; unused Timeless-GX adds 750; Filch has a 100 floor in the low-hand/high-deck condition; Shadow Mist adds 100 for opponent Stadium or non-Basic Energy. Capture the actual estimated damage and every bonus/condition.
- Candidate `chooseRetreat`: for each valid Bench target, compute `attack.score + (attack.score - currentActiveAttack.score)`; select the highest positive score, preserving native frontier order on ties. This is a scored decision even though the returned response contains only the token.
- Candidate tie/priority semantics: play and attack ties use token lexicographic order; retreat ties preserve frontier order. If any scored play exists, it outranks retreat/attack; otherwise the sequence is retreat → attack → first useful Resetting Hole → Pass → abstain. Capture the selected priority branch, not only the numeric score.

### Rank-1 opponent root

`bestAction` calls `scoreAction` for each frontier item in native order. It updates the best action only when `score > bestScore`, so equal scores preserve the first frontier item. A positive best score wins; otherwise Pass is selected if present.

| Action kind | Actual scoring |
|---|---|
| `pass` | 0. |
| `attack` | `scoreAttack`: Max Geist (120+\min(30,3E)+30\) if KO; Night Watch (124+\min(24,2H)+20\) if KO; Pale Moon-GX (110+35\) if target trapped (+12\) if KO; Eon Blade (105+30\) if KO; Get Lost (88+\min(24,6V)) where V is the count of valuable opponent discard cards; Copycat 132 if a supported target exists, otherwise 0; Energy Drive (85+\min(30,3T)+18\) if KO; other attacks (40+\min(80,printedDamage/2)+15\) if KO. Weakness multiplier and remaining HP are read from the actual observation. |
| `use-ability` | Underworld Door 150 if Psychic Energy in hand; Climactic Gate 145 if Shadow Rider V on board; Resetting Hole 138 if Path lock active, else 0; Star Alchemy 132 if VSTAR power unused; Wonder Tag 122 if Supporter unused, otherwise 65; other abilities 20. |
| `play-card` | Ordered first-match rules: Acerola 175 for prior Pale Moon + damaged active Latias; Tulip (160+\min(9,3\times PsychicDiscard)); Raihan 155 after opponent-turn KO with Psychic discard; Teammates 138 after KO; Unfair Stamp 142 for KO/opponent hand gap/opponent Prize condition; Field Blower 140 for Path lock with Underworld Door; Battle Compressor 118 under its Supporter/Psychic-discard condition; Mysterious Treasure 132 for its V/Mimikyu/Marshadow/Clefairy setup condition; Marshadow 138 for Path lock; Tapu Lele 110 without Supporter in hand and Supporter unused; Clefairy 130 vs Dragon without Fairy Zone; Mimikyu 118 with Copycat target; Fog Crystal 108 for Psychic/setup need; Quick Ball 102 for V/Clefairy setup; Forest Seal Stone 105 if VSTAR unused and VMAX on board; VS Seeker 100 for Psychic discard or prior KO; Night Stretcher 96 with Psychic discard and no Psychic in hand; Lillie's Determination 86 with Supporter available and hand≤4; Iono 90 with Supporter available and hand≤3 or opponent hand gap; Carmine 82 with Supporter available and hand≤4; Guzma 92 with weak Bench target; Acerola 92 for damaged Latias at ≤120 HP; Sky Field 80 under its Bench/hand condition; Dimension Valley 78 with no active Stadium; Float Stone 76 for an untooled Latias; default 0. Capture the first matching branch and actual returned value. |
| `retreat` | Invalid target/active: 5. Shadow Rider VMAX target gets 128 if Max Geist can KO the active and active is not an attacker or is locked. Otherwise attacker target gets 84 if active is not an attacker or is locked; else 8. |
| `use-stadium` | 45. |
| Other | 0. |

Rank-1 root audit must capture the actual score for every frontier item, action kind, first-match branch/reason, and native frontier index. Do not sort/recompute and thereby change the policy's stable tie behavior.

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

## Protocol-level change required

The worker protocol is deliberately strict. At the reviewed head, `RESPONSE_SCHEMA = 'aichi-policy-response-v4'`, `REQUEST_SCHEMA = 'aichi-policy-request-v2'`, `OBSERVATION_SCHEMA = 'aichi-actor-observation-v3'`, `PROMPT_SCHEMA = 'aichi-owner-prompt-projection-v3'`, and `FRONTIER_SCHEMA = 'aichi-action-frontier-v1'`. Adding a required audit should version the response contract and the `policyAudit` payload explicitly; coordinate worker and host together rather than silently extending v4.
- `validateRequest` requires the request envelope to include `schema`, `type`, `requestId`, `sequence`, `role`, `seat`, `observationSchema`, `observation`, `prompt`, `publicEventReceipt`, and `actionFrontier`. The host already supplies the exact frontier/prompt projection and the public event receipt.
- `validateDecision` currently uses `exactKeys`: `select-action` and `select-choice` accept only `kind,token`; `select-choices` accepts only `kind,tokens`; `abstain` accepts only `kind,reasonCode`. Therefore a worker cannot simply append `policyAudit`: the current protocol rejects it as `UNKNOWN_FIELD`.
- A versioned response schema must explicitly allow and validate the audit on every worker-originated decision, with required audit version/kind, bounded scored rows, token membership, numeric finiteness, rule/reason codes, and deterministic tie metadata. Host persistence must attach the accepted audit to the same decision/action ordinal.
- `assertNoForbiddenFields` rejects fields whose names imply RNG/seed/entropy, native/full state, opponent hand/Prizes, deck order, or hidden zones. Keep those prohibitions; the worker audit must contain only actor-visible scoring/rule rationale and tokens.
- `multiSelectBounds` already validates the host's exact multi-select prompt contract (card-combination, Pokémon, energy-payment, Prize slots, card order). Audit validation must reuse those bounds and not weaken token/count validation.

## Required trace contract

1. **Host stores the exact actor-scoped input.** Persist the root `actionFrontier` or prompt projection actually sent to the worker, its digest, the selected token/item(s), the cloned-Store validation receipt, dispatch status, and action ordinal in the encrypted private trace. The host already has the frontier; do not echo large option arrays in the worker response.
2. **Worker reports truthful policy rationale.** Add a versioned actor-only `policyAudit` for every worker-originated root and prompt decision. It contains only scores actually computed in the same scoring pass, component scores where they exist, deterministic tie-break metadata, and explicit rule/reason codes for deterministic/fallback branches. A handler that does not score must not receive a fabricated numeric score.
3. **Host validates correspondence.** Selected tokens must be members of the exact supplied frontier; multi-select count/bounds and selection consistency must validate against the cloned Store. Missing, malformed, oversized, or mismatched required audit fails closed before dispatch.
4. **Prove behavior preservation.** Run audit-on/audit-off paired tests on identical observations/frontiers and policy RNG state. Chosen token(s), action payload, dispatch outcome, and policy RNG draw count must be identical. Test root actions and every supported prompt family for both policies, including worker-originated setup prompts. Host-only physical-randomization prompts are separately tagged and do not fabricate a worker audit.
5. **Respect information boundaries.** Audit fields remain only in the encrypted private trace and owner-generated restricted redacted review export. Do not put hidden opponent cards, deck order, face-down Prize identities, physical RNG state/seed, or omniscient full-state fields into worker inputs or sanitized/public telemetry. The AI-facing export may include only actor-visible options and policy rationale.
6. **Respect size limits.** The protocol declares `LIMITS.maxResponseBytes = 16 * 1024` and the worker rejects serialized responses above that limit as `RESPONSE_TOO_LARGE`. Do not duplicate the full frontier in the worker audit. If a real worst-case audit exceeds the cap, change worker and host limits together and add boundary tests before dispatch.

## Confirmed candidate root-action coverage gap (source fact)

The candidate `chooseRoot` explicitly admits `use-ability` and `use-stadium` in its filtered frontier, but its only ability-selection branch is:

- select `use-ability` **only** when `publicMetadata.abilityName === 'Resetting Hole'` and `hasStadiumRemovalTarget(view)`.

It never scores or selects Underworld Door, Climactic Gate, Star Alchemy, Wonder Tag, or any other `use-ability`; it also has no `use-stadium` selection branch. By contrast, the rank-1 policy's `scoreAction` explicitly assigns Underworld Door 150, Climactic Gate 145, Resetting Hole 138 (when Path lock is active), Star Alchemy 132, and Wonder Tag 122/65. The protocol's `EXECUTABLE_ACTION_KINDS` explicitly includes both `use-ability` and `use-stadium`, so these are supported executable action kinds, not protocol-unsupported placeholders.

**This is a confirmed policy-code coverage gap, not yet a demonstrated game loss.** Whether an ability is offered depends on the exact game state and engine frontier. In the first registered trace, inspect the candidate's actual frontier for each `use-ability`/ `use-stadium` item and record whether it is selected or ignored. The audit must not fabricate a score for an unhandled ability; record an explicit unsupported/unscored branch. Keep the registered policy frozen through the first trace. Afterward, add targeted tests and compare a repaired policy under the common opponent panel before deciding whether to change the fixed 60/deck policy.

## Field-test hypothesis (not a conclusion)

The candidate's `scoreBasicPlay` gives Shadow Rider Calyrex V 1000 whenever no V is already on board, while Mimikyu receives 950 only against Regidrago when absent. If both are simultaneously in the frontier, the current root policy therefore prefers Shadow Rider V first. The human concept notes a Regidrago/Apex Dragon → Mimikyu Copycat line, while the candidate later gives Mimikyu high Energy priority and Copycat/Apex Dragon attack score when its receipt conditions are met.

**Hypothesis:** in Regidrago matchups, bench capacity or hand/resource sequencing may make the 50-point opening preference consequential if Mimikyu is delayed. This is not evidence of a misplay: Shadow Rider V may still be the correct engine investment, and the exact line depends on state and opponent policy. Test only after the first registered trace and common-policy field harness are ready, using a competent Regidrago opponent, both physical seats, natural-terminal games, and policyAudit. Do not change the frozen candidate from this source-level observation alone.

A second structural hypothesis follows from the same source: `chooseRoot` selects any positive-scored play before considering retreat or attack, and selects any positive retreat before considering attack. It does not compare the retreat score against the available attack scores. This may delay an immediate high-value or lethal attack for a setup play/retreat that only looks locally better under its own heuristic. The rank-1 policy instead scores all root action kinds on one scale and preserves native frontier order on ties. Test candidate positions with (a) an immediate KO/tempo attack plus a scored play and (b) an immediate attack plus a positive retreat. Record the exact frontier, all component scores, and the action actually chosen. This is a policy-structure risk, not proof of a mistake.


## Current status and limitations

- This is source inspection of the frozen policy files at PR head 94f; it is not proof that either policy is strong, legal in every game state, or correctly implemented by Twinleaf.
- The current runner/game-driver revision has no `policyAudit` field. The registered experiment must remain fixed; any post-acceptance instrumentation change must preserve policy behavior and pass its own exact-SHA contract-only → compile/no-fixture → both-role/both-seat native no-game gates before the first fixture.
- If instrumentation changes policy module bytes, update registered policy bundle hashes transparently while keeping the registered 60-card lists, public seed, seat assignments, and actual decisions unchanged.
- **Superseded 2026-11-20 for Stage A:** the original encrypted-full-first-trace requirement above was replaced by the Critic's sanitized-only correction and the current Stage-A decision in `results/README.md`, `agents/agent6/first-trace-acceptance.md`, and Agent1's canonical field panel. The registered first diagnostic may run `sanitized-only` when no valid recipient key is configured; it remains pipeline-only evidence. This does **not** satisfy Stage-B private actor-choice competence or Stage-C PUCT adapter binding, which still require owner-authorized evidence binding each exact actor-visible observation to its choice, native resolution/rejection/abstention, and source-state reference. Keep the actor-only worker boundary mandatory. The owner's issue #59 decision explicitly authorizes public seed reproducibility and hidden-zone reconstructability; whether it also authorizes a public private-observation/audit export remains under review. Do not assume that broader authorization or publish raw private details without an explicit owner-authorized evidence path and independent integrity review.

## Next use

Agent49 should use this inventory when implementing the post-acceptance trace-only audit. Agent6 owns first-trace integrity and will review the owner-generated redacted export; Agent42 has offered independent review. Do not dispatch or modify the canonical branch before the existing no-game gate passes.
