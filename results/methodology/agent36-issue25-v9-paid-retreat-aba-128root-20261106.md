# Agent36: v9 paid-retreat A/B/A 128-root preflight failure and common-policy decision

**Date:** 6 November 2026  
**Status:** v9 executed, control gate failed; no policy promotion  
**Native workflow:** [42246115429](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429)  
**Native artifact:** [agent36-issue25-common-v9-paid-retreat-aba, artifact 13519261081](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429/artifacts/13519261081)  
**Archive SHA-256:** `f91552274c354e54226b315ff3ca9e39ddfa7dc3cf3096b2ea863a0d3d602bc4`  
**Artifact ZIP SHA-256:** `0c69696de15c66d0dcad6a6d75a88f9fdd63e4f8825bf82e2dd7f7cf4c3f458e`

## Decision

**Do not select v9.** Its 24 native attempts completed, but the repeated A controls did not reproduce identical root ledgers. The native test correctly failed its control gate. The treatment generated zero RetreatAction roots and zero root divergences in the eight registered v8 contexts within 128 roots. This is a bounded no-op observation, not evidence that the paid-retreat option is ineffective.

**Select the v8 common policy as the current developmental policy baseline**, replacing v4 as the active development baseline while retaining v4 as a historical control. This selection is limited to continued policy research. It is not a selected final 60-card deck, a competitive qualification, or a win-rate claim. Competitive qualification remains **FAIL**.

The v9 experiment also had an insufficient horizon for the already observed natural paid-retreat candidate at root131. Its 128-root cap cannot reach that event. A successor must use a 240-root horizon and reproduce the exact v8 first-128-root control prefix before its treatment is interpreted.

## v9 registration and execution

The frozen registration is [`agent36-issue25-common-v9-paid-retreat-aba-20261106.json`](../registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json). The runner is [`agent36-issue25-common-v9-paid-retreat-aba.cjs`](../../simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs). It reused the exact eight v8 trial IDs, seeds, source seats, two candidate 60s, and pinned Twinleaf revision. The only configured treatment change was `actorTwoUnitPaidRetreatRoot=false/true/false`, with no target-turn restriction. The physical custody observer and its tests are in [`agent36-v9-two-psychic-retreat-custody.cjs`](../../simulation/twinleaf/agent36-v9-two-psychic-retreat-custody.cjs).

| Measure | A control | B paid-retreat | A repeat |
|---|---:|---:|---:|
| Registered contexts returned | 8/8 | 8/8 | 8/8 |
| Native attempts | 8 | 8 | 8 |
| Engine errors | 5 | 5 | 5 |
| 128-root caps | 3 | 3 | 3 |
| Native terminal games | 0 | 0 | 0 |
| Accepted RetreatAction roots | 0 | 0 | 0 |
| Joined public paid retreats | 0 | 0 | 0 |
| Physical custody bound to a real retreat root | 0 | 0 | 0 |
| Settled follow-on attacks after paid retreat | 0 | 0 | 0 |
| Source Prize transitions after paid retreat | 0 | 0 | 0 |

All eight A/B/A trial triplets preserved the same source-deal fingerprint, full physical-deal fingerprint, source/candidate seats, and actual starter. However, the repeated A controls did **not** reproduce identical root ledgers. The runner reported `controlsRepeatedExactly=false`; the native test failed at `tests/agent36-issue25-common-v9-paid-retreat-aba.native.test.cjs:28`. The artifact was still uploaded and contains the complete 5.8 MB raw phase archive.

The runner manifest identifies `randomnessProtocol: legacy-shared-prng`, `policyRandomIsolation=false`, and `physicalShuffleRandomIsolation=false`. The legacy shared stream is a treatment-dependent randomness confound. However, headless.runMatch seeds Math.random from each request seed and restores it after the match, so sequential phase consumption alone does not explain identical A controls diverging. Request-seed mutation, stateful wrappers, or other entropy remain possible; the exact replay defect is unisolated. The matching physical openings do not repair the control mismatch.

The treatment changed zero trial root tapes. Since no RetreatAction occurred, the first-divergence-is-Retreat condition passed vacuously. No conclusion about the quality or legality of a paid-retreat decision follows from this run.

## Audit refinements required before using the natural positive as a release witness

Agent20's independent [v9 audit](agent20-v9-paid-retreat-aba-audit-20261106.md) identified two further acceptance issues:

1. The v9 predicate `allTreatmentFirstDivergencesAreRetreat` returns true when `treatmentDiff===null`. Because `treatmentChangedTrialCount` was zero, the flag passed vacuously. The native test did not require a nonzero treatment divergence, a unique physical-custody join, a settled follow-on attack, or a Prize. A successor must require each positive witness explicitly. A null divergence is a separate no-witness result.
2. The existing Agent42 general root audit chooses the first settled source attack after a RetreatAction in the same turn, but does not verify that the attack's pre-action Active is the exact promoted target. The settlement includes `attack.publicBoardBefore`; require `publicBoardBefore[sourceSeat].active.name === targetPrinting` before attributing the attack, damage, Prize, or terminal to that retreat. Add a negative fixture where a different Pokémon becomes Active before attacking. Agent42 has been asked to verify root132's pre-attack Active is Latias ex SSP.

The natural Agent42 root131 to root134 final-Prize line remains a promising reported witness. Its exact follow-on attacker identity and per-card Energy object custody must be verified before treating it as a fully joined physical paid-retreat payoff.

Agent1's independent v9 review found a separate custody flaw: the v9 `Store.prototype.dispatch` observer sees speculative Store instances and does not bind a receipt to the actual root Store identity or exact root action ordinal. The v9 run had zero receipts, so no false positive occurred in this run. Any future receipt from this observer is unverified. The headless adapter creates the actual game Store in `simulation/twinleaf/headless.cjs`; Agent41 has been asked to expose an inert `onRootStoreCreated(store)` research hook, and Agent42 to bind v2 custody only to that Store and its accepted root ordinal.

The paired-randomness confound has an existing tested correction in [Twinleaf seed-stream isolation](../twinleaf/seed-stream-isolation.md). `headless.cjs` already supports `isolatePolicyRandomness:true` and `isolatePhysicalShuffleRandomnessAfterSetup:true`; the bilateral `runDevelopment` adapter did not pass these flags. Agent41 has been asked to expose them while preserving legacy defaults. The after-setup shuffle mode preserves turn-0 setup shuffles and separates later per-seat physical deck shuffles; policy isolation prevents speculative decisions from consuming real-game randomness. Agent20, Agent41, and Agent48 have also been asked to identify the A/A replay defect separately by comparing request seeds, same-process/fresh-process replays, wrapper state, and the first differing root ordinal.

## Why 128 roots was inadequate

Agent42's independent four-fresh-seed A/B/A report records a natural Shadow Rider VMAX to funded Latias ex paid retreat, followed by Eon Blade for 200 damage and the final Prize. The pre-attack Active identity still requires an explicit join to the promoted Latias ex. The observed retreat root was **131**. That study had 24 attempts, a repeated-control match, one source-side terminal win, and seven censored/nonterminal rows. Its archive did not bind physical Energy object identities to that natural source game; separate staged custody tests verified the two-Basic-Psychic payment on both seats.

See [Agent42's natural paid-retreat report](../2026-11/agent42-four-fresh-seed-paid-retreat-prize-terminal-20261106.md).

The v9 run used the v8 seed cohort, not Agent42's known-positive seed. Its 128-root cap could not reach the known root131 event in any case. The v9 zero-retreat result is therefore only a bounded no-op observation on its eight v8 contexts. It is not a negative replication of Agent42's positive line.

## Broader common-policy comparison

The reason to move the developmental baseline from v4 to v8 is the breadth and actual Store execution of the common policy, not a claim that it is competitive.

- **v4 historical baseline:** the earlier selected policy returned six arms with two engine errors and no settled source attack. Retain it as a historical reference, not the current active developmental baseline.
- **v7 focused continuation:** five source attack declarations settled 5/5, each with a same-epoch opponent root; six arms hit the root cap and two ended in engine errors. The owner-return observer saw Pass on 5/5 source return decisions. This is useful Volt/continuation evidence, not a complete policy.
- **v8 broader common policy:** four original source ranks, eight registered candidate contexts, both physical source seats represented, 128 roots per attempt. The independent audit found 20 source attack declarations, 19 settled attacks, three source Prize transitions, three root caps, five engine errors, and zero terminal games. All 19 settled attacks had a same-epoch opponent root, although most opponent responses were Pass or otherwise weak. This is the broadest executed common-policy profile and is selected for further development only.

Evidence: [v7 native report](agent36-issue25-common-v7-native-volt-continuation-20261106.md), [independent v8 audit](agent32-independent-v8-native-8way-audit-20261106.md), [v8 runner](../../simulation/evaluation/agent36-issue25-common-v8.cjs), and [v8 registration](../registrations/agent36-issue25-common-v8-broader-prospective-20261106.json).

The v8 audit found that rank11 source-deal fingerprints differed across candidate lists despite shared seed labels. Candidate comparisons must therefore remain within exact physical-deal identities; shared seeds are not sufficient pairing evidence.

## New release blockers from adversarial review

### Retreat modifiers and opportunity comparison

Agent20's [Aichi retreat-modifier census](agent20-aichi-retreat-modifier-field-census-20261106.md) and [paid-retreat proposal audit](agent20-two-unit-paid-retreat-proposal-audit-20261106.md) show that the current selector reads printed Retreat Cost and some Stadium/Tool/status conditions but does not consume the public abilityDetails needed for all effective-cost decisions.

The field includes Latias ex SSP 76 Skyliner and Snorlax PGO 55 Block. A successor must fail closed when it cannot prove the effective Retreat Cost, account for an opposing Block restriction, and test Basic Active versus Evolution Active with Latias on the owner's Bench. Agent20 also identified missing comparisons against a payable Active GX attack, incomplete attack metadata, a held Float Stone free-retreat route, actual Prize value versus a raw damage threshold, and payment classes beyond the current two-Basic-Psychic physical witness. The current v9 option is not release-safe until these are resolved or explicitly excluded.

### Night Watch entropy

Agent48's [adjacent-seed Night Watch audit](agent48-nightwatch-adjacent-entropy-first-selection-20261106.md) found the same first selection index across four adjacent seed schedules. The [original-native corroboration](agent48-nightwatch-real-original-first-entropy-corrob-20261106.md) confirms the same first selection in the original native archive, while later selections varied. This is deterministic seed/stream coupling evidence, not proof that the sampler is intrinsically biased.

Any successor must use a documented SHA-separated seed schedule and independent/reproducible policy and physical-shuffle streams. Preserve the old adjacent-seed observations as historical evidence; do not treat them as independent randomness samples.

### Team Flare Grunt follow-through

Agent5's [v7 Team Flare A/B/A workflow](https://github.com/FlareZ123/experiment-01/actions/runs/42227408708) accepted the intended Supporter root and consumed Supporter quota, but the physical witness did not show the card reaching discard or an opponent Energy moving to discard. The run aborted with `CANNOT_USE_POWER` and owner-safe fallback quarantine. This is an unresolved prompt-settlement failure, not a successful denial and not a paper-rule counterexample.

Agent5 and Agent17 have been asked to recover the exact pending prompt envelope and validate a real owner-only Energy-selection follow-through before a separately versioned v2 is considered.

## Required successor protocol

1. **RNG control:** expose `isolatePolicyRandomness:true` and `isolatePhysicalShuffleRandomnessAfterSetup:true` through the Agent41 adapter. Demonstrate exact same-process and fresh-process control replay, compare request seeds and first divergent roots, and distinguish this from the legacy policy/game RNG confound. Agent20, Agent41, and Agent48 are reviewing the fix.
2. **240-root horizon:** preserve the exact eight v8 IDs/seeds and run A/B/A to 240 roots. Prove each control reproduces the archived v8 first-128-root prefix before interpreting any post-128 divergence.
3. **Known-positive canary:** add Agent42's root131 rank1 source context as a separately labelled retrospective canary. Do not fold it into the four-rank field estimate.
4. **Ability-aware paid retreat:** implement and test Latias Skyliner, Snorlax Block, Active GX attack, missing attack metadata, Float Stone alternatives, and unknown modifiers. Fail closed where the public observation cannot establish effective cost.
5. **Payment and consequence custody:** bind the accepted real Store root to exact physical Energy objects, target promotion, a settled printed attack, actual damage, Prize transition, immediate opponent reply, and source's next turn. Generic special-energy payment classes need their own custody evidence.
6. **Team Flare:** observe and settle the actual pending prompt, target only an eligible opponent-attached Energy, and prove physical discard movement before counting a denial.
7. **Field coverage:** obtain exact, provenance-backed 60s for ranks23,25,28. The field remains 29/32.
8. **Competitive evaluation:** run complete paper-qualified games against every original Top32 list with strong decision policies, report all 32 matchups and uncertainty, and distinguish untimed game wins from the event's 25-minute match result.

## Current qualification

- Selected developmental common-policy baseline: **v8**.
- Selected final fixed 60-card deck: **none**.
- v9 paid-retreat treatment: **DEFER / invalid A/B/A control; no observed treatment root**.
- Paper-qualified competitive games: **0**.
- Full original Aichi Top32 lists: **29/32**; missing ranks **23, 25, 28**.
- Demonstrated 99.5% game win rate: **no evidence**.
- Demonstrated 99.5% event-match win rate: **no evidence**.

The collective objective remains the same single legal, playable 60-card Expanded deck against the full original field. The present work is a development policy and simulator-research baseline, not that deliverable.
