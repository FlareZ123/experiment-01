# Original rank1 vs rank10: 24 actual-Store A/B/A Copycat opening-zone observations

**Agent 6 | 7 November 2026 | native headless observer admission, no match-win evidence.** Reproducer: \`simulation/evaluation/agent6-copycat-root-original-native.cjs\`, frozen registration \`results/aichi-2026/registrations/agent6-copycat-root-observer-24arm-native-20261107.json\`, read-only instance observer \`simulation/evaluation/agent6-copycat-root-state-capture.cjs\` plus named-zone sidecar \`simulation/evaluation/agent6-copycat-source-zone-observer.cjs\`. [Successful full GitHub Actions run 42333410625](https://github.com/FlareZ123/experiment-01/actions/runs/42333410625), actual native head SHA \`ff90aa55c0254bc3c03ecb43ebf6a2f3dbda6547\`; [machine-readable 24-attempt artifact 13558630821](https://github.com/FlareZ123/experiment-01/actions/runs/42333410625/artifacts/13558630821).

## Research question and preregistration

Can an agent inspect the actual first stable native Store root to learn whether the original champion's Mimikyu GRI, Dialga-GX UPR, Hisuian Heavy Ball ASR, Forest Seal Stone SIT, and Shadow Rider Calyrex V CRE are in opening, Prizes, or deck **without changing the actual native game sequence**? The intended use is postgame source-deal research only. The exact 27-zone [opening seven model](agent6-copycat-27-location-opening-frontier-20261107.md) does not by itself prove that native observation is safe or that a search line executes.

**Frozen before any native run:** four genuine Python \`secrets.randbits(32)\` draws, \`[3805196977,2160386835,1209649709,273904279]\`, each with rank1 champion at physical seat 0 and 1. For each of those eight source seed/seat groups, execute three **identical** original 60-vs-60 conditions in the order A-control, B-read-only-observer, A-repeat. Both original rank1 Shadow Rider and original rank10 Regidrago use the existing shared \`planAichi\` resolver. No contender card slot, gameplay policy, attack or hidden-state decision code differs across arms. One bounded \`maxActions=96\` native match per arm, **24 actual game attempts**. The observer is attached only in B via \`onRootStoreCreated\`, intercepts only the unique real Store instance's \`dispatch\` until the first settled turn1 PLAYER_TURN root, and **restores the original dispatch function before the first ordinary player-turn action**. Other (speculative) Stores remain untouched.

Admission comparison was prespecified: A and A-repeat must be identical in status, completed actions, turns, winner, native root-action SHA256, champion physical source-deal SHA256, and complete bilateral physical deal SHA256; B must agree on all those fields, and B must have captured exact named-card zones from a real Store and removed its wrapper. A failure in any one group exits nonzero.

## Actual CI results, no cherry-picking

| Gate | Native result |
| --- | --- |
| Frozen registered original attempts | **24/24 executed** |
| 8 A vs A-repeat deterministic public-root/status controls | **8/8 identical** |
| 8 B vs A observed-control equality checks | **8/8 identical** |
| 8 first stable real Store B captures | **8/8 captured** |
| 8 champion and bilateral physical SHA fingerprint pairs | **8/8 matched** |
| Native execution statuses across 24 attempts | **21 action cap, 3 native terminal** |
| Native exception/engine errors | **0** |
| Local pure fixtures and compiled-engine CI pure tests | **19/19 passed** |
| Competitively paper-qualified games | **0** |

One of eight frozen seed/seat triads produced a native terminal in each of its three replay modes; the other seven triads hit the 96-root action cap. The one terminal was **not** validated as a complete competitive paper win under the official event time system or a competent opponent policy. This study treats all attempts as development-only, including the terminal. The source-independent bot remains the existing pinned SimpleTacticsAi with specified strict-prompt and visible-play-lock switches; its decisions are not asserted competitive.

## Actual original champion opening-zone census at the captured root

These are exactly the **eight B snapshots**, each from a genuine source Store before its first non-prompt player-turn action. \`opening\` is the combined current hand, Active, and Bench, **not the literal original seven**. The native engine may have already drawn the starting player's first-turn card, and setup may have awarded opponent-mulligan compensation. The sidecar explicitly marks \`initialSevenComparable:false\` for this reason.

| Champion original named singleton | Opening/field | Six Prizes | Remaining draw deck |
| --- | ---: | ---: | ---: |
| Mimikyu GRI58 | 0 | 1 | 7 |
| Dialga-GX UPR100 | 0 | 4 | 4 |
| Hisuian Heavy Ball ASR146 | 0 | 2 | 6 |
| Forest Seal Stone SIT156 | 1 | 0 | 7 |

In **2/8** snapshots, exactly one of the core Basics was Prized while Heavy Ball remained in the draw deck. In **0/8** snapshots was a held Forest Seal Stone simultaneously paired with the one-core-Prized/Ball-in-deck condition and a currently in-play V. These tiny postsetup counts are **not** an estimator of theoretical initial-seven exact probabilities: eight is insufficient even with an identical sampling frame, and initial seven and first player-turn state are not identical.

## Printed-source and engine identity cautions

The native resolver was allowed the existing explicit same-set Basic Energy number remapping policy. The successful run's provenance reports champion source **11 Psychic Energy MEE13** remapped to the engine ID \`Psychic Energy MEE\`; original rank10 source **four Grass Energy MEE9** and **two Fire Energy MEE10** likewise remapped to matching-type MEE engine IDs. The four tagged champion singleton names and 3 Shadow Rider V copies were counted exactly. These permissioned artifact/number mappings preserve intended Energy name/type and count but do **not** prove original physical art identity or every card's paper implementation. Native pins: Twinleaf submodule \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\` and workflow source revision \`ff90aa55c0254bc3c03ecb43ebf6a2f3dbda6547\`.

The observer's private named Prize and deck identities are emitted **offline, after game execution**, and were never available to either actual decision policy. The no-action-change result supports this particular observer under these registered seeds and pinned engine. The separate [print/rules fidelity issue for non-GX Apex Copycat](../../methodology/agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md) remains unresolved by this passive study; no Timeless-GX counterline was demonstrated here.

## Highest-value next experiment

Observe the complete **actual** counterline opportunity after the first K0/K1 search: owner-visible deck membership, first legal Heavy Ball acquisition, printed exchange, Mimikyu Active with two Psychic, opponent's actual prior non-GX Apex, Dialga UPR in own discard, action acceptance and subsequent native source reply. Validate an alternative use of the same Forest Seal Stone connector at the identical owner state to detect search-path domination. Then test the full frozen candidate unchanged across all authenticated opponents, add missing original ranks 23/25/28 and implement real event-clock adjudication before making any competitive win-rate claim.

**Research gate unchanged:** 29/32 authenticated original name/count sixties; zero competitively qualified games, no selected final fixed 60, no credible 99.5% field result.
