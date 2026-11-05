# Agent 1: abort-safe initial printing custody in eight original-source native comparisons

**5 November 2026. Evidence:** actual compiled, pinned native Store and exact prior eight registered rank6/rank11 arms, retrospective setup-policy A/B. **Status:** developmental only. Zero competitively qualified games.

## Question

Three of eight registered baseline/protected rows in the earlier v8 analysis lacked complete returned-game physical deck digest/seat custody after native engine errors. The raw-row equality predicate therefore returned false even though the setup observer had collected the genuine prechoice inventory of both owners directly from every real Store. Can the study report the two evidence standards distinctly, without promoting an aborted row, concealing a returned-data contradiction, publishing hidden cards, or attributing an A/B causal effect prematurely?

## Reproducible implementation

- [Native comparison](../../simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs) retains the original strict `sameRegisteredTrialIdentityAndDeckPrintings` raw-row predicate and separately exposes `nativeStoreRegisteredPrintingParity`. The latter requires registered trial identity, same in-process HMAC session, actual starter parity, pairwise prechoice physical input HMAC and pre-run request parity for both owner seats, real physical sixty multiset matching each configured native deck, plus an independent fail-closed veto on any partial or full returned fingerprint/seat/starter contradiction.
- [Read-only Store observer](../../simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs) captures the genuine `AddPlayerAction`-linked `CHOOSE_STARTING_POKEMONS` owner input from the pinned Store, before any voluntary setup choice. It does not choose actions or share hidden hand/order information with the bot. Private hand, deck and Prize order use a process-secret keyed HMAC; raw names, raw HMACs and secret never appear in the published comparison.
- [Pure regression tests](../../tests/agent1-issue25-prechoice-input-custody-v8.test.cjs) cover a raw abort with missing printing/seat fields, corrupt returned source fingerprint despite the other fingerprint being missing, changed source seat, incorrect actual physical sixty, differing run request, missing genuine owner observation, and unchanged negative controls. The test explicitly asserts the aborted result still qualifies **zero** games.

The change is a schema and interpretation improvement. It does not alter setup policy, the registered trials, the native engine, card payment, game outcomes or playing strength.

## Compiled native reproduction

[Manual GitHub Actions run 42076022519](https://github.com/FlareZ123/experiment-01/actions/runs/42076022519) succeeded against pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; the updated comparison pure suite passed **18/18** tests, and the single registered eight-arm A/B native test passed. Complete sanitized [Actions artifact 13439640605](https://github.com/FlareZ123/experiment-01/actions/runs/42076022519/artifacts/13439640605) contains the full 22,051-byte JSON comparison receipt; logged JSON SHA-256 `b45b078d89fef6b4fe6cc3e43d52142337e7fcafa6ac35ae115e9552da3f25a4`. The artifact was not separately downloaded or decompressed.

| Observed actual Store quantity | Result |
| --- | ---: |
| Registered native Store runs in each policy campaign | 8 baseline / 8 protected |
| Prechoice owner inputs collected in each campaign | 16 / 16 |
| Pairwise genuine physical prechoice inputs identical | 16 / 16 |
| Pairwise native pre-run requests identical | 16 / 16 |
| Actual Store physical printed-sixty inventories match configured native sixties | 32 / 32 |
| Actual first player for each registered trial identical | 8 / 8 |
| Complete returned-game paired printing digest records | 5 / 8 |
| Conflicting returned source/candidate printing digest pairs | 0 |
| Conflicting returned physical seats or starter | 0 |
| Native Store-based registered printing parity | **true** |
| Previous strict complete returned-game printing/seat predicate | **false** |
| Postchoice source physical-digest differences | 2 / 8 |
| Pre-first-action public Pokémon boards different | 2 physical owner boards |
| Competitively qualified games | **0** |

The difference between five complete returned-row printing records and eight valid prechoice physical Stores is an observation of the **same attempts**, with no supplementary game, selective game filtering, or new benchmark sample. It is inappropriate to call the three aborted rows fully returned, or to use the valid setup custody as evidence that they played complete games.

## Interpretation and remaining gates

This test supports provenance continuity up to the initial actual Store: it verifies that both A/B policy configurations received identical physical randomized setups for the frozen registered IDs, and that all actual Store physical sixties agreed with each configured deck. It does **not** independently verify non-treatment actor-stack closure, paper-correct prompt payment, strategically competent resource-to-attack decisions, meaningful opponent continuation, full legal game end, or official 25-minute paper match adjudication.

The earlier identical-policy A/A controls separately showed eight out of eight matching postchoice results for both baseline and protected repeated campaigns. Together, the controls make the two A/B board differences a useful next source of investigation, yet the reported `canAttributePostTreatmentDifferenceToOpeningSelection` deliberately remains **UNRESOLVED**. Same prechoice deals across one fixed contender are also distinct from any claim that different candidate sixties produce matched physical source deals under a shared random seed.

**Next decision-changing work:** connect this accurate native prechoice/source identity evidence to an independently paper-checked full turn with a source-owned attack or consequential lock effect and meaningful opponent reply in the selected bilateral policy. Continue retaining all registered errors and caps.

**Reproduction entry:** existing manually dispatched `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`, input `issue25_v8_only: true`. No new workflow or vendor changes.

## Source-versus-contender board provenance, second compiled verification

A second independently dispatched, compiled [native CI 42077106821](https://github.com/FlareZ123/experiment-01/actions/runs/42077106821) **SUCCESS** reused the same frozen eight IDs, both original source seats and two opening policies, and added a public-board role projection keyed by each registered `candidateSlot`. The role projection uses only already-collected real native **before-first-action** public Pokémon-board HMAC equality and occupied Bench counts, with no owner card names or digests in the report.

| Actual before-turn-action A/B public setup board comparison | Differing board HMACs | Differing Bench occupancy |
| --- | ---: | ---: |
| Original Aichi source owner (all eight trials) | **2** | **2** |
| Experimental contender owner (all eight trials) | **0** | **0** |
| Combined both real physical owner seats | **2 / 16** | **2 / 16** |

This is a direct result for the original opponent source setup: the protected-opening variant changed two original-source Active/Bench board configurations despite identical physical prechoice owner inputs. **The two mismatched public boards came exclusively from the original Aichi source owner in these registered trials**, and no contender public Pokémon board changed. This observation is narrower than an assertion that a particular printed card effect or retained Supporter was correctly executed.

The pure regression suite passed **19/19**, including the reversed candidate seat-B mapping; the new native eight-arm test passed **1/1**. Full sanitized [artifact 13439940672](https://github.com/FlareZ123/experiment-01/actions/runs/42077106821/artifacts/13439940672) contains a 22,688-byte JSON receipt with logged JSON SHA-256 `d47194b05f9f1e201b96942e4f0f7f5b497470b4a6613b39fb9d1640920dfcf2`. It still reports **5/8 complete returned rows, 0 raw printing contradictions, true Store-based registered identity, 0 qualified competitive games**, and leaves `actualNonTreatmentExecutingClosureVerified=false` and causal treatment attribution `UNRESOLVED`.

**Interpretation:** a source-owner setup sensitivity is genuine at the public first-turn board level under this paired developmental model. Whether that board difference leads to useful in-turn owner Ability activation, improved resource selection, legal attack, opponent reply, or better outcomes remains untested. The source-role finding must not be converted to a deck-matchup win rate or a universal opening recommendation.
