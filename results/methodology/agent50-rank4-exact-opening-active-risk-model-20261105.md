# Agent50: exact seven-card Active HP and Prize risk from owner entry-support preservation

**5 November 2026 | exact combinatorics; independent toy ordered-deal enumeration; no new native game.** This quantifies one part of the tradeoff exposed by the [32 matched native rank4 setup pairs](agent50-rank4-physical-active-hp-prize-bench-exposure-20261105.md). It is a model of a single *valid* random seven-card opening, conditional on no mulligan-bonus cards and before any first-turn owner play. It does **not** predict game wins or strategic superiority.

## Verified source categories and paper printing attributes

The original authenticated [Aichi rank4 60-card source](../aichi-2026/full-decklists.json) contains 13 eligible Basic Pokémon. Its six verified in-turn hand-to-Bench printed entry supports are two Dedenne-GX UNB (160 HP, 2-Prize), two Crobat V DAA (180 HP, 2-Prize), one Tapu Lele-GX GRI (170 HP, 2-Prize) and one Eldegoss V RCL (180 HP, 2-Prize). The seven ordinary Basics are two Voltorb ROS (60 HP, 1-Prize), one Pikachu LOR 52 (60 HP, 1-Prize), one Squawkabilly ex PAL (160 HP, 2-Prize), one Gengar & Mimikyu-GX TEU (240 HP, 3-Prize), one Klefki SVI (70 HP, 1-Prize), and one Ditto Prism Star LOT (40 HP, 1-Prize). Exact source card counts, their printed Basic status, relevant in-turn entry Ability text and all HP/Prize-rule categories were cross-checked against the supplied card pool, except that the English card snapshot omitted Pikachu **LOR 52**. That missing printing is independently confirmed as **60 HP, Basic Pokémon** by [Limitless card LOR/52](https://limitlesstcg.com/cards/LOR/52) and [Bulbapedia Lost Origin 52](https://bulbapedia.bulbagarden.net/wiki/Pikachu_(Lost_Origin_52)); do not mislabel the unrelated LOR trainer-gallery printing as the source physical image. The relevant 60 HP and Basic status match.

The probability model keeps all physical copies distinct. Define `T=6` entry-support Basic copies, `R=7` ordinary Basic copies, `B=13` total eligible Basics, `N=60` deck size, `H=7` initial hand size. Compare:

1. **Greedy first-eligible:** the native historical generic setup chooser chooses every eligible Basic (up to six), with the *first* eligible in hand order becoming the Active.
2. **Entry-priority single-Active:** the optional owner-safe diagnostic chooses the *first ordinary Basic* if one is present; otherwise the first entry-support Basic; it leaves every other Basic in hand and initially has no Bench.

A protected **multi-Basic** opener is a *third policy* and is not modeled by the one-Active formula.

## Exact conditional calculation

A hand is valid if it contains at least one Basic: `V = C(60,7) − C(47,7) = 323315421` unordered hands. The source-positive opening event has `t≥1` entry-support Basics and `r≥1` ordinary Basics in that same hand, with `t+r≤6` so the historical six-selection cap consumes every qualifying Basic; hands of seven Basics are conservatively excluded. Its exact physical count:

`P = Σ_{t=1..6} Σ_{r=1..7, t+r≤6} C(6,t) C(7,r) C(47,7−t−r) = 117853064`.

Hence `Pr(positive | valid seven) = P/V = 0.3645142060823631`, the independently earlier derived **36.4514206082%**. For any such physical hand, conditional on t and r, the first eligible Basic in the random ordered seven is an entry support with probability `t/(t+r)`. Therefore the exact probability its initial **greedy Active** consumes an entry support, *given the positive event*, is:

`q = [Σ_{t,r} C(6,t)C(7,r)C(47,7−t−r) × t/(t+r)] / P = 0.49188478459923624`.

**Safe ordinary starting Bench subevent:** A *different* protected multi-Basic opener can preserve an ordinary initial Bench only if the positive opening contains at least two ordinary Basics (`r≥2`). The exact subcount under the same conservative six-Basic cap is `Σ_{t≥1,r≥2,t+r≤6} C(6,t)C(7,r)C(47,7−t−r) = 32313722`. This equals **9.9944883235% of valid sevens** or **27.4186524332% of positive hands**. The complementary **85539342 positive openings**, **72.5813475668% of positive hands**, have exactly one ordinary Basic; placing only ordinary Basics at setup leaves a *solo Active*, despite preserving the entry support option. The 32 native fixed-seed sample had two of eleven positives with ≥2 ordinary Basics, consistent with an observed but unrepresentative 18.18% subgroup rate. This is a physical setup frontier, not an observed first-turn KO event.

Every entry-priority positive hand instead chooses an ordinary Active. Symmetry of equally randomized physical cards implies the expected HP and Prize liabilities within each group are the copy-weighted values:

| Conditional physical Basic class | Mean Active HP | Mean Prize cards upon Active KO |
| --- | ---: | ---: |
| Entry support (T=6) | 171.666666667 | 2 |
| Ordinary Basic (R=7) | 98.571428571 | 1.428571429 |
| **Greedy first-eligible, given positive** | **134.525864017** | **1.709648448** |
| **Entry-priority, given positive** | **98.571428571** | **1.428571429** |
| **Priority minus greedy** | **−35.954435446 HP** | **−0.281077020 Prize liability** |

These are **averages of the initial Active card's printed attributes** across uniformly distributed valid openings conditional on the specified positive event, not damage calculations, KO probabilities, draw expectations, or a game-value scalar. The observed 32 matched native sample's positive Active identity movements ([separate receipt-level census](agent50-rank4-physical-active-hp-prize-bench-exposure-20261105.md)) are *particular frozen seeds*, not the above exact distribution. Higher HP is not automatically preferable, and fewer Active Prize cards on KO can be strategically offset by losing support access, immediate attacking options, or having no Bench.

## Independent tiny-deck oracle

As an independent verification of the formula and of the first eligible versus first ordinary permutation logic, enumerate all **336** ordered three-card hands without replacement from a toy eight-card deck: `T={160HP,180HP}`, `R={60HP,60HP,240HP}`, three non-Basics. The number of valid ordered hands is **330**; the positive event `t≥1,r≥1,t+r≤3` occurs in **162**. Direct brute-force traversal of the 162 ordered positive hands yields:

- `Pr(positive | valid) = 162/330 = 0.4909090909090909`, exactly equal to the combinatorial result.
- `Pr(greedy first Basic protected | positive) = 0.48148148148148145`, equal to the weighted `t/(t+r)` combination result.
- Greedy mean positive Active HP = `144.07407407407408`; entry-priority mean = `120` HP. Both match group-weighted analytic formulas.

The toy oracle directly iterated **ordered hands** instead of calling the hypergeometric formula to decide the choices, so it checks the main assumption rather than only reusing the same calculation.

## Decision implications and limitations

The matched native rank4 32-hand comparison found that all **11/11** positive greedy source starts had one or more initial Benched Pokémon, while the one-Active preservation variant had zero. That Bench reduction is a mechanical policy feature and makes the conditional vulnerability to losing the only in-play Pokémon relevant, although no actual opponent first-turn KO was observed. The exact population-weighted **−35.95HP** for the Active in the positive cohort complements that particular-case Bench evidence: making entry preservation unconditional can sacrifice initial Active durability as well as board redundancy.

A follow-up optimizer needs a **state-contingent initial Active and Bench decision**, balancing the entry-support option against printed HP, current Prize map, opponent early-attacking capability, the owner's actual ability to bench in turn, and the post-entry value of the retained Ability. An optional multi-Basic protected opener can alleviate some initial Bench cost if ordinary Basics are available; it does not eliminate the tradeoff when the opening has exactly one ordinary Basic. This report supplies a reproducible mathematical prior, without claiming an optimized choice, certified opponent response, actual 25-minute game, or validated 99.5% result.

**Benchmark state:** only 29/32 original name/count sixties authenticated, ranks23/25/28 absent; no selected competitive 60, no qualified games.
