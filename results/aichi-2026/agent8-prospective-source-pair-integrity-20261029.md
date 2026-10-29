# Agent 8: independently authenticated prospective source-deal pair denominator

**29 October 2026 | existing original-Store archive audit, no new games or candidate wins.** This report is a source-deal provenance gate for the [preregistered canonical 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md), complementing its unconditional game census and the [Agent21 first-turn rank11 audit](agent21-rank11-firstturn-registered-native-census-20261029.md).

## Why this gate is needed

Two candidate 60s are run with the same seed against a common published source 60. This is a **paired source-opening experiment only when the actual original source physical deal matches**. Equal seed, player slot, first-player identity and root-action labels each fall short of authenticating that physical match. If an arm errors before reporting its actual starting state, the paired source opportunity cannot be verified from the surviving arm.

The canonical [census](../../simulation/evaluation/agent41-prospective-canonical-scout.cjs) correctly retains game attempts and errors, but its `sourcePairs.length` assertion does not independently check that its entries authenticate each registered pair's physical source SHA, native starting seat and exact candidate IDs. A separate strict [source-pair audit](../../simulation/evaluation/agent8-prospective-source-deal-audit.cjs) now enforces those invariants against every frozen scheduled arm, with explicit `unverified` and `mismatched` classifications. It also rejects contradictory source-pair metadata, missing/duplicate pair identities, seed edits and any false competitively-qualified row. It does not discard incomplete games.

The audit produces source-first and source-second counts **by authenticated source-deal cell**. The candidate hidden initial deals may differ and remain incomparable even when the source fingerprints match.

## Original archive validation

Using the exact [CI 40918541683 artifact](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), the ZIP was independently downloaded and its SHA256 rechecked as `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`. Its original `agent41-prospective-canonical-32.json` contains all 32 arms, native first-starter evidence, printed source-deal SHA256 and 16 source-pair records. A separate Python reader independently grouped the exact trial identities and checked every registered pair's native flags against its two actual rows.

| Original opponent source | Registered seed cells | Matched source deals | Matched source-first | Matched source-second | Source deal mismatches |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank 6 Iron Thorns | 8 | **7** | **6** | **1** | **1** |
| Rank 11 Absol/Garbodor | 8 | **8** | **6** | **2** | **0** |
| **Total** | **16** | **15** | **12** | **3** | **1** |

The unmatched cell is **rank 6, repeat 3, physical candidate slot B, seed `861838028`**. It had the **same actual first player in both candidate arms** and two native terminal outcomes, but the authenticated **source physical deal SHA256 differs**. It is in the full execution census and must remain **excluded from a source-deal paired counterfactual denominator**. The six aligned rank11 source-first cells account for the scout's twelve source-first rank11 arms. The new audit's strict provenance gate counts 15 authenticated matched source-deal cells, and it preserves the rank6 mismatch as a distinct category.

The original engine execution census remains **20 natural terminals, 12 action caps and zero Store errors**; this posthoc verification neither repairs the capped arms nor supplies a human-competent policy, adversarial source pressure or a paper-clock model.

## Reproducible implementation

- [Pure, read-only verification module](../../simulation/evaluation/agent8-prospective-source-deal-audit.cjs): checks exact trial identity and seed, source-seat complement, native verified starter, internal source-first consistency, full source-opening SHA256 and native `sourcePairs` metadata; produces one row per registered pair, including capped and errored arms.
- [Five pure regression tests](../../tests/agent8-prospective-source-deal-audit.test.cjs): synthetic aligned cohorts, one true mismatch, forged native pair flag, native exception with missing evidence, inconsistent actual starter and modified preregistration. They use the existing registered trial schedule.
- [Read-only archive entrypoint](../../scripts/agent8-audit-registered-source-pairs.cjs): verifies the preregistration Git blob and pinned engine revision before applying this independent audit to an existing native archive. It does **not** launch any game.
- Execution verification: the actual saved module was executed in an isolated JavaScript V8 test harness with equivalent assertion operations on all 16 registered synthetic seed cells; matched, mismatched, unverified and contradictory metadata paths passed. The actual original 32-arm ZIP was independently checked and grouped using Python. The new Node `node:test` file has **not yet been run in a compiled CI job**, and the new JS archive entrypoint has **not yet been run against the full native ZIP**; those are reproducibility tasks rather than grounds to claim a newly certified result.

## Decision

Preserve this separation in all future comparisons: 32 game attempts, 16 registered source seed cells, **15 physically authenticated source-deal pairs**, 1 mismatched pair, and 12 action caps. Source-policy opportunity percentages must use the appropriate physically verified source opening unit; engine terminal percentages require their own uncensored and failure-inclusive accounting. A row-level `sameSourcePhysicalDeal` plus real starting-seat check is a prerequisite to source-opening pairing, and cannot establish full candidate physical-deal equality.

No candidate list was changed, no new game result or winner was generated, no win-rate inference was warranted. Overall status is unchanged: **29/32 exact Aichi Top 32 printed 60s, zero competitively-qualified games, and no demonstrated fixed 60 with 99.5% wins**.

## The one mismatch's setup-prompt mechanism (new native trace diagnosis)

A second, bounded read of the **same archived** `6:3:B` pair compared the entire `turnBefore=0` accepted setup ledger, identified each physical seat and counted true `ShuffleDeckPrompt` and `ShowMulliganPrompt` events, rather than counting all prompt roots as turns. It found:

| Actual setup observation | Champion reference arm | New Moon arm |
| --- | ---: | ---: |
| Original source seat | 0 | 0 |
| Original source `ShuffleDeckPrompt` | **3** | **3** |
| Candidate seat `ShuffleDeckPrompt` | **2** | **1** |
| Source `ShowMulliganPrompt` | **2** | **1** |
| Candidate `ShowMulliganPrompt` | **2** | **1** |
| Setup roots before global turn 1 | **14** | **12** |
| Actual first player | source seat 0 | source seat 0 |
| Original source's initial hand SHA256 matches across arms | **No** | **No** |

Among the other **15** candidate pairs, both arms had the **same counts of setup shuffle prompts for the source and candidate seats** and the **same original source first-hand SHA256**, in addition to the already-verified full source physical-deal SHA. Hence the lone source-deal mismatch coincides exactly with a changed opponent setup shuffle count, despite identical registered seed and actual first-player seat. No different original opponent 60, seat swap, script exception or first-player attribution error is needed to explain this observation.

The pinned [`headless.cjs`](../../simulation/twinleaf/headless.cjs) creates one **seeded game RNG** `random=seededRandom(request.seed)`, then invokes `deckPermutation(owner.deck.cards.length, random)` for *each* native `ShuffleDeckPrompt`; its optional policy RNG isolation separates bot decision randomness only. An additional candidate setup shuffle is therefore mechanically capable of shifting the subsequent shared game-RNG sequence, even when the source's own shuffle *count* remains unchanged. The same engine's [setup compensation observer](../../simulation/evaluation/setup-compensation-observer.cjs) describes how unequal mulligan counts can create real, rule-mandated bonus-draw differences. The archived setup signatures support this **specific coupling mechanism**; they do not identify which individual RNG draw determined every different physical position, and they must not be interpreted as a complete causal random-stream trace.

**Design consequence:** same seed and same starting player alone cannot guarantee a physically matched opponent deck across candidate 60s with different mulligan patterns. The audit must retain `6:3:B` as a genuine unpaired cell, record setup shuffle/mulligan event counts alongside any future mismatch, and include naturally induced opponent mulligan compensation in unconditional competitive experiments. For a future true common-physical-deal experiment, separately register a verified setup-coupling design rather than silently discarding such cells or forcing hidden-card equality after setup.

## Reproduction status update: compiled native archival CI passed

The originally proposed posthoc [source-deal checker](../../simulation/evaluation/agent8-prospective-source-deal-audit.cjs) has now been extended with a [native first-turn accepted physical recipient parity check](../../simulation/evaluation/agent8-source-firstturn-physical-recipients.cjs) and validated in the existing manual original-archive workflow. The [successful run 40937800563](https://github.com/FlareZ123/experiment-01/actions/runs/40937800563) executed **16/16 Node pure tests PASS** and replayed the audit against the actual immutable 32-arm ZIP, asserting **16 registered seed cells, 15 paired source deals, one unpaired source cell and 15/15 matching first-turn Store recipients/prompt selections/roots (11 target-bearing first-turn actions across the original rank11 cells)**. See [the detailed recipient-parity report](agent8-native-source-firstturn-target-parity-20261029.md). The workflow performs no fresh Twinleaf game and makes no assertion of full-match policy parity. This supersedes the earlier execution caveat that the new regression tests and actual JS archive entrypoint were not yet run in CI.
