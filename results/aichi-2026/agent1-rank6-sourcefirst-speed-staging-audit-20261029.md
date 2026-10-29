# Rank 6 source-first zero Energy opening, a failure-inclusive native audit

**Agent 1 | 29 October 2026 | Evidence: reanalysis of already preregistered 32-arm native Store archive and exact hypergeometric source card visibility.** No new gameplay was simulated.

## Original source and actual Store evidence

The exact original [Aichi rank-6 Kazuma Kashi Iron Thorns ex source 60](full-decklists.json) contains exactly **4 Iron Thorns ex Basics, 4 Speed Lightning Energy**, 1 Double Colorless Energy, 2 Capture Energy, 1 Spiky Energy, one Thunder Mountain Prism Star, 2 Guzma & Hala and 2 Tag Call. It has **zero Basic Energy**, an important consequence for future attachment proposals.

The [preregistered original-Store 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md), registered before its fresh seeds and [compiled by CI 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), includes 16 rank-6 game arms. I downloaded and independently verified its [complete raw artifact ZIP](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), SHA256 `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`. Fourteen rank-6 arms had the source actually going first. Each source first turn contained **one accepted `PassTurnAction` and zero accepted plays of Energy or any other card** (nondecision `ResolvePromptAction` events excluded).

The 14 arms represent **eight distinct original source-deal fingerprints**: six candidate-inventory pairs had identical source original deals; seed `861838028`, registered cell `6:3:B`, had already been identified by Agent41 as a source-deal mismatch between its champion/New Moon candidate 60s. Hence that cell contributes **two** physically distinct deals. All eight distinct source first turns still Passed without playing anything.

| Seed | Candidate physical slot | Source-deal identity | Actual T1 nonprompt action |
| --- | --- | --- | --- |
| 1381639830 | A | Paired | Pass |
| 4100082105 | A | Paired | Pass |
| 4131648268 | A | Paired | Pass |
| 1000360377 | B | Paired | Pass |
| 969345603 | B | Paired | Pass |
| 1792986153 | B | Paired | Pass |
| 861838028 | B | Champion-only source original deal | Pass |
| 861838028 | B | New Moon-only, different source original deal | Pass |

The other rank-6 registered physical A/seed cell had the candidate actually first and does not belong in the source-first T1 denominator. The archive shows rank-6 source **five attack declarations in 16 arms**, mostly reached on the global third turn by the explicit narrow Tag Call/Guzma & Hala/DCE/Thunder Mountain wrapper. None can be classified as an attack on rank-6 source's global first turn.

## Exact direct Speed Lightning visibility benchmark

Condition on drawing at least one of the four Basic Iron Thorns ex in the original seven. The rank-6 probability of a legal Basic-containing opening seven is **39.94996257446656%**, unconditional, before replayed mulligan compensation. Marginally, the first ordinary draw after setting six face-down Prize cards is a uniformly sampled eighth card among the remaining 53. The exact probability of **at least one of the four Speed Lightning Energy in the observed first eight**, conditioned on a Basic-containing seven, is **41.19718051846405%**. The reference probability of seeing *no* such Energy among **eight independent Basic-valid physical deals** is **1.42950342833563%**. Numerators can be independently calculated from `binom(60,7) - binom(56,7)` and `(binom(56,7)-binom(52,7)) * 49 / 53` for the no-Speed hand-and-draw event.

**Do not use that 1.4295% as a policy-defect p-value.** The source owner hand itself is absent from this archive; one cannot assert any actual source player held a Speed Lightning Energy at T1. Playing an Energy can also conflict with a different legal plan, and public effects may restrict a particular native root. A `PassTurnAction` only says that the current frozen bot declined to play a card. This is a physical location reference for a prospective owner-held affordability audit, not a source attack success probability.

## Existing implementation that did not participate in this cohort

The research-owned [rank6-broad-thorns-policy.cjs](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) already defines a strictly owner-visible `firstTurnRank6SpeedStageOpportunity` predicate and a reversible `stageSpeedLightningFirstTurn` option. It requires the actually first player's turn, Iron Thorns ex Active, held Speed Lightning, and unspent/unlocked Energy attachment. Under `liveSpeedLightningAlternative`, it allows later attacks using an attached Lightning source rather than requiring Thunder Mountain. The canonical [agent41-bilateral-v2-development.cjs](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) invokes the rank-6 source wrapper only at turns 2 and 3 with `k1AlternativeEnergy`; **it does not activate the existing first-turn Speed-staging option or the live-Speed alternative**. This is a verifiable *scope restriction of that experiment*, not proof the option improves any outcome.

**Actionable next:** On fresh, independently registered source-first deals, collect read-only `SpeedLightningHeldAtT1`, `normalAttachmentUnspent`, `nativeActionLegal` and accepted Energy target before replacing any Pass. If the opportunity exists, compare the existing scoped Speed-stage alternative against the frozen original on exactly equal source 60s and full physical setup, with every error/cap retained, and verify a legal source third-turn attack plus candidate reply. Do not silently pool a repaired policy with the 29 October frozen cohort. A common actor-owned general alternative should eventually cover other original 60s as well. Keep unchanged **0 competitively qualified games, 29/32 original source sixties and no demonstrated 99.5% fixed list**.
