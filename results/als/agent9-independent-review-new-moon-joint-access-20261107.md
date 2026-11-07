# Agent 9 independent review: New Moon dual-lock access calculation

**7 November 2026 | Independent exact-count review | No compiled workflow rerun**

## Verdict

The central combinatorics in `scripts/new-moon-lockbreak-joint-access.cjs` are correct. The initial-hand / Prize / post-Prize draw exchangeability is valid, the simultaneous-mulligan distribution is correctly conditioned, the Secret Box Prize-survival subtraction is correct, and the reported fractions reproduce independently. I found no numerical off-by-one in the 47-card cap.

One interpretation clarification should accompany the result:

1. For the `K >= 47` tail, the candidate must decline at least one optional bonus card if the metric requires preserving a first mandatory draw. The code's 47-card observation cap is still the correct maximum-access bound, but "takes every optional bonus card" is imprecise in this tail.
2. A Play! Pokémon Tournament Rules Handbook version last revised 6 October 2023 contains discretionary Judge-Enforced Progression after eight mulligans. The Aichi event's applicable Japanese tournament procedure and whether a Head Judge would invoke it have not been established. Keep the current unbounded calculation as the no-intervention model and report an eight-mulligan sensitivity if that procedure applies.

## 1. Exchangeability and denominator

Let (H) be the accepted seven-card hand, (P) the six Prize cards, (D) the (d) cards drawn from the 47-card post-Prize deck, and (R) the remaining deck. The ordered setup is:

- choose (H) from 60, conditional on at least one of 17 Basics;
- choose (P) from the 53 cards outside (H);
- choose (D) from the 47 cards outside (H \cup P).

The number of unordered physical deals is therefore

[
\left[\binom{60}{7}-\binom{43}{7}\right]
\binom{53}{6}\binom{47}{d}.
]

For a fixed observed set (S=H\cup D) of size (7+d), every seven-card subset of (S) is an equally likely candidate for the original hand. Exactly

[
\binom{7+d}{7}-\binom{7+d-b}{7}
]

of those subsets contain at least one Basic, where (b) is the number of Basics in (S). The six Prizes are then chosen from the complement of (S). This is precisely the weighting used by `validInitialHandSubsets` and `prizeSets`. The fact that the Prize cards are selected before (D) does not invalidate the argument; the fixed-(S) partition counts the same deals.

As a separate check, I independently enumerated four-way assignments of each card category into (H,P,D,R), weighting each assignment by its multinomial count. For (d=1), the valid-deal denominator and both event numerators matched the script's exact fractions.

## 2. Direct and Secret Box events

The candidate composition is 17 Basics, two Field Blower, two Canceling Cologne, one Secret Box, and 38 other cards. For (S=H\cup D):

- Direct access is (FB(S)\geq1) and (Col(S)\geq1).
- Secret Box-assisted access additionally requires Box in (S), one counter in (S), and at least one copy of the other counter in (R).

In the assisted branch, the missing Item has both copies outside (S). If (N=60-|S|), there are (\binom{N}{6}) Prize sets from the complement. Exactly (\binom{N-2}{4}) of those Prize sets contain both copies of the missing Item, leaving no searchable copy in (R). Thus

[
\binom{N}{6}-\binom{N-2}{4}
]

is the correct count of Prize sets that leave at least one copy in the deck. The implementation correctly adds the direct event to the Secret Box upper bound and never asks Secret Box to fetch both Item counters.

Independent first-draw results:

| Event | Exact fraction | Probability |
| --- | ---: | ---: |
| Both Items directly visible | 58,575,077 / 1,103,593,454 | 5.3076680355% |
| Both accessible with Secret Box upper bound | 11,937,071,285 / 121,947,076,667 | 9.7887309900% |

The Secret Box result remains an upper bound because the three-card payment, availability of the other search categories, lock timing, and strategic use are not charged.

## 3. Simultaneous mulligans

Write (p_O=\binom{56}{7}/\binom{60}{7}=58565/97527) for the four-Basic opponent's mulligan probability, and (p_C=\binom{43}{7}/\binom{60}{7}=848003/10163340) for the candidate's.

The supplied setup procedure restarts both players when both opening hands lack a Basic. That round does not create a one-player mulligan-bonus count. Conditional on the first round that is not a simultaneous failure:

- (K=0) when the opponent's hand is valid, whether or not the candidate must continue mulliganing;
- (K=k\geq1) requires an opponent-only failure while the candidate has a valid hand, followed by (k-1) more opponent failures and then an accepted opponent hand.

This gives

[
P(K=0)=\frac{1-p_O}{1-p_Op_C},
\qquad
P(K=k)=\frac{(1-p_O)(1-p_C)p_O^k}{1-p_Op_C},\quad k\geq1,
]

and

[
P(K\geq k)=\frac{(1-p_C)p_O^k}{1-p_Op_C},\quad k\geq1.
]

The distribution sums exactly to one. It reproduces (P(K\geq1)=57.9427943744\%) and (P(K\geq3)=20.8942121813\%). The candidate's own mulligans are correctly excluded from its bonus-card count.

## 4. The 47-card cap and Aichi event rules

After six Prizes, 47 cards remain. To measure access by the first mandatory draw, at most 46 optional bonus cards can be taken before that draw. Therefore (d=47) is the maximum observation window. The code's (K=46\) case (46 bonuses plus the mandatory draw) and (K\geq47\) tail both correctly use (d=47). The exact unbounded-tail mass is only (P(K\geq47)=3.7550\times10^{-11}).

For (K\geq47), however, the candidate must announce fewer than all offered bonuses to retain a first mandatory draw. The report and code comments should say "take up to 46 bonus cards, preserving the first mandatory draw" or equivalent, rather than asserting that every offered bonus is accepted in that tail. This is a wording/assumption clarification, not a meaningful numerical correction.

The Aichi-specific procedure is now sourced. The official [Champions League 2026 Aichi May event announcement](https://www.pokemon-card.com/info/005445.html) identifies the Open League as Expanded and links its floor rules to the Japanese [Competitive Floor Rules ver. 1.2](https://www.pokemon-card.com/assets/document/rules/floor-rule_20260130.pdf), last updated 30 January 2026. Section 6, steps 5–8, explicitly says that simultaneous no-Basic hands restart together; when only one player has no Basic, that player alone repeats the setup; and the opponent may draw up to the number of those repeats. The Japanese rule text contains no eight-mulligan Judge-Enforced Progression (a text search for “8回” has no match). This is the applicable event-specific procedure indicated by the event page, absent a separate organizer override. It supports the unbounded geometric K distribution used above. The eight-mulligan intervention in the separate TPCI Tournament Rules Handbook is a cross-jurisdiction caveat and should **not** be applied to the Aichi estimate. The cap-at-eight sensitivity (7.6528240011% direct / 13.6869407184% Secret Box) may be retained only as an illustration for a ruleset that invokes such progression.

## 5. Reproduction and disposition

The existing tests correctly lock the first-draw exact fractions, all-bonus averages, bonus-tail probabilities, distribution sum, and fixed candidate/opponent counts. A useful extra regression would assert that `jointAccessByDraws(47)` has equal direct and Secret Box probabilities, since no deck cards remain for Secret Box to search.

**Disposition:** accept the mathematical values under the stated no-judge-intervention model. Clarify the (K\geq47) wording and record the eight-mulligan tournament-procedure caveat. No compiled workflow was rerun, as requested. None of this changes the candidate's paper-legality status or supplies a matchup/game-win result.
