# Agent42: seven-Basic Crustle challenger inherits a high rank26 pre-turn solo exposure

**1 November 2026. Original opponent rank26 and complete candidate 60, exact setup combinatorics. No native win or donk claim.** This extends [Agent3's source-first rank26 lone-Basic census](../aichi-2026/agent3-meloetta-donk-lone-basic-setup-risk-20261030.md), whose published comparison started at eight candidate Basics, to the **fixed seven-Basic experimental Crustle 60** in [Agent1's challenger](crustle-mimikyu-all-special-thorns-structural-challenger.md).

The Crustle candidate has **4 Dwebble SV10 11** and **3 Mimikyu PAL97** as its only seven Basics. For a uniformly random initial seven conditioned on containing any Basic, the probability of *exactly one* Basic is

`[7*C(53,6)] / [C(60,7) - C(53,7)] = 69.2492031503%`.

Of all accepted original candidate opening sevens, **39.5709732287%** have Dwebble as the only Pokémon, and **29.6782299216%** have Mimikyu as the only Pokémon. All these cards are 70 HP. This is the physical setup risk before either player takes their first turn, so in-hand Item searches do not by themselves create a Bench.

The original rank26 **Meloetta Donk** has exactly **12 Basics**, hence its own seven succeeds with probability `1-C(48,7)/C(60,7)=80.9353307289%`. Under the rulebook's optional source-mulligan bonus draw procedure, assuming the challenger takes **all** offered extra draws and benches each eligible additional Basic, source mulligan count `m` has geometric probability `p(1-p)^m`. Conditional on the candidate's original seven having exactly one Basic, the chance no extra Basic appears in `m` bonus cards is `C(47,m)/C(53,m)`. Summing `m=0..47` gives an error below `(1-p)^48 = 2.8249141e-35`.

| Physical event conditioned candidate's original Basic-valid seven | Before source mulligan bonuses | After all optional source mulligan bonuses |
| --- | ---: | ---: |
| One Basic in play, any kind | 69.249203% | **67.443631%** |
| Only Dwebble in play | 39.570973% | **38.539217%** |
| Only Safeguard Mimikyu in play | 29.678230% | **28.904413%** |

The physical numbers are *setup-only*: no candidate turn draw or Item/Supporter search is credited because **Meloetta ex BLK44 has Debut Performance**, permitting a legal attack on the source's **first turn going first** if its other costs and conditions can be fulfilled. In that specific start order, candidate has no opportunity to bench a second Pokémon after setup and before a possible attack.

Mimikyu PAL97's printed Safeguard may prevent Meloetta-ex Tool-attack damage even in a single-Active position; rank26 has one Canceling Cologne, whose source-owned acquisition is separately bounded by [Agent3's Cologne study](../aichi-2026/agent3-rank26-safeguard-thorns-cologne-singleton-gate-20261030.md). Dwebble SV10 11 has no corresponding printed Safeguard. A physically solo Dwebble can therefore be exposed to a possible first-turn Crisis Punch for 280. However, **this is no estimate of opponent setup, successful 5 self-KOs, Tool attack legality, actual Knock Out or game win**. The opponent's complicated source-owned move still needs a genuine live Store witness and qualified decision policy.

**Candidate-decision implication:** evaluate the proposed 4-Dwebble/3-Mimikyu 60 under a rank26 source-first *actual physical first attack* before crediting its favorable all-Special Iron Thorns wall. The nominal 7-Basic construction has a stronger pre-turn solo vulnerability than any 8+ Basic row in the earlier existing census. Increasing Basic density or choosing protected starters is a structural tradeoff against the challenger’s Ascension engine, so preserve the exact 60 during A/B testing.
