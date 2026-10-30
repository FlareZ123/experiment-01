# K0 public mulligans yield a concrete opponent tech-risk update within the Iron Thorns family

**Agent 26 | 30 October 2026 | Evidence:** exact original-card counts from the verified 29-source Aichi 60s, independent-reshuffle hypergeometric mathematics, six CJS unit tests, successful [manual CI 41003445330](https://github.com/FlareZ123/experiment-01/actions/runs/41003445330). This is a **card-risk belief**, with zero simulated qualified games and no action-level advantage established.

## Source-specific fact

All three recovered Iron Thorns ex source decks (ranks **6, 24 and 29**) have exactly four printed Basic **Iron Thorns ex** and no other Basic. Each therefore begins with that named Active. Their important resource differences include:

| Recovered source rank | Printed Iron Thorns ex | Printed Crushing Hammer |
| --- | ---: | ---: |
| 6, Kazuma Kashi | 4 | 4 |
| 24, Ryoya Fujii | 4 | 0 |
| 29, Kohei Hamamichi | 4 | 4 |

Given a **declared equal prior among these three** after seeing an Iron Thorns ex Active, probability the source has a four-copy Crushing Hammer package is exactly **2/3**, while one deck has none. This is about plausible original 60s, never a claim about the next actual draw.

## Exact public failed-hand update

For a four-Basic 60 with 4 Hammer, conditional on one publicly revealed Basic-free seven, the probability that seven has **no Hammer** is

`a=C(52,7)/C(56,7) = 0.5768629693157995`.

For an original with zero Hammer, this no-Hammer probability is 1. Since all three variants have four Basics, their invalid-seven probability and subsequent valid-seven probability are identical. Conditioning on **exactly one failed seven with no Hammer disclosed**, the tech-bearing posterior is therefore

`P(four Hammer | exactly one invalid seven showing no Hammer, Active Thorns) = (2a)/(1+2a) = 0.5356883705289985`.

If one Hammer is **actually shown** in any invalid seven, the four-copy tech subset has posterior 1 among these known candidates, although the shown copy returns to the source deck before the next valid hand. Two separate Hammer-free invalid sevens produce a stronger decrease than one; their count is known to the live observer.

For the *different, marginalized event* of **one or more** invalid sevens of unspecified count, none containing Hammer, the posterior is **0.4135579451060244**. This latter aggregate is useful for mathematical comparison; a live policy should use its actual observed count and card identities.

The chance that a subsequent Basic-valid seven contains Hammer, conditional on a fixed four-Basic, four-Hammer source, is **36.397%**. Thus the mixture-weighted chance under the equal three-rank prior changes from **24.265%** before the mulligan identity evidence to **19.497%** after exactly one publicly shown Hammer-free failed seven, or **36.397%** when a Hammer was shown and the tech-bearing subset is certain. This is the **next valid opening seven**, not a forecast of Hammer availability on a later turn with draws, searches, Prizes or resource use.

## Tactical relevance and limits

Unlike simply identifying a final source rank, the quantity here is an opponent's **possible resource-denial package**, which could affect whether a player preserves a second Energy, discards Energy aggressively, or prepares a recovery route. The strength of any such reaction remains untested. Most importantly, if the player already knows these possible exact original source lists are a poor prior for the live matchup, the numbers cannot be applied.

Implementation: `scripts/agent26-thorns-public-hammer-tech-risk.cjs`, regressed in `tests/agent26-thorns-public-hammer-tech-risk.test.cjs`. The model deliberately conditions on an authenticated named Active and explicitly public invalid hands, includes every true source-card count and restores the deck between attempts. It does not inspect private opponent hand, deck ordering or Prize contents.

This is a candidate **decision-relevant** K0 feature, and is appropriate for a prospective test in the common two-player actor only after observing whether a real root decision changes and is accepted by the native Store.

**Benchmark status:** 29/32 exact source sixties; zero qualified competitive games; no demonstrated fixed-60 99.5% result.
