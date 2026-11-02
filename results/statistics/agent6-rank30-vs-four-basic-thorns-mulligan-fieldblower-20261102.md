# Original rank-30 Field Blower access under four-Basic Iron Thorns mulligans

**Agent 6 | 2 November 2026 | Exact combinatorial opening model, independently checked numerically | No game win-rate inference**

## Research question

The mechanically staged [rank-30 Latias / Float Stone versus active Tool Jammer counterfactual](../aichi-2026/agent6-tool-jammer-held-vs-played-rank30-float-native-eight-20261102.md) demonstrated that a genuine Tool Jammer action can stop a particular native attack line. A follow-up attempt to model original rank-30 **Field Blower** removal was [registered](../aichi-2026/registrations/agent6-rank30-fieldblower-paid-counterline-four-20261102.json) but **its CI dispatch was blocked**, so its predicted native payoff is not verified. The next separate question is what opening probability the original printed deck assigns to holding a Field Blower, when facing an opponent that often has to mulligan.

The authenticated [original printed Top-32 sixties](../aichi-2026/full-decklists.json) contain:

| Original opponent rank | Basic Pokémon | Tool Jammer BST136 | Rank-30 Field Blower GRI125 |
| --- | ---: | ---: | ---: |
| 30, Lillie's Clefairy | 16 | 0 | **3** |
| 6, Iron Thorns | 4 | **1** | 0 |
| 24, Iron Thorns | 4 | **1** | 0 |
| 29, Iron Thorns | 4 | **1** | 0 |

Other exactly checked rank-30 printings: one Latias ex SSP76, one Float Stone BKT137 and three Lillie's Clefairy ex JTG56. All 16 Pokémon in the rank-30 list are Basic. The three opposing Iron Thorns lists each have four Iron Thorns ex TWM77 and no other Pokémon. This structure means frequent **opponent mulligans can grant optional extra rank-30 opening cards**, changing the direct response availability.

## Exact simultaneous-mulligan model

The [advanced rules](../../resources/manual/) specify seven-card opening hands, Basic eligibility, simultaneous mulligans and opponent compensation draws after Prize setup. Cards are sampled uniformly from unchanged original 60-card lists. When **both** players' initial seven lack a Basic, both reshuffle and retry, and neither receives a compensation card for that simultaneous failure. At the first decisive attempt, possibilities are: both legal, rank30 legal and Thorns illegal, or rank30 illegal and Thorns legal.

Define the one-attempt legal-hand probabilities using the hypergeometric distribution:

\[
p_R = 1-\frac{\binom{44}{7}}{\binom{60}{7}}
=0.9007771067385328,
\qquad
p_T=1-\frac{\binom{56}{7}}{\binom{60}{7}}
=0.3994996257446656.
\]

The probability that rank30 is legal while Thorns mulligans at the first non-simultaneously-invalid attempt is

\[
q=\frac{p_R(1-p_T)}{1-(1-p_R)(1-p_T)}
=0.5751886778941149.
\]

If this happens, the Thorns player will have one or more failed hands until a Basic appears; the number of compensable failures is geometric with success probability \(p_T\). Otherwise rank30 earns no opponent-mulligan reward in this simplified two-player setup.

The resulting exact/probabilistic statistics are:

| Quantity | Probability / expectation |
| --- | ---: |
| First decisive setup has rank30 legal, Thorns illegal | **57.5188677894%** |
| First decisive setup has both legal | 38.2660313636% |
| First decisive setup has Thorns legal, rank30 illegal | 4.2151008470% |
| Rank30 receives zero compensable opponent mulligans | 42.4811322106% |
| Rank30 receives exactly one | 22.9787661551% |
| Rank30 receives exactly two | 13.7987576761% |
| Expected optional extra cards offered to rank30 | **1.4397727578** |

The expectation assumes the paper setup rules and independent reshuffles, and is an expectation of the **number offered**. A player can rationally take fewer, including zero.

## Direct Field Blower availability after the mandatory first draw

Condition on a legal original rank-30 initial seven. If that seven has no Field Blower, and rank30 opts to take \(n\) compensating opponent-mulligan draws, there are \(n+1\) additional cards including the normal first-turn draw. Prize cards are chosen from the unseen cards before compensation, but exchangeability leaves the marginal for those additional draws uniform over the 53 unseen cards.

Therefore the exact chance of seeing a Field Blower in the hand by the first normal draw is

\[
P(B\mid n,\mathrm{legal}_7)
=1-
\frac{\binom{57}{7}-\binom{41}{7}}
{\binom{60}{7}-\binom{44}{7}}
\frac{\binom{50}{n+1}}{\binom{53}{n+1}}.
\]

The first factor in the subtraction is the chance of no Field Blower in the legal seven, and the second is the chance of no Field Blower among the extra draws when all three remain unseen. Weighting against the full simultaneous-mulligan distribution gives:

<escape>
</escape>
| Rank-30 draw policy | Chance of holding at least one Field Blower by first mandatory draw |
| --- | ---: |
| Decline every compensation card | **34.4006393670%** |
| Take every available compensation card | **39.5380337664%** (lower numerical bound) |
| Gain from taking all available cards | **5.1373943994 percentage points** |

The reported maximum-draw figure sums all opponent bonus counts \(0\le n\le46\). The omitted probability mass \(n\ge47\) is under \(3.728\times10^{-11}\), so the difference between the lower bound and an upper bound is less than that. Such extreme bonus events also run into the finite physical deck and are not asserted to form valid full games.

## Why even the richer access calculation cannot certify the counterline

A separate strict *direct-eight* comparison, under **both decks' first seven containing a Basic and no compensation draws**, finds:

- Original rank30 has **Latias ex, Float Stone, at least one Clefairy ex and at least one Field Blower** simultaneously among its opening seven plus mandatory draw with conditional probability **0.1238542842%**.
- The four-Basic Thorns deck has its singleton **Tool Jammer** among its own first eight with conditional probability **12.1043580925%**.
- If independent original decks are sampled under those two legal-hand conditions, their **coincidence is 0.0149917661%**. This is an exceptionally narrow *direct-coholding event*, not the likelihood of the real Tool Jammer matchup or counterattack.

Actual sources contain search, draws, attachment effects, mulligan compensation, multi-turn setup and sometimes prior turns to accumulate pieces. Conversely, simply holding the direct pieces does not establish legal Energy funding, a valid Item play under locks, a meaningful target, a favorable Prize allocation, paid opponent Jammer access, correct tactical use, or a winning strategy. The original rank30 has three Field Blowers, but whether the owner can select a specific Blower root instead of competing Items or Supporters is a separate policy question. Card access should not be mistaken for execution or success.

The 57.52% chance of receiving a positive mulligan opportunity makes a **no-compensation opening model systematically understate direct Field Blower hand availability** under this exact original four-Basic opponent. The magnitude of this difference depends on how many offered extra cards the actual player chooses to draw, and on further real-game draw/search sequencing.

## Reproducibility and qualification

Implementation: [`scripts/agent6-rank30-mulligan-fieldblower.cjs`](../../scripts/agent6-rank30-mulligan-fieldblower.cjs) (GitHub commit `62c8a8a`), with [pure regression tests](../../tests/agent6-rank30-mulligan-fieldblower.test.cjs) (commit `11b7c0f`). Exact combinatorial formulas were independently evaluated using Python `fractions.Fraction` and checked again with a separate JavaScript BigInt calculation at 12-significant-digit agreement. The repository tests are committed but **have not been executed through GitHub CI** because a separate CI dispatch was blocked; keep that verification status distinct.

The target game objective still has **29/32 authenticated original source sixties, no selected best legal 60, zero competitively qualified games and no supported 99.5% field win rate**. This note is a source-specific direct-access calculation and a potential improvement to opening hand models, without an inference about the ultimate winner.
