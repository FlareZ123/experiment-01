# Source rank2 double-TM access can decline with excess mulligan bonus draws

**Agent 40 | 2 November 2026 | original Aichi ranks 2, 6 and 1 | independent source-card location screen; no competitive games.**

## Decisive result

The original Aichi runner-up rank2 Vileplume/Bunnelby list has a narrowly defined opening route:

`Bunnelby Active → Tag Call / Guzma & Hala → Artazon + Capture Energy + TM: Evolution → Oddish + Pidgey Bench → Ω Barrage Evolution twice → Vileplume AOR + Pidgeot ex`.

The four intermediary/final evolutions (**Gloom, Pidgeotto, Vileplume AOR and Pidgeot ex**) are each present twice in its registered 60 and must remain **in the searchable deck** for the two TM attacks in this particular route. An optional opponent-mulligan bonus card can supply a missing initial connector while also drawing the last available Stage card out of the searchable deck. In a fixed, location-only screen, the probability of this route is therefore **nonmonotonic** in the number of opponent-mulligan bonus cards accepted. A deterministic physical 60-card counterexample in the [pure tests](../../tests/agent40-rank2-mulligan-bonus-tm-screen.test.cjs) produces the exact event sequence `false → true → false` when the first bonus reveals Guzma & Hala and the next draws the remaining Gloom after one was Prized.

The paper game setup permits a player to choose **up to** the number of bonus cards owed for opponent mulligans. This means the number taken is a real strategic decision, and a blind rule to always take the maximum can harm an otherwise available deck-only evolution search. This claim applies to the **specific narrow resource event**, with no claim that declining cards improves the deck's full-game win probability.

## Verified original source counts and rules

- Exact source: [29 original printed decklists](../aichi-2026/full-decklists.json), Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, validated by [Agent7's source-pinned parser](../../scripts/agent7-vileplume-artazon-capture-opening.cjs). Rank2 Takahiro Ando has **14 eligible Basics**, **2 Bunnelby**, **4 Tag Call**, **4 Guzma & Hala**, **2 each of Artazon / Capture Energy / TM Evolution / Oddish / Pidgey** and **2 each of Gloom / Pidgeotto / Vileplume AOR / Pidgeot ex**.
- Opponent rank6 Kazuma Kashi Iron Thorns-only has **4 eligible Basics**; rank1 Yasunori Kato Shadow Rider has **14**. All opponent counts are sourced from those same exact original sixties, while the actual opposing hand and all opponent decisions are excluded from this opening screen.
- Attached Advanced Player's Rulebook, Setting Up to Play Step 5: if **both players** show invalid first sevens, both restart. When just one starts valid, it can later draw up to one bonus per opposing mulligan, after placing six Prizes. A player cannot select a Bunnelby newly drawn from these bonuses as its *initial* Active Pokémon.

The screen models an initial seven, six unknown Prize cards, up to 25 voluntary bonus draws from the residual deck, and first ordinary draw. It preserves the initial Bunnelby requirement and source's original 60 exactly in every pseudo-random permutation. The source must have Tag Call/G&H by first draw; G&H must be in hand or searchable via Tag Call; all five enabling resource categories must have at least one non-Prized card; each of four evolution stages must have at least one copy still in **deck**. It does not consume a two-card G&H discard, execute any action, enforce opponent interaction, or measure a game win.

## Paired 25-million-shuffle result

The independent seeded canonical-category pilot examined **25,000,000** original-rank2 shuffles, simultaneously computing all **26 bonus-card decisions, m=0 through 25**, from the same physical arrangement. Seed **2102664725**, xorshift32 and reversible partial Fisher–Yates. Every estimate is conditioned on the original seven containing some valid Basic. Its `m=0` opening estimate agrees within sampling uncertainty with Agent7's independent 40-million-shuffle baseline of **13.64909%**. This pilot was run locally with the same ordered source category counts and algorithm; the committed code reproduces it with manifest SHA verification.

| Bonus cards voluntarily drawn, m | Ready source events / 25M | Estimated conditional ready rate |
| ---: | ---: | ---: |
| 0 | 2,937,490 | **13.64039%** |
| 1 | 3,062,653 | 14.22159% |
| 2 | 3,138,540 | 14.57398% |
| 3 | 3,169,997 | **14.72005%** |
| 4 | 3,162,178 | 14.68374% |
| 6 | 3,054,813 | 14.18519% |
| 7 | 2,965,029 | 13.76827% |
| 8 | 2,856,163 | **13.26275%** |
| 10 | 2,596,712 | 12.05797% |
| 16 | 1,685,707 | 7.82767% |
| 25 | 559,350 | 2.59737% |

The approximate normal 95% sampling half-width for each near-peak percentage is **±0.015 percentage points**, assuming effectively independent pseudo-random trials. The rates at m3 and m4 are close relative to that uncertainty; the broad nonmonotonic shape, including m8 dropping below m0, is much larger.

## Actual simultaneous opponent-mulligan distribution

A separately exact combinatorial model accounts for repeated rounds where both openers fail and **no bonus is earned**. For a player with `b` eligible Basic cards, define
`p(b) = 1 - C(60-b,7)/C(60,7)`.
For original rank2 `a=p(14)` and opposing `b=p(B)`, a shared attempt in which both fail restarts with probability `q=(1-a)(1-b)`. Conditioning on reaching a decisive attempt, the runner-up's voluntarily *available* bonus count M has

- `P(M=0) = b/(1-q)`;
- `P(M=m≥1) = [a(1-b)/(1-q)] × b × (1-b)^(m-1)`.

These reflect the complete simultaneous-mulligan procedure; a valid opponent opening followed by an invalid rank2 opening gives the opponent bonus instead, so rank2 gets zero. Their sum including the infinite tail is exactly 1.

| Original opponent | Opponent legal-seven probability | Probability rank2 is offered ≥1 bonus | Ready rate if taking no bonuses | Ready rate with blind cap of 3 | Ready rate taking all offered |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank6 Iron Thorns (4 Basics) | 39.94996% | **56.42343%** | 13.64039% | **14.11744%** | **14.05155–14.05171%** |
| Rank1 Shadow Rider (14 Basics) | 86.14093% | **12.17212%** | 13.64039% | **13.71742%** | **13.71740%** |

The cap-3 calculation evaluates `ready[min(m,3)]` at each exact mulligan bonus weight. The “all offered” range bounds the omitted **m greater than 25** tail by allowing its unknown readiness to be anywhere from 0 to 100%. For rank6, the omitted tail is 0.00016379 percentage points; for rank1 it is negligible. The sampled best *unconditional blind cap among 0..25* happens to be **3 for both opponents**, though confidence in this precise cap is weaker than evidence for the nonmonotonicity. A policy conditioned on the owner's visible initial hand, source choice and the opponent's mulligans might do better.

The source player is *free to take fewer* bonuses. More cards could enable completely different game plans and improve actual winning chances despite reducing this strict deck-only TM event. The numerical value of “cap 3” is an **exploratory proxy optimization**, not a playing recommendation.

## Reproduction and evidence classification

- [Full source-pinned paired sampler and simultaneous-mulligan distribution](../../simulation/evaluation/agent40-rank2-mulligan-bonus-tm-screen.cjs). Repeat from the repo root using `node simulation/evaluation/agent40-rank2-mulligan-bonus-tm-screen.cjs 25000000 25 2102664725`. No Twinleaf engine is necessary.
- [Seven independent pure tests](../../tests/agent40-rank2-mulligan-bonus-tm-screen.test.cjs) establish source SHA, random m0 parity with Agent7, reproducibility, legal-seven normalization, double-invalid restarts, and counterexamples where drawing the last Stage destroys the line.
- The tests and shorter 200,000-sample deterministic CLI audit **passed** the existing manual-only Aichi card audit workflow, [GitHub Actions run 41509431881](https://github.com/FlareZ123/experiment-01/actions/runs/41509431881), following correction of a **toy test setup** that had initially exchanged one Bunnelby with the other instead of moving it into a bonus slot. The earlier CI run 41509149101 failed that mistaken test; the sampler itself was not implicated.

**Evidence label:** reproducible simulated card-location event plus mathematically exact simultaneous-mulligan weighting. **Not** a full legal action execution, opponent-aware optimal policy, or match simulation. All original-field results remain 29/32 authenticated source sixties, zero competitively qualified games, no supported 99.5% claim.

**Follow-up with material outcome value:** put a hand/Prize-aware, actor-only choice of voluntary mulligan bonus size into the actual native setup handler; preserve owner's initial seven/private hand, face-down Prizes, source-owned K0 status and opponent mulligan count. Then require an actual Tag Call/G&H two-card payment, genuine Artazon/Capture/TM prompts, and bilateral opponent actions. Compare capped and max-draw policies against a common decision policy with actual completed game states and fixed opponent list. Until then, treat the table as a caution against the proxy “more drawn cards always increases setup ability.”
