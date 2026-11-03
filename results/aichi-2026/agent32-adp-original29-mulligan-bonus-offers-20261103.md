# Agent 32: original-29 simultaneous mulligan offers from the seven-Basic ADP v2

**3 November 2026 | exact physical setup arithmetic | zero native games, zero qualified wins.**

## Source and question

The fixed [Agent5 ADP/Thorton/Regidrago v2 candidate](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical card-count SHA-256 **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**, has **seven Basic Pokémon**: two ADP, three Regidrago V, one Tapu Lele-GX and one Crobat V. An initial seven has no Basic with exact probability **39.912045076769%**, fraction **3,853,577 / 9,655,173**. This is a mulligan event, distinct from whether the eventually legal first seven contain ADP or its GX resources.

The [supplied Advanced Player's Rulebook, setup section G](../../resources/) specifies an important bilateral condition: if *both* players' initial sevens have no Basic, both restart together, while one player's repeated mulligans after the other has a valid Basic can give the waiting opponent optional extra opening draws. Therefore a unilateral 39.91% mulligan probability cannot be read as the probability an opponent is actually offered bonus cards. We counted this bilateral process exactly for all **29 authenticated original Aichi 2026 Top32 printed sixties**, using their actual Pokémon printing subtype from the bundled English card database. Original ranks **23, 25 and 28** remain unknown.

## Exact bilateral derivation

Let qA = C(60 - A, 7)/C(60,7) be the candidate's first-seven failure probability for A Basic Pokémon; similarly qB for the opponent with B Basic Pokémon. Independent repeated seven-card setup trials give:

- **Probability the opponent is offered at least one bonus card due to candidate mulligans:** qA (1 - qB) / (1 - qA qB).
- **Probability of an offer of at least k cards (k >= 1):** [qA (1 - qB) / (1 - qA qB)] qA^(k-1).
- **Expected count of optional bonus-card offers:** qA (1 - qB) / [(1 - qA qB)(1 - qA)].

The denominator 1 - qA qB correctly removes simultaneous first-seven failures, after which both players redraw. A count of *offered* extras is different from the count the opponent **elects to draw**, and neither quantity alone demonstrates winning strength.

## Audited 29 original opponent Basic counts and offers

The 29 original printed Pokémon inventory rows all matched a unique card database printing with a Basic/Evolution subtype. Grouped results are exact by identical B, with percentages rounded here:

| Original opponent Basic copies | Authenticated original ranks | P(opponent offered ≥1 extra) | Expected extras offered |
| ---: | --- | ---: | ---: |
| 4 | 6, 24, 29 | 20.97% | 0.349 |
| 10 | 8 | 33.00% | 0.549 |
| 11 | 3, 5, 9, 11, 13, 16 | 34.06% | 0.567 |
| 12 | 7, 22, 26 | 34.96% | 0.582 |
| 13 | 4, 17, 32 | 35.74% | 0.595 |
| 14 | 1, 2, 14, 15, 20, 21 | 36.39% | 0.606 |
| 15 | 10, 12, 27, 31 | 36.96% | 0.615 |
| 16 | 18, 19, 30 | 37.43% | 0.623 |

**Equal-rank summary over the 29 authenticated sources:** probability the opponent is offered at least one extra is **34.166910808999%**; the mean expected offer count is **0.568614972046**. These are an equal-weight descriptive field summary; no competitive weighting or match strength is assumed. Against the four-Basic Iron Thorns originals (ranks 6/24/29), the source's high own mulligan rate makes both players redraw together more often, reducing the opponent-offer probability to **20.97%**. Against the sixteen-Basic originals (ranks 18/19/30), opponents have fewer own mulligans, and the offer probability rises to **37.43%**.

Candidate's standalone expected number of failed seven-card redraws until its own legal first seven, without opponent compensation, is **0.664227050625**. This standalone expected redraw count exceeds the bilateral 29-rank expected opponent offer count, as simultaneous failed setups and the opponent's own mulligans change when bonuses become available.

## Reproduction and evidence

[Exact BigInt evaluator and all-29 printing census](../../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs), [six targeted regression tests](../../tests/agent32-adp-field-mulligan-offers.test.cjs), original source [29-60 roster](full-decklists.json), and [existing manual-only card audit](../../.github/workflows/aichi-card-audit.yml). **Actual GitHub Actions [41553939614](https://github.com/FlareZ123/experiment-01/actions/runs/41553939614), source head 4f85bc2788baefd2c387cfc0857f470d77c9a3d9, succeeded**. The focused simultaneous-mulligan test step passed; six tests, zero failures. Exact fractions for every rank are visible in the executable's machine JSON; fixed input card identity, 29 complete rosters and missing ranks are asserted.

### Consequence for the single-deck comparison

The physically narrow enhanced-GX first-turn screen previously found **28.993653%** ADP-starter access, rising to **36.456101%** after adding disjoint Switch/Tag/Quick Ball access routes. Those percentages are conditional on already having a Basic-valid first seven, so they should never be multiplied by mulligan penalties or treated as raw game-win rates. The new bilateral result adds a **separate opponent opening-resource channel** to the candidate admission assessment. Proper native benchmarks must record actual opponent extra draws, both player seats, exact source physical deals, the selected source actions and paper-valid continuation. A bonus-card opportunity is a possible source pressure mechanism, not a quantified loss.

**Deck and field status:** unchanged fixed ADP v2; 29/32 exact opponents authenticated; three missing; zero competitively qualified paper games and no best selected fixed sixty.
