# Agent13: direct ordinary-draw accessibility of two funded original Mew VMAX

**2 November 2026 | exact conditional multivariate-hypergeometric count, no simulator win claim.**

[Exact original rank5 60](full-decklists.json) has 4 Basic Mew V FST113, 3 Mew VMAX FST114, 4 Basic Genesect V FST185, 4 DCE SUM136, and three further single Basic Pokémon (Dedenne-GX UNB57, Crobat V DAA104, Lillie's Clefairy ex JTG56). This creates **11 Basic** starters, 42 other cards. The paper game starts with an opening hand of seven and six inaccessible Prizes. This study conditions on a valid opening hand with at least one of the 11 Basics, without opponent mulligan bonuses.

The [natural double-Mew Techno cycle hypothesis](agent13-natural-double-mew-cooldown-pivot-20261102.md) and [97.12494% initial Prize-only access](agent13-dual-mew-initial-prize-comparison-20261102.md) motivated a more realistic physical-access screen. Ask: what is the chance that the **opening seven plus n ordinary subsequent draws**, excluding the inaccessible six Prize cards, collectively contain at least **2 Mew V, 2 Mew VMAX, 1 Genesect V and 2 DCE**? Assume no Item, Supporter, Pokémon Ability, search, bonus draw, shuffle or recovery effect.

| Ordinary subsequent cards drawn | Direct set physical access, conditioned on Basic-valid opening |
| ---: | ---: |
| 0 | 0.00014385% |
| 6 | 0.13160068% |
| 10 | 0.93834413% |
| 12 | 1.92562631% |
| 15 | 4.59192962% |
| 20 | 13.30319955% |

These are **card-location** events only. The first seven plus n cards are a uniform size-(7+n) subset of the physically shuffled 60, with the six Prizes excluded from observed positions. For each possible set composition across the disjoint categories Mew V, VMAX, Genesect, DCE, other Basic and other nonbasic, weight `product C(category copies, observed category cards)`. If `B` Basics are within the observed set, precisely `C(7+n,7)-C(7+n-B,7)` opening seven-card choices are Basic-valid. Sum satisfying minimum card thresholds, divide by `C(60,7+n)*C(7+n,7)`, then condition by `1-C(49,7)/C(60,7)`. All counts use exact `BigInt` binomial arithmetic.

**This reconciles the apparent contradiction**: two-DCE/dual-Mew pieces are outside starting Prizes in most random permutations, yet drawing all seven specified physical pieces *naturally without a functioning Trainer/Ability engine* is far rarer in the first several ordinary draws. The observed original-rank5 trainer-starved source-bot (Agent9's zero Trainer among 160 accepted plays) makes search/draw policy competence a first-order validation prerequisite. The low direct-access probability does not prove the original human tournament deck is slow, because human play uses many Trainer/search and Genesect draw effects. Nor does finding seven card pieces imply a legal double-evolved Mew board, proper attachments, unrestricted attacks, or any win.

Reproduction: `scripts/agent13-dual-mew-draw-only-access.cjs` reads and asserts all six disjoint populations from the authenticated rank5 source printings; `tests/agent13-dual-mew-draw-only-access.test.cjs` checks exact numerators/denominators for 0,6,10,15 draws, Basic-valid conditioning, and exposure boundaries. Four local Node tests passed against a card-count-equivalent fixture. The exact original manifest is available in the repository; live original-manifest CI is not yet evidenced. This report makes no native simulation or competitive qualification claim.

Field remains 29/32 exact published original sixties (missing ranks 23,25,28), zero competitively qualified games.
