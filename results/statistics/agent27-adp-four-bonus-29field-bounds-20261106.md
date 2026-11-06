# Agent 27: exact four accepted bonus cards narrow the ADP v2 field-access interval

**6 November 2026. Source-pinned exact physical opening analysis. Zero competitive games.**

## Question and scope

The unchanged [ADP–Thorton–Regidrago v2 printed 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json) has seven eligible starting Basics. If an opponent mulligans repeatedly, the candidate may choose bonus draws. How often can its first own turn mechanically fund the original Agent5 ADP-priority enhanced Altered Creation-GX route, counting real three-card hand payment and six initially inaccessible Prize cards? The earlier [exact two-bonus study](agent27-adp-two-bonus-29field-bounds-20261106.md) left all offers of three or more bonuses in a broad tail.

The new [generic enumerator](../../simulation/evaluation/agent27-adp-additional-bonuses-exact.cjs) handles **zero through four accepted bonus cards** conditional on a Basic-valid first seven. It reuses the existing source 60's twelve physical card categories, original mandatory payment/route predicates, source-specified six Prizes, and one ordinary first-own-turn draw. The three safe-discard profiles are **hypothetical DCI restrictions**, without a claim that a competent player would value those physical cards as expendable. An optimistic mechanical profile permits discarding other line-unreserved cards.

## Exact conditional source probabilities

| Extra bonus draws taken | Mechanically payable | Only six Dragons safely discardable | Dragons + seven Grass/Fire Energy | Plus four Battle Compressor |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 37.981531% | 20.025570% | 26.612382% | 30.110197% |
| 1 | 42.086115% | 23.986436% | 32.069404% | 35.800841% |
| 2 | 45.889741% | 28.158246% | 37.407984% | 41.107104% |
| **3** | **49.393462%** | **32.452783%** | **42.467962%** | **45.916747%** |
| **4** | **52.607766%** | **36.780649%** | **47.140795%** | **50.187675%** |

For three bonuses, the exact full-deck denominator is **22806181109173093632000**, mechanical numerator **11264762329340418812520**. For four, the denominator is **980665787694443026176000**, mechanical numerator **515906360695127399354280**. All counts are BigInt and count physical multiplicities.

The counted initial seven are exactly the Basic-valid hands. Write D = accepted bonus count + one ordinary draw. The normalizing count is

```text
(C(60,7) - C(53,7)) * (53)_D * C(53-D,6)
```

where the middle term is a falling factorial. Every unordered D-card draw multiset is multiplied by D! orders. The initially hidden six Prizes are summed by their ADP, Guzma & Hala, and Double Dragon Energy counts; the remaining cards are one combinatorial complement class. This removes large, redundant Prize-state loops without changing the original payment or availability predicates.

For fixed original hand/Prizes, an additional bonus draw cannot remove a previously mechanically payable source line under these source predicates: a required card moves from the searchable deck to the player's hand, or another hand card becomes available. The models' exact conditional access rates are therefore monotone, enabling a lower bound for five or more accepted bonus draws by using the four-bonus rate.

## Full authenticated original field

The [original-source printed Basic census](agent1-original29-bilateral-mulligan-bonus-20261104.md) and two-player simultaneous-mulligan protocol determine the chance that a seven-Basic ADP candidate is offered each number of bonus cards. Assuming **all offered cards are accepted**, the 29 equally weighted original opponents have these candidate-received masses:

| Accepted bonus count | Equal-original-rank probability |
| --- | ---: |
| 0 | 85.605513% |
| 1 | 9.759563% |
| 2 | 2.543733% |
| 3 | 0.963689% |
| 4 | 0.475642% |
| 5 or more | 0.651861% |

The previously open three-or-more tail was 2.091192%. Only the five-or-more tail, 0.651861%, remains interval-bounded. Using the four-bonus result as the lower value of that tail and 100% as its conservative upper value gives:

| Discard assumption | 29-original equal-rank lower | Upper |
| --- | ---: | ---: |
| Any unreserved card, mechanical | **38.858170%** | **39.167102%** |
| Six Dragon payloads only | 20.927680% | 21.339783% |
| Dragons + Basic Energy | 27.803832% | 28.148401% |
| Dragons + Energy + Compressor | 31.324011% | 31.648718% |

The 29-original result excludes missing historical full sixties at ranks **23, 25, and 28**. It is an access estimate conditional on the candidate's final valid setup seven, with the jointly modeled opponent mulligans. The candidate's own seven-Basic list can give its opponents extra bonus draws as well. Those opposing benefits and competent counterplay are not included in the resource screen.

## Independent validation

- The new enumerator exactly reproduces the prior full-60 zero, one and two bonus BigInt denominators, mechanical numerators, and zero-protected-payment counts.
- An independent *labeled physical miniature* exhausts every Basic-valid four-card hand, two physical Prizes, and all 4-card / 5-card bonus-plus-natural draw choices, using the separate original minimumProtectedPayments predicate. Its mechanical counts and all five-bin payment histograms match the generic source.
- [Full-60 and miniature regressions](../../tests/agent27-adp-additional-bonuses-exact.test.cjs), [miniature test](../../tests/agent27-adp-additional-bonuses-miniature.test.cjs), [field regression](../../tests/agent27-adp-original29-four-bonus-bounds.test.cjs), and [source 29-field bounds](../../simulation/evaluation/agent27-adp-original29-four-bonus-bounds.cjs) reproduce the table without stochastic approximation.
- Manually dispatched [existing Aichi opening audit CI 42144108050](https://github.com/FlareZ123/experiment-01/actions/runs/42144108050), optional four-bonus math job; execution status should be checked before considering compiled CI verified.

## Admission and interpretation

This is **mechanical source resource availability**, with deliberately favorable assumptions about fully accepted optional bonus draws, protected discards, supported card routes, and a specific first-own-turn ADP-priority line. It is neither actual owner-policy choice, actual paper-valid native Store payment, guaranteed first-turn attack, 25-minute match performance, nor a competitive game outcome. No new candidate is selected from this study. The field remains **29/32 source sixties**, **zero qualified games**, and no demonstrated 99.5% deck.

The highest-value next validation would connect a source-owned exact paid opening opportunity to an actual funded native attack, an opponent with meaningful decisions, and continuing board consequences under the shared, frozen bilateral policy. An alternative extension is testing the mechanical DCI assumptions against real owner-held source hands; extrapolating this access probability into win percentage would be invalid.
