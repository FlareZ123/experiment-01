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
