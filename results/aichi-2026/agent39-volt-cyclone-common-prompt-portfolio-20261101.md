# Agent39: first shared Store paper-prompt contract for original rank-6 Volt Cyclone

**1 November 2026. Development-only, paper-contract engineering; zero competitive-qualified games.**

## Problem and independent printed contract

The original rank-6 Iron Thorns ex `TWM 77` attack **Volt Cyclone** says: `Move an Energy from this Pokémon to 1 of your Benched Pokémon.` The pinned Twinleaf source (`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`) produces a mandatory `AttachEnergyPrompt` with `min=max=1` and `allowCancel=false`, but `Store.reducePrompt` directly assigns `prompt.result=action.result` and executes callbacks without invoking `prompt.validate`. Thus native Store acceptance alone does not prove paper correctness. The scope is a **printing-specific** attacked Energy transfer, not arbitrary prompt legality.

The previously archived 32 frozen rank6/11 v2 arms contain 27 such AttachEnergyPrompt resolutions from original rank6, with 27 native accepted public-board deltas. Their paper legality remained independently **unverified** in [Agent17's full 4,331-prompt denominator](agent17-frozen-v2-prompt-denominator-20261101.md). The preceding archive cannot be upgraded by retrospective enforcement.

## Implemented shared boundary

`simulation/twinleaf/agent39-paper-prompt-portfolio.cjs` provides `withPaperPromptPortfolio`, an explicitly opt-in and reversible **single Store dispatch** wrapper. The corresponding original Iron Thorns ex reducer stamps newly created prompts in a WeakSet by actual attack origin; other prompts are `PAPER_PROMPT_UNVERIFIED`. At a stamped native `ResolvePromptAction`, the check independently requires:

1. The prompt comes from the actor's attacking Pokémon's physical Active card list, with the expected source-facing `AttachEnergyPrompt` geometry.
2. Exactly one physical Energy is currently attached to that Active Pokémon.
3. The destination is an occupied, own Benched Pokémon in range.
4. Native `prompt.validate` also accepts the reply.

A violation is classified `PAPER_PROMPT_INVALID` and rejected before dispatch; an accepted checked reply becomes `PAPER_PROMPT_VERIFIED` only for this precise predicate. All statuses, root turns, limited counts, guard successes and failures are retained with no selected card identities exported. `Store.dispatch` and the card reducer are restored after success or exception. The opt-in still cannot certify every future effect, game, or strategy decision.

Integration: `simulation/evaluation/agent41-bilateral-v2-development.cjs`, with default-off `paperPromptPortfolio` option and `AGENT39_PAPER_PROMPT_PORTFOLIO_DEV=true` CLI environment. The existing **manually dispatched** `.github/workflows/aichi-source-locked-campaign.yml` activates this via `agent41_crossrank_trial=true`, `trial_ids=agent41-bilateral-v2-dev`, `agent41_dev_options=paper-prompt-portfolio`. It retains separate native abort receipts and the full historical action denominator. No new workflow was created and no existing baseline flag was altered.

## Tests, CI, and limits

- `tests/agent39-paper-prompt-portfolio.test.cjs`: controlled Store model, both physical seats, duplicate/empty/foreign Energy and invalid Bench recipient rejections before state mutation, valid transfer after rejection, native acceptance audit, wrapper restoration, and an unattributed prompt that remains explicitly unverified. Four tests passed in local Node and are wired into the existing manual CI.
- `simulation/twinleaf/agent39-volt-cyclone-paper-native.cjs`: a **staged real pinned Store** control for both seats, exercising an original Iron Thorns ex TWM after-attack reducer. It compares a genuine unguarded empty transfer despite `min=1` against a guarded invalid rejection and guarded valid one-Energy settlement, with no vendor modifications. This is a direct prompt contract fixture and explicitly omits full attack payment/Prize/game qualification.
- First manual run [41329083686](https://github.com/FlareZ123/experiment-01/actions/runs/41329083686) failed at the existing VM wiring test harness (three `MODULE_NOT_FOUND` errors resolving `../twinleaf/canceling-cologne-once-per-turn-hook.cjs` from the test directory rather than the runner directory). Its other 54 regression tests passed, and it did not enter a genuine game test. The harness fallback has been fixed in `tests/agent41-bilateral-native-pressure-wiring.test.cjs`; the manual rerun [41329333283](https://github.com/FlareZ123/experiment-01/actions/runs/41329333283) was triggered on the same option set. **Its final result must be inspected before any native pass claim.** The staged native fixture was added to that manual workflow after rerun dispatch, so requires a distinct later run for actual native execution.

## Release classification and next research

This source-specific guard cannot certify the 27 frozen historical resolutions without source-identical, prospective independent replay; all historically accepted prompt families remain `PAPER_PROMPT_UNVERIFIED`. A candidate for the common portfolio is original rank1 CRE74 Astral Barrage / rank31 SIT59 Painful Spoons when separate guards meet the same invalid, valid, restoration and native-source-exposure requirements. A full-denominator matched original 32-physical-deal replay, two-seat policy competence, original-source 60 coverage and Aichi's real wall-clock outcomes remain open. **29/32** original opposing lists authenticated, **0 competitively qualified games**, **no demonstrated 99.5% fixed-60 win rate**.

## Exact sources

- Official card/rules basis: uploaded `advanced-players-rulebook.md`, especially attack effect resolution, Energy moving, and Trainer/Ability legality; original printed attack `Iron Thorns ex TWM`.
- Pinned upstream card: `ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts`.
- Pinned engine dispatcher: `ptcg-server/src/game/store/store.ts`, `reducePrompt`.
- Source portfolio baseline: `results/aichi-2026/agent17-frozen-v2-prompt-denominator-20261101.md`.


## 17:08 UTC native compiled confirmation (replaces prior pending wording)

The fully pinned native CI [41329727282](https://github.com/FlareZ123/experiment-01/actions/runs/41329727282), research head `9dff16cbc1639b35995be167b5e449f18edb4f99`, completed **successfully** and executed the additional two-seat staged native differential. Each source seat **0 and 1** independently showed:
- Real unguarded `ResolvePromptAction(result=[])` was accepted despite the printed mandatory transfer and pinned native `min=max=1`; the Energy remained on Iron Thorns ex.
- The research-owned shared Store pre-dispatch boundary rejected that exact invalid reply with the native state unchanged, including pending-prompt status.
- A subsequent physically valid one-Energy transfer from the Active to a populated own Bench settled in the **real pinned Store**, and both patched method descriptors were restored.
- Per-seat native observer: one authentic source-marked `AttachEnergyPrompt`, one `PAPER_PROMPT_INVALID` veto, one `PAPER_PROMPT_VERIFIED` native accepted resolution. Staged fixture, without a genuine full `AttackAction`, full original physical sixty, or gameplay win.

Also, the prior successful [41329333283](https://github.com/FlareZ123/experiment-01/actions/runs/41329333283), artifact `13091629886`, returned exactly **four historical development attempts** under the opt-in Store portfolio: 2 engine terminals and 2 action caps. The direct artifact inspection found:

| Historical trial ID | Raw all-Store checked events | Invalid veto | Unverified all-Store attempts | Native rejected after preflight | End |
|---|---:|---:|---:|---:|---|
| `6:0:A:champion-reference` | 0 | 0 | 115 | 0 | engine terminal |
| `6:0:A:new-moon-lockbreaker-v1` | **10** | 0 | 719 | 1 | 260-action cap |
| `11:2:B:champion-reference` | 0 | 0 | 492 | 0 | engine terminal |
| `11:2:B:new-moon-lockbreaker-v1` | 0 | 0 | 937 | 50 | 260-action cap |

The ten raw checked all-Store events came from the original rank-6 `Volt Cyclone` attack and satisfied the physical recipient/source constraint at their respective Store states. These are repeated simulator/live observations, as established in the live-partition correction below. The `nativeRejectedAfterPreflight` counts are for other, unverified prompt types; these are not paper-invalid findings. The 4-arm cohort is historically selected and unqualified. It does **not** replay the frozen-v2 32 arms from Agent17's larger denominator. The run does not certify complete effects after every submitted response or future interventions, and the provenance/version labels must be kept distinct.


## Material source-denominator correction, live Store partition (17:20 UTC)

An independent inspection of the **original native action ledger** found an inflation problem in the initial all-Store wrapper counts. A genuine original-source rank-6 New Moon native game has **five** distinct live `Volt Cyclone` AttachEnergyPrompt roots, at turns 4, 6, 26, 28, and 34, plus one separate candidate-owned AttachEnergyPrompt on turn 33 (unverified). The initial wrapper emitted **ten** paper-checked source events as **two identical `(turn,promptId)` entries each**: (4,33), (6,52), (26,119), (28,129), (34,170). The extra five came from auxiliary Store activity. The earlier ten-event count is **superseded by five authentic live-game source responses**.

In [v2 compiled green CI 41330576115](https://github.com/FlareZ123/experiment-01/actions/runs/41330576115), artifact `13092794548`, `withPaperPromptPortfolio` `agent39-paper-prompt-portfolio-v2-live-store-attribution` identifies the genuine live Store by first `AddPlayerAction`, exactly as the independent `accepted-energy-prompt-public-witness.cjs` already does. It keeps all speculative/auxiliary event attempts for debugging, with separate `storeOrdinal`, `storeScope`, and `livePaperVerifiedNativeAccepted` counters. Four game rows show:

| Historical trial | Actual native ResolvePromptAction roots | Live Store prompt attempts | Auxiliary Store prompt attempts | Verified live Volt Cyclone | Raw all-Store verified |
|---|---:|---:|---:|---:|---:|
| `6:0:A:champion-reference` | 56 | 56 | 59 | 0 | 0 |
| `6:0:A:new-moon-lockbreaker-v1` | 174 | 174 | 555 | **5** | 10 |
| `11:2:B:champion-reference` | 129 | 129 | 363 | 0 | 0 |
| `11:2:B:new-moon-lockbreaker-v1` | 161 | 161 | 776 | 0 | 0 |
| **Total** | **520** | **520** | **1,753** | **5** | **10** |

This is exact per-game native-root-count equality for all four completed-or-censored historical rows. There were zero live native preflight rejections in this run. The auxiliary 1,753 dispatch attempts (including speculative decisions and rejected prompts) are **excluded from the live game denominator**.

The reusable `simulation/evaluation/agent39-print-prompt-root-reconciliation.cjs` also checks individual original-source `AttackAction: Volt Cyclone` parent linkage, original seat, attack name, exact turn histogram, and native accepted prompt root count, requiring an observed live Store. Its statuses fail closed on missing identity, mismatched counts or wrong parent, and distinguish source-not-exposed. `tests/agent39-paper-prompt-root-reconciliation.test.cjs` covers synthetic duplicates, provenance gaps and wrong parent. That reconciliation was integrated into the canonical runner after the cited CI was started and requires another compiled run to confirm output field correctness.

This is a **significant evidence-denominator correction**. None of the five live receipts alone is a competitively qualified game or a proof of the complete attack. Frozen-v2 32-arm evidence with 27 original-source Volt Cyclone prompts remains a separately versioned archived cohort.


### Native attack-parent root reconciliation completed

[Compiled green manual CI 41331029723](https://github.com/FlareZ123/experiment-01/actions/runs/41331029723), artifact `13092954101`, executed the actual canonical runner with the newly integrated `paperPromptOriginalSourceRootReconciliation` in every row. Its four printed-source statuses were:

1. rank6 `6:0:A:champion-reference`: `NO_SOURCE_VOLT_PROMPTS`, 0 source attack roots, 0 checked live replies.
2. rank6 `6:0:A:new-moon-lockbreaker-v1`: `LIVE_PRINTED_SOURCE_PROMPTS_MATCHED`, **5** genuinely accepted original source Volt Cyclone parent roots, **5** live paper-checked accepted replies, **5** auxiliary checked events explicitly excluded. Original-source turn:seat histograms both `4:1, 6:1, 26:1, 28:1, 34:1`, exactly one each.
3. rank11 `11:2:B:champion-reference`: `NO_SOURCE_VOLT_PROMPTS`, no source Volt attacks.
4. rank11 `11:2:B:new-moon-lockbreaker-v1`: `NO_SOURCE_VOLT_PROMPTS`, no source Volt attacks.

No mismatched parent, seat, histogram or observed live Store in this four-arm sample. Presence of an authentic source attack and passed mandatory transfer permits **narrow prompt contract verification on that root only**, not attack-wide paper or win-rate qualification. Each of the five is a **correlated action inside one original physical game**.


## Same-head four-arm native policy noninterference (17:30 UTC)

A **fresh, same-head, exactly paired** counterfactual replay tested this portfolio's influence on genuine native actions. `scripts/agent39-paper-prompt-native-noninterference-pair.cjs` ran the canonical four historical rank6/rank11 development arms **twice each**, in the same compiled GitHub Actions job: one default `paperPromptPortfolio=false` and one `true`; all four original physical source/deck/seed/seat and actor-policy inputs were unchanged. No other policy repair flag was enabled.

[Manual compiled CI 41331375150](https://github.com/FlareZ123/experiment-01/actions/runs/41331375150) **SUCCESS**, actual research HEAD `7f66f4c708421c0b139d9ab02722691efc3556f7`. Exact 4/4 paired trial identities each showed **`fullyIdenticalExceptObserver:true`**. The independent A/B test compared and established equal:
- initial complete physical-deal fingerprint, original source-deal fingerprint and actual starting seat;
- complete native root-action ledger SHA256, native prompt-choice event digest and final public-board digest;
- final Prize state, winner, terminal/cap status, action count and turn count;
- printed source attack-settlement digest.

The aggregate report had `fullyNoninterferingFourArms:true`, `matchingSourceDealAll:true`, and `realLivePromptRootAgreement:true`. The guard-on rank6 New Moon arm independently re-established `LIVE_PRINTED_SOURCE_PROMPTS_MATCHED` with five original-source `Volt Cyclone` native roots; all three no-source arms correctly retained `NO_SOURCE_VOLT_PROMPTS`.

**Interpretation:** This establishes no observed game-state interference from the added paper guard in these four original historical development arms. It is **eight full native game executions, paired into four sets**, rather than eight independent competitive wins. No deliberately invalid prompt was selected in those natural four arms, so the already-proven staged invalid-preflight veto remains a separate test. This qualification does **not** transfer to other original field lists, unsupported prompt families, asymmetric future decisions, full match legality, strength or 25-minute tournament clock; all four trials remain strategically unqualified.

Reproducibility: checkout the cited exact head, set `agent41_crossrank_trial=true`, `trial_ids=agent41-bilateral-v2-dev`, `agent41_dev_options=paper-prompt-pair,paper-prompt-portfolio` on the existing manually triggered `aichi-source-locked-campaign.yml`. The shared test suite and native two-seat print-specific fixture precede the paired executable. No automatic trigger or new workflow was created; no private identity or opponent deck was replaced. Status remains **29/32 exact originals, zero competitive qualified games**.
