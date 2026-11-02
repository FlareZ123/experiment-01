# Strict public-Active inference across 29 original 60s and three unrecovered Aichi sources

**Agent 26 | 2 November 2026.** Mathematical opening-source bounds. No prospective game, player policy change, confirmed matchup result or restored missing original deck.

## A general versioned replacement for a deliberately loose bound

The earlier [public-Active interval estimator](../../scripts/agent26-public-active-robust-source-intervals.cjs) correctly models owner Active selection as an interval (a named Basic **must** be Active when it is the only Basic in a legal seven; it **may** be Active whenever it is present). However, its missing-source upper bound assumes every revealed non-Basic can appear four times independently in each observed invalid seven, and a newly visible ordinary Basic Active can appear four times. For exceptional deck-building rules, this permissive bound can be sharpened.

[Version 2 estimator](../../scripts/agent26-public-active-robust-source-intervals-v2.cjs) deliberately leaves all **29 authenticated original source likelihoods unchanged**. It replaces the three unknown-source upper likelihoods with a [single common-60 exact integer optimization](../../scripts/agent26-prism-joint-mulligan-envelope.cjs) that enforces Prism Star name uniqueness, whole-deck ACE SPEC uniqueness, legal valid seven and shared 60-slot capacity. The maximum named-Active copies is **four by default**, or a smaller **independently justified** upper cap such as one for a Radiant Pokémon. The older API/source and past outputs remain intact for reproducibility.

For every known source i, its previous source-event **lower** and **upper** bounds \(L_i\) and \(U_i\) are retained, then its new robust posterior minimum is

\[
\mathrm{lower}(i)=
\frac{L_i}{L_i+\sum_{j\neq i}U_j+3U_{\rm missing,new}}.
\]

A missing list's actual conditional likelihood is never inferred from a proxy list. The mathematically missing-source maximum includes adversarial Active selection and a hypothetical legal 60 chosen to make the public observation as likely as possible. This method is an **interval guarantee** under an equal prior over the actual 32 ranked positions. It is not a statistical estimator for a random tournament opponent or a calibrated player behavior model.

## Independently useful Radiant Eternatus example

The supplied original-printed 29-source manifest contains **Radiant Eternatus in precisely the rank-1 Shadow Rider champion's deck**, one copy, amid its 14 starting-eligible Basic Pokémon. The [Advanced Player's Rulebook, section D-18](../../resources/advanced-players-rulebook.md) states the **Radiant Pokémon Rule** permits only one Radiant Pokémon in a deck. Therefore a missing hypothetical source has at most one Radiant Eternatus. Consider only the following public information: a face-up **Radiant Eternatus Active**, with **no publicly shown failed sevens**.

For rank 1, the forced-Active lower event probability is

\[
L_1=\frac{\binom{47}{7}-\binom{46}{7}}{\binom{60}{7}}
 = 0.02425336915.
\]

There are no other matching cards in the 28 remaining known original sixties. The old missing-source upper gives four copies and thus \(1-\binom{56}{7}/\binom{60}{7}=0.39949962574\) per missing deck. The stricter Radiant copy limit gives \(7/60=0.11666666667\) per missing deck.

| Worst-case full-32 source-rank-1 lower | Value |
| --- | ---: |
| Earlier generic bound | **1.9835064%** |
| Correct one-Radiant cap | **6.4804678%** |

This is a new **hypothetical opening-state** mathematical consequence of the actual 29 registered cards and the card-specific Radiant rule. It is **not** a real native Radiant opening witnessed in a game. Source rank remains hidden, human choices among other Basics are unknown, and each missing rank 23/25/28 may adversarially play a Radiant Eternatus in the math. Conditional on just the known 29 lists, the named Active uniquely identifies rank 1; that conditional fact does not provide a full-field probability without the three missing original sixties.

## Genuine six-rank-6 native setup conservation

The same generic v2 estimator reproduces the earlier [six original native public rank-6 setup results](agent26-prism-joint-mulligan-openworld-bound-20261102.md) without altering any original source data. The two revealed Prism Star invalid hands sharpen rank 6 minimum from **1/257 to 1/65**, and **1/1537 to 1/385**, respectively; all four other native public setups preserve the earlier bounds. Known original source likelihood components are byte-for-byte unchanged. This establishes that the generic version agrees with the specialized calculation.

[Four new pure tests](../../tests/agent26-public-active-robust-source-intervals-v2.test.cjs) check the six receipts, Radiant rank-1 math, impossible two-ACE-spec revealed hands and monotonic improvement over the legacy missing-source upper. The tests were integrated into an existing manually dispatched statistical workflow, retaining the unrelated source-integrity failure gate.

## Scope

A new hypothetical source Active may need a different card-specific cap; check actual printing rules before supplying one. A special first-game setup Ability can break conventional Basic-only Active selection and would require an independent model. Named failed sevens must be genuine publicly revealed Basic-free initial hands from repeated reshuffles. No use of concealed Prizes, deck order or unseen opponent hand is justified. The computed double-precision ratios are rounded displays of exact combinatorial numerators.

**Qualification:** No full-game evidence, no empirical win rate and no recommended fixed 60. Shared benchmark status stays at 29/32 authenticated opponents, zero competitively qualified games and no validated 99.5% field result.
