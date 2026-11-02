# Temple and original Raichu answer Prizes: exact Basic-valid opening probabilities

**Agent 17 | 2 November 2026 | exact finite combinatorics using the original 60s. No native game, search-policy or win-rate claim.**

## Question and quantitative result

A five-original [Temple of Sinnoh attack-funding gate](agent17-temple-five-lightning-originals-20261102.md) matters only if the candidate can obtain Temple and the source cannot readily remove or replace it. The [original Raichu counterline](agent17-raichu-temple-wobbuffet-counterline-20261102.md) shows both rank4/rank17 Raichu originals have Escape Rope and Stadium answers, with rank17 also carrying Psychic Marshadow's Resetting Hole.

For reproducibility, count **physical six-Prize sets after a valid seven-card Basic Pokémon opener** rather than assuming every six-card subset of an unconditional deck shuffle is equally likely after mulligans. The unchanged Temple v1 candidate has **15 printed Basic Pokémon**; both original Raichu 60s have **13**. Those counts were checked against the source inventories and exact English Pokémon printed subtypes in the supplied archive.

| Conditioned on a valid opening seven | Exact probability | Percent |
| --- | --- | ---: |
| **Temple v1:** both of its two Temple ASR155 in six Prizes | `10324999/1204256460` | **0.857375430%** |
| **Rank4:** all three Sky Field ROS89 in six Prizes | `15808760/26482472211` | **0.059695182%** |
| **Rank17:** both PokéStop PGO68 and **Basic** Marshadow UNB81 in six Prizes | `56170320/6750434093` | **0.832099377%** |
| **Rank4:** at least one Sky Field **and** at least one Escape Rope BST125 outside Prizes | `28514021951585/28548105043458` | **99.880611719%** |
| **Rank17:** at least one of PokéStop/Marshadow **and** at least one Escape Rope BST125 outside Prizes | `919540248595051/927813413912385` | **99.108315832%** |

The last two rows describe **card locations only**. Cards outside Prizes might still require search, an eligible Bench target, a legal Stage1 evolution, source Energy in discard, source Prize deficit, an Ability that is actually available, a Stadium play clock and a capable play decision. They give a **necessary physical accessibility bound** for the proposed source counter-ALS, not its actual playable frequency. The events do not require source draw/shuffle randomness after the original Prize deal.

## Exact derivation and the Basic-Marshadow correction

Let a 60-card deck have `B` physical Basic Pokémon, let `k` particular physical target cards contain `b` Basics, and condition on the accepted initial seven containing at least one Basic. A hand avoiding all targets and still containing a Basic can be chosen in

\[
\binom{60-k}{7}-\binom{60-B-k+b}{7}
\]

ways from the accepted-hand denominator

\[
\binom{60}{7}-\binom{60-B}{7}.
\]

After that hand, the exact probability that the six Prize cards contain **all** `k` specified cards is

\[
\frac{\binom{53-k}{6-k}}{\binom{53}{6}}.
\]

Multiplying yields:

\[
P(\text{all }k\text{ Prized}\mid\text{valid initial Basic})
=
\frac{\binom{60-k}{7}-\binom{60-B-k+b}{7}}
{\binom{60}{7}-\binom{60-B}{7}}
\frac{\binom{53-k}{6-k}}{\binom{53}{6}}.
\]

For rank17's combined Temple removal answers, **Marshadow is itself a Basic**, so the correct inputs are `B=13, k=2, b=1`, unlike two Trainer cards `b=0`. Rank4's three Sky Field and three Escape Rope are six distinct Trainer cards `b=0`.

For two required disjoint resource groups A and R, the chance that **at least one card from each group is outside Prizes** follows inclusion-exclusion:

\[
1-P(A\subseteq\mathrm{Prize})-P(R\subseteq\mathrm{Prize})
+P(A\cup R\subseteq\mathrm{Prize}).
\]

The original rank17 group A consists of one Basic Marshadow and one PokéStop; R consists of three Escape Rope. The original rank4 group A consists of three Sky Field; R consists of three Escape Rope.

**Why this conditioning matters:** the often-quoted raw shuffled-deck probability for two particular cards to both occupy the six Prize cards is `1/118 = 0.847457627%`. Temple v1's actual **Basic-valid** opening condition changes its two Temple probability to **0.857375430%**. Rank17's target includes a Basic Marshadow, producing the opposite directional shift to **0.832099377%**. Those differences are small and real, and a source-locked model should preserve them.

## Implications for the 99.5% research objective

- If a particular strategy absolutely requires Temple **before taking any Prize** and has no alternative retrieval or win axis, its two Temple cards are both Prized in about **0.857% of valid candidate openings**. That is a **strategy-specific failure configuration**, not an established lost game. The actual field objective is across all 32 originals and must weigh different opponents and alternate win plans; this rate cannot be blindly subtracted from aggregate performance.
- The two Raichu sources can very often keep **both required categories** of counterplay cards physically outside their Prizes, but the corresponding actions remain blocked by realistic access and board constraints. A candidate-v1 evaluation that assumes its Temple/Wobbuffet lock is permanent because the source bot misses a Stadium or Escape Rope play has a serious policy-realism defect.
- The conditional finite calculation only describes setup Prize locations. Prize retrieval through taking Prizes, subsequent deck/hand draw, mulligan bonus cards, search paths and the original opponent's strategic response are deliberately **not** converted to game win estimates.

## Executable proof and scope limits

[Source script](../../scripts/agent17_raichu_temple_prize_windows.py) resolves the actual original printed Pokémon cards through `resources/sets/en.json` and `resources/cards/en/`, checks both source deck 60s and the unchanged Temple candidate, counts real Basics, and computes exact `Fraction` numerators and denominators using Python's `math.comb`. It emits machine-readable JSON with both fractions and percentages.

[Six independent tests](../../tests/test_agent17_raichu_temple_prize_windows.py) include exhaustive physical mini-deck hand/Prize enumeration as a reference, the exact 15/13/13 Basic counts, five frozen rational outcomes and a fail-closed invalid-target test. The existing [manual benchmark workflow at run **41400757123**](https://github.com/FlareZ123/experiment-01/actions/runs/41400757123), head `513eb7c9da868a591be4528d6c21262e5d9ed8ae`, **completed successfully** including the dedicated Python Prize step and the earlier 13 Node paper/source tests. This test run contains **zero native Store game completions** and does not qualify a game or candidate.

**Field status remains 29/32 authenticated exact opposing 60s, 0 competitively qualified games, and no demonstrated 99.5% game win rate.**
