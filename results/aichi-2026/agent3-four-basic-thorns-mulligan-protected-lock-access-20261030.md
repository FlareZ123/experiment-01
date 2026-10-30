# Opponent four-Basic mulligans change the Jellicent + Silent Lab first-turn access denominator

**Agent 3, 30 October 2026. Exact initial-deal mathematics, not qualified gameplay.**

## Question

The [Silent Lab counter architecture](agent3-jellicent-silent-lab-wally-iron-thorns-counter-20261030.md) needs Active Frillish, Silent Lab, Boost Shake and a **searchable** Jellicent ex to evade Basic Iron Thorns ex's Initialization while the Stage 1 Oceanic Curse lock is present. Its raw direct 7+1 draw conditional access was **7.642610%** with four copies of each and 12 total Basics.

The three authenticated original Iron Thorns source 60s (final ranks **6, 24, 29**) all run *only four Basic Pokémon*, four Iron Thorns ex. Their mulligan frequency creates additional candidate draw opportunities that the original strict 7+1 model excluded. Under Advanced Rulebook §G, a Basic-valid candidate may choose to draw bonus cards up to its opponent's mulligan count after Prize setup. We quantify this neglected feedback, with no other draw engine.

## Fully specified finite-deck experiment

- Candidate: 60 cards, **4 Frillish, 4 Boost Shake, 4 Jellicent ex, 4 Silent Lab**, 12 total Basic Pokémon, remainder unspecified; initial seven is conditioned Basic-valid and must contain a Frillish chosen as Active.
- Source: an independent uniformly shuffled 60 with **exactly four Basics**; repeat seven-card deals until valid. Let `M` be the number of invalid source hands. The source's success probability per deal is `p = 1 - C(56,7)/C(60,7)`, so `P(M=m)=p(1-p)^m`.
- Candidate accepts all `m` optional bonus draws, followed by the ordinary first-turn draw. It has six uniform Prizes, and Boost Shake and Silent Lab must both be in its hand by then. **At least one Jellicent ex must remain in the deck**, after Prizes and all draws, for Boost Shake's search. Frillish must have been in the original setup seven.
- No Wally, Arven, Guzma & Hala, Trainers' Mail, other search or draw, additional mulligans by the candidate, source disruption, first-turn Stadium response, attaching, attacking or clock model. We restrict the opponent to 0..46 mulligans so that an ordinary turn draw can occur; the excluded source-mulligan tail has a rigorously bounded probability.

Reproduce with [exact integer combinatorics](../../scripts/agent3-jellicent-thorns-mulligan-access.cjs) and [regressions](../../tests/agent3-jellicent-thorns-mulligan-access.test.cjs). Enumerate every opening-seven four-category composition; for `d=m+1` additional candidate draws, count the exact multivariate hypergeometric ways to hold Boost and Lab, then subtract Prize allocations where all remaining Jellicent are Prized. Sampling the `d` draws before six Prizes in the combinatorial count is equivalent to the real reversed order because they are uniform disjoint subsets; it does **not** assert an in-game opportunity to inspect Prizes. BigInts hold exact integer totals before decimal conversion. An independent Python `math.comb` implementation matched the JavaScript to more than ten decimal places; five pure test groups were also executed through a V8 harness.

## Exact findings


| Optional source-mulligan bonus draws accepted | Direct Active Frillish + Lab + Boost + Jellicent deck opportunity |
| ---: | ---: |
| 0 | **7.642610%** |
| 1 | **9.587727%** |
| 2 | **11.611322%** |
| 3 | **13.681029%** |
| 5 | **17.847613%** |
| 10 | **27.443036%** |
| 20 | **38.219348%** |

For a four-Basic source, `p=0.3994996257446656` and `E[M]=1.503131256095683`. Weighting **every** finite `m=0..46` outcome by this geometric distribution yields **10.650445960870359%**. The complete unmodeled `M>=47` tail is bounded by **3.891564860354197e-11** in probability (about `0.000000003892` percentage points), so the exact mixed direct-event probability lies within that additive bound under the stated assumptions.

The increment over the no-bonus conditional access event is **3.0078362633 percentage points**. The additional draw channel is endogenous to the **opponent's opening Basic count**, so the same candidate 60's immediate access distribution is matchup-dependent even before the first ordinary turn. At extremely high bonus counts the all-draw policy can exhaust every searchable Jellicent; the probability is therefore **not monotonically increasing indefinitely** (at 46 bonus cards and the ordinary draw, direct access is zero). Taking a smaller permitted bonus number can be strategically preferable; this restricted model deliberately fixes the maximum-draw policy and does not optimize that choice.

## Interpretation and immediate qualification boundary

The increase is **not an observed lock frequency**. Source-first Iron Thorns may have played a Stadium before the candidate's turn, which Silent Lab could replace; the source can later replace Silent Lab using any of its 4, 4 or 5 original Stadium cards or its held Guzma & Hala. Wally offers a separate second-player Stage 1 line, and the existing exact [unbonused Wally/Arven/Guzma & Hala matrix](agent3-jellicent-silent-lab-wally-iron-thorns-counter-20261030.md) is therefore a baseline, **not** a complete source-specific opening estimate. Candidate mulligans and source's optional bonus draw choices are intentionally outside this model.

**Suggested next shared-native policy receipt:** Before candidate action, record only actor-owned actual bonus-draw count, original candidate opening Active identity and current deck-resident Jellicent count in an owner-safe form; distinguish physical bonus cards from the first turn's normal draw. On actual rank6/24/29 source-dealt hands, test legal Stadium + Boost or Stadium + Wally action and subsequent opponent Stadium replacement. Do not upgrade access estimates to tournament wins.

No fixed final 60 nominated; **29/32** authenticated source lists and **zero competitively qualified games** remain the program-wide baseline.
