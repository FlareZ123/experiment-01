# Agent 16: separate initial physical pairing from first-live-hand outcomes

**4 November 2026. Status: methodological correction with seven pure tests; zero competitively qualified games.**

## Scope and exact distinction

The previous Agent16 read-only prebot observer repaired a real provenance error: historical `sourceFirstOwnHandSha256` represented a setup decision, while a genuine first-playable-own-turn observation was required for truthful first-turn reporting. Original rank-16 native replay in [the earlier report](../aichi-2026/agent16-rank16-live-prebot-source-hand-pairing-20261104.md) found 7/8 matching initial source physical deals and 7/8 matching genuine live-hand name multisets, including the same `16:1:B` mismatch. This does **not** establish that these two equalities must hold together in every matchup or policy test.

A source player's first-live hand is **after setup**. When the source goes second, the opponent's first playable turn can have effects on the source's hand or deck before that live snapshot. Those effects may be **precisely the candidate's tactical payoff**. Requiring `sourceFirstOwnHandSha256` or `sourceFirstOwnHandMultisetSha256` parity before assessing the candidate would condition on a potentially post-treatment variable and may remove genuine disruption from the sample. A different hand is diagnostic evidence requiring explanation, not an automatic invalidation of an initially paired experiment.

### Inference contract

| Target comparison | Proper opening treatment of observed fingerprints | How to use first-live hand |
| --- | --- | --- |
| Unconditional fixed-60 win rate across all naturally randomized games | Preserve **all** registered original attempts. Mulligans and opponent compensation draws are legitimate deck-choice consequences; matched source deals must not become a selective inclusion filter. | Record as a game-state observation or effect outcome, not a matching criterion. |
| Same fixed 60, policy A/B under a deliberately common physical input | Check observed source/full physical pre-treatment deal and actual seat/turn custody when claiming controlled input. Mark mismatches/unavailable data; retain attempts. | Compare as a possible downstream effect; if source first and the observation changes, inspect effect order and observer fidelity. |
| Two different candidate 60s given the same integer seed | Same seed does not imply equal source deal, as proven by the original rank-16 and rank-5 native examples. Retain unpaired cases in the denominator. | Matching live hands does not rescue unequal initial deals. |

Agent48 independently proved a related **setup mediator** issue: the contenders' different Basic counts change their mulligan rates and consequently the source's bonus draws ([causal audit](../statistics/agent48-deck-choice-mulligan-source-pair-causality-20261103.md)). The new warning concerns **later in-game effects** when a source goes second. Both boundaries matter.

## Reproducible diagnostic

- `simulation/evaluation/agent16-initial-vs-live-hand-pair-audit.cjs` compares source initial physical fingerprint, verified starter and seat, the correctly versioned first-live ordered hash, and the separately versioned unordered full-name multiset hash. Legacy setup digests are never accepted as a replacement.
- `tests/agent16-initial-vs-live-hand-pair-audit.test.cjs` includes seven pure Node tests: same initial state with distinct later hand; false legacy equality; order-only difference; absent protocol; starter and seat vetoes; invalid source hash; and mismatched registration.
- The same-initial/different-live example is **a synthetic methodological counterexample**. It is not an observed native Aichi game or a claim that a particular opposing card was selected correctly.
- `pairedAtInitialRoot` describes a narrow initial-source custody parity. It **does not** certify an entirely identical two-player deal, strategic policy, paper effects or a completed game, and does not by itself justify dropping unmatched random games.

The existing source/runner provenance, late native Store acceptance, all action caps/errors, original printed identities, actual opponent response, and official match clock remain separate qualification gates. This report changes **no** deck candidate selection, printed card ruling, tournament estimate or source admission. The benchmark remains **29/32 authenticated original card-name/count inventories, zero competitively qualified games and no demonstrated 99.5% win rate**.

**Agent 16**
