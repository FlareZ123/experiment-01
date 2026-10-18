# New Moon sole Klefki versus an initially held Meloetta ex

**Agent 4, 18 October 2026.** This is a narrower extension of the existing [exact New Moon Klefki and rank-26 Cologne joint model](new-moon-meloetta-joint-resource.md). It concerns source-conditioned opening cards and idealized access only. The existing joint result already established the broader **0.457256%** event; it remains the authoritative baseline and is reused in the new implementation.

## New stricter setup event

The registered Aichi rank-26 Meloetta Donk list contains one Meloetta ex BLK 44, one Canceling Cologne ASR 136, three Order Pad UPR 131, one Forest Seal Stone SIT 156, and one Crobat V DAA 104 among twelve Basic Pokémon. New Moon Lockbreaker v1's frozen English mechanical proxy has seventeen Basics, exactly one being Klefki SVI 96 with Mischievous Lock. The candidate's Japanese paper legality remains unverified.

The new simultaneous event is:

1. New Moon finishes setup with **sole Klefki** in play after taking all legal opponent-mulligan bonuses and Benching any other Basic drawn.
2. Rank 26 holds its singleton **Meloetta ex in its original valid seven**.
3. Rank 26 has an idealized first-turn **Canceling Cologne resource opportunity**, directly in its visible cards, via at least one fair Order Pad heads with Cologne searchable, or via visible Crobat V and Forest Seal Stone with Cologne searchable.

Six random Prize cards are inaccessible for search, and a mandatory first-turn draw is counted. Cards drawn after initial seven do not satisfy condition 2 even if they might subsequently be searched or switched into the Active Spot.

| Conditional-on-legal-setup event | Exact probability |
| --- | ---: |
| New Moon sole Klefki, from [earlier research](new-moon-meloetta-joint-resource.md) | **1.615458%** |
| Sole Klefki plus any modeled Meloetta Cologne resource opportunity, earlier result | **0.457256%** |
| Sole Klefki, initial-seven Meloetta ex, and modeled Cologne opportunity, **new** | **0.061426%** |
| New event as fraction of preceding broader joint event | **13.4335%** |

The new probability is **0.0006142557039753475** as a unit probability, computed with the source-locked Python-independent JavaScript finite-population formulas. It is a subset of the existing **0.004572560824435498** broader joint event and cannot establish any actual game win.

## Derivation and reproducibility

Let `pD = C(43,7)/C(60,7)` denote New Moon's seven-card mulligan probability and `pA = C(48,7)/C(60,7)` the rank-26 rate. The chance both valid hands arise in the same round after any simultaneous failed redraws is `q0=(1-pD)(1-pA)/(1-pD*pA)`. For each positive `k`, the two possible bonus recipient branches have masses `q0*pA^k` (New Moon receives `k`) and `q0*pD^k` (Meloetta receives `k`). Both cannot receive bonus cards in one setup.

Conditional on New Moon's initial legal seven consisting of Klefki and six non-Basics, the probability of retaining sole Klefki through `k` optional bonus draws is `C(37,k)/C(53,k)`. This multiplier is zero beyond 37 draws. Its initial probability is `C(43,6)/(C(60,7)-C(43,7))`.

The first-seven Meloetta condition is incorporated through the existing prize-aware and fair-coin exact enumerator `fixedInitialMeloettaWindow(12,k)` in [the existing Stone/Pad source model](../aichi-2026/meloetta-stone-pad-joint-access.md). The new [extension implementation](../../scripts/new-moon-meloetta-joint-lock-window.cjs) weights that condition across both mutually exclusive bonus-draw directions. Its [test](../../tests/new-moon-meloetta-joint-lock-window.test.cjs) independently shuffles **220,000 synthetic physical 60-card decks**, redoes both players' mulligans, sets six inaccessible Prizes, draws bonuses and one turn card, then flips each observed Pad. This test also samples the two established marginals and broad joint event, making a mistaken case split observable.

The test is added to the existing **manual-dispatch** [Aichi opening audit workflow](../../.github/workflows/aichi-opening-audit.yml), with a JSON artifact for the new result. No per-commit workflow was introduced. A successful CI run is required before describing the Monte Carlo regression as passed.

## Tactical meaning and limits

Initial-seven Meloetta ex is a stricter accessibility condition. It can be selected as the starting Active, but **Tapu Koko Prism Star's Dance of the Ancients accelerates Lightning Energy onto Benched Pokémon**, making a starting Active Meloetta potentially inconvenient. A switch or different Energy line may be needed before Crisis Punch. This exact census has no model of the five Exeggcute self-KOs, Damage Pump acquisition, Stadium sequencing, Item contention, Koko Energy, opponent's second Basic, actual attack permission, adversarial policy, or complete games. Other routes can retrieve Meloetta later.

Consequently, the 0.061426% result is **neither an upper bound on donk win probability nor a success rate**. It is a precisely specified setup-and-resource intersection suitable for falsifying overconfident heuristic claims about naturally simultaneous lock-break and immediate attacker readiness. Full-field evidence remains **29 published opponent 60s of 32** and **zero independently qualified competitive games**.
