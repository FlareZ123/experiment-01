# Original rank-5 Mew/Genesect: exact first-turn VIP target contention with two free Bench spaces

**Agent 9 | 2 November 2026 | independent mathematical opening/Prize calculation | paper Expanded**

## Source-authenticated event and result

In the original authenticated **rank-5 Yamato Nakano Mew/Genesect 60**, the generic owner-only Battle VIP Pass prompt chooser deterministically favors Mew V and Crobat V over Genesect V when all are eligible. Because VIP directly places Crobat V from the *deck*, this cannot trigger Dark Asset's hand-entry condition. Genesect V's Fusion Strike System has no hand-entry trigger. This creates a specific decision-quality question without establishing that Genesect is always the better target. The source-specific printed-text result and pure comparator fixture are in [Agent 9's earlier report](agent9-vip-bench-entry-provenance-20261102.md).

This calculation extends that report's narrower **Mew-only Basic opening** to opening configurations containing other original Basic Pokémon, while simultaneously guaranteeing two free Bench spaces even if every Basic among the initial hand and first draw is played before VIP.

The exact result is **6.292246390603521%** of uniformly shuffled raw seven-card openings plus six Prize cards plus the mandatory first ordinary draw. Conditional on a Basic-valid initial seven, the event is **8.092100655499%**. These are **physical access probabilities**, with no game action, card-effect or win inference.

## Exact event definition

All conditions refer to the unchanged original source 60 and its ordinary initial physical distribution:

1. Opening seven contain at least one **Mew V**, so Mew was available as an Active Basic before the first draw.
2. The eight seen cards (opening seven plus mandatory first draw) contain at least one **Battle VIP Pass**.
3. The same eight seen cards contain **no Genesect V and no Crobat V**, making their potential Bench appearance dependent on later access rather than pre-existing hand presence.
4. Across those eight cards, at most **four total Basic Pokémon** occur. Thus if all are in play, at least two Bench spaces remain (one Basic is Active). No extra Bench placements from effects are assumed.
5. The actual unprized, unheld deck still contains a **Mew V**.
6. It still contains a **Genesect V**.
7. It still contains the singleton **Crobat V**.
8. It still contains a **Mew VMAX** to establish a future evolution route.

The original sixty's categories, in that order, are **4 Mew V, 4 Genesect V, 1 Crobat V, 1 Dedenne-GX, 1 Lillie's Clefairy ex, 3 VIP, 3 Mew VMAX and 43 other cards**. The source manifest's complete Pokémon inventory has no additional Basic identities. The eight-card Basic-count constraint is exhaustive for the original list.

This event does *not* assume VIP will actually be played, that Mew will be selected Active by policy, that Crobat/Genesect will be searched, that opponent effects permit Abilities/Items, or that any future attack occurs. It excludes optional opponent mulligan compensation, other draws, searches, shuffles and pre-VIP board augmentation. It is one sharply defined scenario rather than an estimate of misplays.

## Reproducible exact enumeration

The executable [BigInt calculation](../../scripts/agent9-rank5-vip-prize-bench-window.cjs) enumerates multivariate hypergeometric category counts for the eight seen cards. For each partition, it weights which of the eight physical cards could have been the *first draw*, requiring Mew among the preceding seven. It then counts six-Prize configurations by inclusion-exclusion over the remaining physical target categories, requiring all four target groups to retain a non-Prized card.

The computation's unreduced integer fraction is:

`26220915081395880 / 416717869162795200`

Reduced fraction: `218507625678299 / 3472648909689960`. There are **96 nonzero qualifying eight-card category states**. Draw and Prize positions can be exchanged in the mathematical enumeration **only because** both are uniform without replacement from the same post-opening pool. This does not confer game-state information.

An independent Python integer-binomial implementation reproduced the reduced fraction. A separately seeded 300,000-deal physical random sample counted **19,051 qualifying deals (6.3503333333%)**, with binomial sampling standard error **0.04452 percentage points**. The difference is about 1.3 standard errors and is consistent with the exact calculation.

The [source-locked test suite](../../tests/agent9-rank5-vip-prize-bench-window.test.cjs) checks rank-5 Pokémon and VIP counts, an independently enumerated ten-physical-card toy model, inclusion-exclusion cases and the exact numerator/denominator. Four tests passed in a local mock source tree under Node 22; genuine repository CI verification remains separate.

The initial seven are Basic-valid in exactly **77.75788585041408%** of raw deals for this original 11-Basic sixty. Dividing the unconditional window by this opener-validity probability yields **8.092100655499%**; no mulligan recycling or bonus offers are incorporated.

## Next decision-changing native test

Use the **existing** `simulation/evaluation/agent9-rank5-real-owner-vip-alternatives-readonly.cjs` on original source-native runs. Record actual accepted VIP, owner prompt with both Genesect/Crobat available, whether the generic policy selected Crobat, and whether Mew remained a native-valid companion. Do not interpret generic hand/card reachability as an accepted Store action. In a genuine same-deal native fork, select Genesect as the alternate second target only when the Store permits it; observe subsequent actual Fusion Strike System opportunities and opponent replies. Preserve every error and action cap.

The prior [prospective integrated rank-5 v3.1 experiment](agent13-rank5-v31-corrected-root-native-16arm-20261102.md) demonstrated eight native Cross Fusion Strike declarations under a different policy. Its mixed and censored outcomes cannot be pooled with this access calculation or attributed to switching the VIP target.

**Overall field status:** 29/32 authenticated original opponent sixties; exact ranks 23, 25 and 28 unavailable; zero competitively qualified games; no demonstrated 99.5% fixed-deck result.
