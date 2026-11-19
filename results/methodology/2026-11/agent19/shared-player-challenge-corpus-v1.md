# Shared-player challenge corpus v1

**Agent 19 · 19 November 2026 · consolidation artifact, not a policy or game result**

## Purpose

This corpus converts a small, deliberately diverse slice of existing Aichi opponent-policy prototypes into one common, source-bound regression format for the next shared, seat-symmetric player/search system. It does not create another rank-specific policy, validator, runner, workflow, or acceptance lane. Original suites and policies remain unchanged.

- Machine-readable corpus: [shared-player-challenge-corpus-v1.json](shared-player-challenge-corpus-v1.json)
- Reproducer: [build-shared-player-challenge-corpus.cjs](../../../../simulation/evaluation/2026-11/agent19/build-shared-player-challenge-corpus.cjs)

## Scope

The corpus contains **30 cases** from six exact Aichi source ranks: 3, 4, 5, 6, 7 and 31. It selects four development regressions and one held-out review case per rank.

| Rank | Source archetype | Policy version represented | Selected cases |
|---:|---|---|---:|
| 3 | Snorlax Stall | agent17 rank-3 v1 | 4 development + 1 held-out |
| 4 | Raichu / Electrode | agent50 rank-4 v2 | 4 development + 1 held-out |
| 5 | Mew / Genesect | agent20 rank-5 v8 | 4 development + 1 held-out |
| 6 | Iron Thorns | agent39 rank-6 v1 | 4 development + 1 held-out |
| 7 | Snorlax Stall | agent43 rank-7 v2.3 | 4 development + 1 held-out |
| 31 | Dusknoir / Chimecho | agent35 rank-31 v2 | 4 development + 1 held-out |

All six suites bind the same current Hood Shield Shadow Rider v1 candidate fingerprint, `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`, and the same Twinleaf pin, `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is the current candidate hypothesis, not a final deck nomination.

The cases cover opening/core-plan decisions, draw and attack sequencing, Energy and discard costs, Tool/lock counterplay, Prize and hidden-information boundaries, prompt fail-closed behavior, public event-receipt gating, and damage/Prize conversion. Each record retains its original case ID, source-suite Git blob, source/candidate binding, policy identity, actor-view fixture or digest, decision envelope, cost ledger, prompt coverage, execution evidence and disposition where present.

## Evidence status

| Measure | Count |
|---|---:|
| Total selected cases | 30 |
| Development regression cases | 24 |
| Held-out cases | 6 |
| Synthetic evidence class | 26 |
| No execution evidence class | 4 |
| Blocked dispositions | 30 |
| Exact runtime actor-view digests | 0 |
| Native Store receipts | 0 |
| Native trace digests | 0 |
| Native games | 0 |
| Source-natural cases | 0 |
| Native-staged cases | 0 |

A passing unit test in an original suite remains a synthetic policy/protocol result. The corpus does not convert it into native card-effect evidence, source-natural frequency, independent opponent competence, a matchup result, or a win-rate estimate. All cases remain blocked for competitive admission.

Development cases are **regression-only**, not supervised strategic labels. The six held-out cases are explicitly marked **not used for tuning**. Do not train a policy to imitate the old rank-specific decisions and then treat the same cases as independent validation.

## Normalization and source caveats

1. The actual repository submodule declaration in [`.gitmodules`](../../../../.gitmodules) is `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The rank-3 suite declares the stale path `vendor/twinleafgg`; the corpus preserves that declared value separately but records `vendor/twinleaf` as the actual path. No submodule was changed.
2. `sourceDeckCardCount` is the count in the source-list row, not proof of physical-copy inspection or paper admission. The rank-4 suite binds its exact source entry through `sourceEntryJsonSha256` and the source-list file hash, rather than supplying the same printed-60 fingerprint field used by several other suites. The corpus preserves this as an entry hash and does not relabel it as a physical deck fingerprint.
3. Actor-view payloads are retained only from the source suites. The normalizer rejects explicit hidden-opponent-zone inclusion and does not promote fixture-descriptor hashes to runtime actor-view digests.
4. Source suites, policy modules and their historical test results remain authoritative for their own content. This corpus does not independently validate card rules or repair their blocked dispositions.

## Intended next use

After the canonical V3 gate and the single registered first trace have passed review, use this corpus as a compact regression surface for one reusable decision/search implementation. The same implementation should pilot either physical seat using only the acting player's validated observation, owner-authenticated prompt, permitted public history/event receipt, and legal action frontier. Deck/source identity may condition immutable policy context; it must not open hidden state.

First use the development cases to prevent regressions in general decision patterns. Keep the held-out cases untouched until a policy version is frozen. Then replace synthetic-only cases with exact runtime actor views and native Store receipts where the existing acceptance process permits, and add source-natural evidence from complete games. Preserve all failures, abstentions, unsupported prompts and timeouts.

This is a six-rank starter corpus, not the full Aichi field. It deliberately does not replace Agent6's rank-1 diagnostic, fill missing ranks 23/25/28, nominate a final 60, or support a 99.5% claim.
