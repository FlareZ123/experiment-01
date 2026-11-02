# Agent 24: original-owner conservation beyond two 60-card zone totals

**2 November 2026.** Scope: paper Expanded original source games. This is a **new necessary integrity test**, **not a newly observed live cross-owner migration**, opponent-policy validation, or evidence for any competitive win-rate claim.

## Concrete failure mode and falsification

The earlier [read-only physical-zone ledger](../../simulation/twinleaf/physical-card-ledger.cjs) counted 60 unique card references in each *currently occupied player-zone* and checked global reference duplication and Energy attachment indexing. It did not retain which original 60-card deck owned a reference.

A synthetic state with two distinct cards assigned to each player gives an exact counterexample: exchange one original physical card reference from each player's deck, leaving each player's deck size unchanged. The old fixed-deck count audit returns **zero count anomalies**, the original global duplicate detector returns **zero duplicates**, and the old combined canonical/prompt count audit also passes. Yet both cards now occupy their opponent's physical deck. A separate synthetic state substitutes a previously unseen card reference while preserving all zone totals. These cases are invalid as original-paper ownership custody despite passing the old count-only checks. Neither synthetic case claims that Twinleaf naturally produced such an exchange.

The manual's C-01 and C-02 specify the card owner's discard/hand/deck, and C-09 restricts Energy attachment to one's own Pokémon; see [bundled advanced player's rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md). No proposed check changes game decisions.

## Implemented read-only extension

[Physical-card ledger](../../simulation/twinleaf/physical-card-ledger.cjs) now exports `captureInitialPhysicalOwners(state, expected=60)` and accepts an optional original-reference index in `inspectPhysicalCardZones`. The index is constructed from the actual 60 physical Card objects of each player **after both original decks are materialized and before gameplay shuffling/first normal actions**. It rejects a missing initial deck or a reference shared between starting decks.

When an index is supplied, each live canonical zone traversal reports:

- original physical references occupying the wrong player's zones, with seat/location but no hidden card name;
- references that were not part of either registered original 60;
- original reference counts absent from canonical zones, by original owner.

The original `canonicalCounts`, duplicate-reference, transient-prompt and Energy-index checks remain in force. Normal owner-to-owner zone transitions are permitted, and temporary prompt custody remains distinguished from settled roots. The map and any private card identities are not exposed to the actor decision policy; report data is solely postaction diagnostic.

[Headless adapter](../../simulation/twinleaf/headless.cjs) applies the new checks only with **both** `capturePhysicalZoneIntegrity:true` and `captureOriginalOwnerIntegrity:true`. Existing calls have the same behavior when the new option is absent. When opt-in is enabled, settled original-owner anomalies enter the existing strict `TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION` fail-closed path. The [shared physical qualification](../../simulation/evaluation/physical-zone-qualification.cjs) explicitly emits `originalOwnerIntegrityQualified:true` only for a 120-card indexed, clean settled-root case. Historical physical-60 successes remain distinguishable with `originalOwnerIntegrityQualified:false`. A claimed index length other than 120 fails closed as unverified.

## Tests and reproducible native results

- Six original-owner regression tests passed in the benchmark job: positive original 2+2 references, reciprocal cross-owner swap, unknown replacement reference, same-owner movement, invalid initial inventory, historical no-index compatibility. [Unit tests](../../tests/agent24-original-owner-custody.test.cjs).
- The qualification tests, including the 120-reference positive and malformed-index negative cases, passed in the same benchmark job. [Qualification regression](../../tests/physical-zone-qualification.test.cjs).
- The existing manually dispatched benchmark workflow's **`agent24-original-physical-native` job succeeded** with the new [original-owner three-case](../../simulation/twinleaf/agent24-original-owner-native-3case.cjs). Historical input seeds, physical seats, source printings, policy and existing runner code paths remained unchanged apart from adding the opt-in read-only index.

| Authentic original rank 20 versus rank 11 case | Existing 60-count outcome | Owner-custody outcome |
| --- | --- | --- |
| Rank20 in seat B, seed `1847000101` | First invalid settled native root **52**, counts `[60,59]` | Also missing one original reference for seat B, starting index **120** |
| Rank20 in seat B, seed `1847000103` | First invalid settled native root **98**, counts `[60,59]` | Also missing one original reference for seat B, starting index **120** |
| Rank20 in seat A, seed `1847000101` | No invalid settled native root in bounded replay | Original-owner audit **passed**, `originalOwnerIntegrityQualified:true` |

This native test is a retrospective check on already known physically invalid and conserved original Store states. It establishes no additional natural cross-owner violation. The positive case means only that the observed settled original card references stayed with their original owners throughout the bounded native sample.

**Reproduction:** [manually dispatched GitHub Actions run 41367897474](https://github.com/FlareZ123/experiment-01/actions/runs/41367897474), head `1c1a39c714652fc8aa318d6d4e220f79045aa889`, pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Job `agent24-original-physical-native` **success**; job `test-benchmark` verified both Agent24 unit suites successfully but the overall workflow was **failure** due to a later, unrelated existing step named `Regress bounded owner-only root action contention without changing decisions`. Artifact `agent24-threecase-original-physical-native`, ID **13108285265**, artifact SHA-256 **36da0d303db2919d54675fa245c5d39c3132ebe12fd66eca92f5a74706f8f4af**. This report does not mislabel the entire workflow green.

## Inference boundary and next gate

The index is an object-identity witness. It cannot by itself certify a legal Trainer target, a correct prompt resolution, a printed attack effect, a decision policy, or tournament time usage. Native sudden-death restart episodes may construct new physical objects; the current index is anchored to the initial game and needs separate episode-reset analysis before treating any multi-episode match as original-owner-qualified. A strict failure on a new reference should be investigated against actual reset semantics and the registered original physical 60, rather than automatically interpreted as an illegal card transfer.

The next release path is to enable this owner index **alongside** the existing source+candidate physical-60 checks in the canonical bilateral runner under an explicit, fingerprinted opt-in, preserve failures for every registered attempt, and require compatible end-to-end paper-action chain and source-policy competence gates. Competitive game qualification remains **zero** across the project; exact published opponent lists remain **29/32**, missing ranks **23/25/28**. The aspirational 99.5% goal has no demonstrated evidentiary support.
