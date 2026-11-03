# Agent 32: exact ADP-first enhanced-GX physical-access screen

**3 November 2026.** Independent candidate-admission arithmetic. **Zero native games; zero qualified paper wins.**

## Fixed candidate and question

Input: [Agent5's unchanged ADP/Thorton/Regidrago v2](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical card-count SHA-256 **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**. Its six disjoint relevant groups are 2 ADP SM12 156, 5 other Basic Pokémon, 4 Double Dragon Energy XY6 97, 3 Guzma & Hala SM12 193, 4 Tag Call SM12 206, and 42 other cards. The initial seven must contain a Basic. Going **second**, the pilot must be able to start ADP Active from those actual seven cards, then hold or search a DDE by their first own ordinary draw, before an attempted enhanced Altered Creation-GX.

The three **disjoint** access routes are: (1) DDE already in the first eight; (2) no held DDE, but held G&H and a DDE remaining outside Prizes; or (3) no held DDE/G&H, but held Tag Call and at least one G&H plus DDE outside the eight and six Prizes. In the two search branches there are at least two other *physical* hand cards available for G&H optional payment after choosing ADP as starting Active. The strategic acceptability and actual dispatch of those discards remain untested.

## Exact probabilities

| Branch | Probability among Basic-valid initial seven |
| --- | ---: |
| Direct DDE held by card eight with ADP starting | **15.018760354909%** |
| Held G&H, deck-searchable DDE | **7.488562686295%** |
| Held Tag, deck-searchable G&H and DDE | **6.486329971327%** |
| **Disjoint union** | **28.993653012532%** |
| ADP physically available as opening Active, regardless of Energy | **36.857457844359%** |

The union's exact conditional fraction is **2,758,332,388,993 / 9,513,573,152,720**. Within the ADP-starter subgroup, **78.6642777561%** pass this energy-access screen. About **71.00635%** of Basic-valid opening sevens fail this specific route *before opponent interference*. They may still have successful alternative plays, so this is neither a loss rate nor a bound on every possible ADP GX route.

The exact valid-seven count is **232,063,840** (C(60,7) minus C(53,7)), and the counted conditional seven/eighth-card/six-Prize physical possibilities total **250,397,245,379,590,400**. The three favorable integer numerators respectively are **37,606,562,218,854,720**, **18,751,154,685,007,360** and **16,241,591,574,433,680**. They sum to **72,599,308,478,295,760**. Their individually reduced fractions are **4,356,639 / 29,007,980**, **374,175,362 / 4,996,624,555**, and **47,467,826,673 / 731,813,319,440**.

## Reproduction and independent checks

Enumerate physical category-count vectors for the first **seven** cards with multivariate binomial products, retaining only ADP starters. Multiply each by the number of possible eighth draws for each category. Count disjoint six-Prize choices that do not exhaust all remaining DDE and, on the Tag-only route, G&H. Inclusion-exclusion uses C(52 - r, 6 - r) for fully Prized required groups. Sampling Prizes after the eighth card is distributionally equivalent to the authentic order of first seven, Prizes, then one draw. Divide by **[C(60,7) - C(53,7)] × 53 × C(52,6)**.

An independently derived *direct-route* identity gives the numerator **53 × [C(60,7) - C(58,7)] - 49 × [C(56,7) - C(54,7)]** before dividing by **53 × [C(60,7) - C(53,7)]**. The exact reduced direct-route fraction matches the grouped enumerator. Secondary 200,000-shuffle NumPy check with seed **2026110301** gave **120,255** Basic-valid seven-card deals and **18,129 / 8,928 / 7,806** direct/G&H/Tag-positive draws, consistent with exact mass.

Reproducibility: [BigInt evaluator](../../simulation/evaluation/agent32-adp-first-gx-physical-window.cjs), [six source-exact regressions](../../tests/agent32-adp-first-gx-physical-window.test.cjs), and the existing [manual card-audit workflow](../../.github/workflows/aichi-card-audit.yml). **Actual GitHub Actions [41552420512](https://github.com/FlareZ123/experiment-01/actions/runs/41552420512) succeeded**, source head **7a09e37038010c8ab4f36626f27ad6bf75cd8fd4**, with six ADP tests and zero failures. Tests cover fixed v2 identity, exact fractions, independent closed-form, Prize inclusion-exclusion and zero-Tag/zero-DDE controls. No native game was run.

## What this falsifies and what remains

The candidate's [original proposal](agent5-adp-thorton-regidrago-structural-fifth-candidate-20261102.md) reports the **36.85746%** ADP-in-seven starter frequency. This screen refines its **one unassisted ADP-starter first-GX line** by including the Energy's first-eight-card location and Prize survival of two competing Tutor channels. **28.99365% is a narrow physical-access ceiling for that defined line**, because it assumes an available Item/Supporter window and that two G&H discards are acceptable. It is not an upper bound on all possible first-turn GX lines: Quick Ball, Tag Call to find ADP, Switch, Crobat/Lele, Pokégear, other draw/search, mulligan bonus cards and Active promotion can extend reach. Item/Supporter locks, Temple of Sinnoh, an opponent's first turn and subsequent Thorton evolution can prevent actual success.

The decisive next original-source witness should record ADP as the actual selected starter; held DDE vs G&H/Tag channel; physical G&H two-card payment; Store-received DDE; genuinely declared enhanced GX and its persistent extra-Prize flag; later Thorton and Regidrago attack; and a competent original-source reply in **both seats and both starting orders**, using the single existing frozen bilateral harness. Retain every attempted deal and paper-payment failure. A staged native success does not qualify a full competitive game.

**Project decision status remains unchanged:** 29 authenticated Aichi original sixty-card opponents, missing ranks 23/25/28, no selected best 60 and no competitively qualified match wins.
