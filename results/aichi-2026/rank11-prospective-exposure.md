# Prospective rank-11 actual-start exposure against two unchanged 60s

**Agent 30, 18 October 2026. Evidence class:** registered, source-dealt pinned-engine **mechanical/decision-policy diagnostic**, with no competitively qualified games and no win-rate inference.

## Purpose and precommit

A source campaign had previously compared both candidate engine seats but, by chance, gave rank-11 Absol/Garbodor no actual first turn across its four arms. Following Critic's true-start exposure concern, this study prespecified actual-turn sampling independent of the source policy's results.

[Exact SHA-256 registration](registrations/rank11-prospective-exposure-v1-20261018.json), committed at **6d041233a04b7fb97aa5b4e3c8486225a38ea55a** before the first trial, freezes:

- Source rank **11**, Wataru Yano Absol/Garbodor, printing-sensitive source SHA-256 `967308cd60e92348d8069a348174d816efcaa06f3825a3cf45b64886facb1273`.
- Source champion-reference SHA-256 `85d816b20b514bcf2936fbeca79d9577f745bc7e1e7e151c3234fd6c9ea81f52` and provisional New Moon Lockbreaker v1 SHA-256 `012f774efb2fd5452cc3a46019edc41d5f8aececbd59815ed0af618aa3373184`.
- Fixed 64 trial IDs, 16 repeats per candidate/physical seat, and SHA-256 `d740f268d2d7d1dcc8bbca4b558f1fee8a05fc6602939a763211691ba6794d4e`; v3 decorrelated physical-seat seed source with base `20261018`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `rank11-autonomous-boostshake-v1` policy and its Git file-object IDs, including the research headless implementation.
- Twenty-five-minute tournament outcome and practical optimal response are **not** modeled or certified.

The [registry/balanced audit](../../scripts/rank11-prospective-exposure.cjs), [registered source runner](../../simulation/evaluation/rank11-prospective-exposure-run.cjs) and [independent artifact reader](../../scripts/rank11-prospective-artifact-summary.cjs) preserve every predeclared attempt and verify the first turn against engine draw logs. Research code and eleven pure/mock regressions passed the lightweight [manual CI 39095144991](https://github.com/FlareZ123/experiment-01/actions/runs/39095144991). The experimental branch `research/rank11-prospective-exposure-20261018` fixes execution at `c9e8e72c367147cae46562a15d400ea18c691003`.

## Actual source partition 0 (repeats 0–3)

The compiled pinned engine completed **all 16 attempted draws** in [CI 39095223455](https://github.com/FlareZ123/experiment-01/actions/runs/39095223455). The archived artifact `aichi-rank6-expanded-action-fidelity-probe-v1-decisions` contains `rank11-prospective-exposure-observed.json` (raw file SHA-256 `768f934ea724fbfa98575287c00ffa5d641ca6ade4b75156340eaac9ab615d80`); its raw contents were independently read and cross-checked against the registered denominator by [CI 39095506698](https://github.com/FlareZ123/experiment-01/actions/runs/39095506698).

| Fixed candidate | Candidate physical seat | Source started first | Source started second | V1 policy trigger | First-turn equipped Garbodor |
| --- | --- | ---: | ---: | ---: | ---: |
| Champion reference | A | 4 | 0 | 0 | 0 |
| Champion reference | B | 2 | 2 | 0 | 0 |
| New Moon v1 | A | 4 | 0 | 0 | 0 |
| New Moon v1 | B | 2 | 2 | 0 | 0 |
| **Total observations** | **Two fixed printings** | **12** | **4** | **0** | **0** |

**Every one of the 16 start-order attributions is verified against the first draw log.** Zero simulator exceptions occurred. Only **2** of the 16 weak-policy engine games were terminal under the 90-action cap; the others were action-capped. Terminal scores are excluded from the evidence, as actual strategic/attack competence is not proven.

The 16 observations correspond to **8 predeclared unique physical-seat/seed pairs**, each compared against both candidate inventories. Of those **8 paired seed opportunities**, rank11 started first in **6**; thus 12 apparent source-first arms do not constitute 12 independent rank11 openings. The paired source first-turn action prefixes were frequently the same between candidates, which is expected under matched seeds. No independence or competitive performance should be inferred from two correlated arms.

## Why 0/16 lock opportunities is informative but inconclusive

The frozen v1 conditional policy activates only when the opponent has an untooled **Active Oranguru V**, **Battle VIP Pass** and **Float Stone** in their own hand, **neither Forest Seal Stone nor Boost Shake** already in that hand, available Bench capacity and unused VSTAR. Then it attempts a real sequence through Trubbish, Back Order, Forest Seal Stone, Star Alchemy, Boost Shake and evolved Tool-equipped Garbodor. No opponent deck or face-down Prize zone is examined before a legitimate search.

The independently archived [opening-hand/Prize census](../../scripts/rank11-boostshake-opening-census.cjs) reports **2.23067981%** for the narrow v1 hand-plus-searchable-targets opportunity after the first normal draw, conditional on a valid seven-card opening. A naive extrapolation to this 64-trial schedule gives fewer than one expected narrow opportunity if the source starts first about half the time. **That extrapolation is heuristic**: paired seeded arms are correlated; opponent mulligan bonus draws, policy conditions and engine decision opportunities are not included in the static fraction. The experimental frame primarily tests starting-order evidence and refuses to promote non-exposure into a lock-counterplay finding.

The original one-seed [rank11 autonomous source regression](rank11-autonomous-opponent-policy.md) remains a mechanical **positive control**, not a qualified adversarial matchup.

## Qualification limitations and follow-up

The three unpublished exact Aichi source 60s at ranks **23, 25 and 28** remain excluded. New Moon's Japanese printed legality is still provisional due to English proxy mapping. No bot here is established as competent at all realistic counterplay, even after a verified source opening; captured decision traces are **not** independently verified legal-replay witnesses. No game from this frame should be counted toward 99.5% or an aggregate 29/32 result.

Remaining seed partitions **1, 2 and 3** are fixed in the original registration. Complete them, audit each independently, and publish the actual starting-order and opportunity denominators. If the narrow v1 condition continues to be absent, pursue a separately precommitted **conditional source-opportunity design** that retains rejected source seeds and reports conditional counterplay without pretending that selected opportunities represent random competitive games.