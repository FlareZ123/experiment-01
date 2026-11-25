# Agent 21: value-weighted Prize sensitivity for the Lockbridge four-slot package

**25 November 2026.** Exact combinatorial sensitivity analysis; not a game result, win-rate estimate, or candidate promotion.

## Decision this can inform

**Fixed-60 candidate ranking.** The existing equal-weight Prize-capacity result is a valid warning about Heavy Ball contention, but it is not by itself a reason to reject Lockbridge. This extension makes the role-value assumption explicit and identifies the break-even value required from the added Wobbuffet role. It does not rank the full 60.

## Fixed deck facts

The Hood and Lockbridge lists compared in Agent6's Prize-capacity report have:

- 14 Basic Pokémon and one Hisuian Heavy Ball each;
- the same eight common singleton Basic roles;
- Hood: two Lillie's Clefairy ex copies (one Clefairy role);
- Lockbridge: one Clefairy ex and one Wobbuffet (two distinct roles).

Therefore Hood has nine target roles and Lockbridge ten. Both have ten target Basic cards in total; the difference is the grouping of those cards into roles.

Agent6's equal-value enumeration gives expected stranded roles of 0.2545949126 for Hood and 0.3659859629 for Lockbridge. Subtracting these from the respective role counts gives expected accessible role counts of:

| List | Total roles | Expected stranded roles | Expected accessible roles |
|---|---:|---:|---:|
| Hood | 9 | 0.2545949126 | 8.7454050874 |
| Lockbridge | 10 | 0.3659859629 | 9.6340140371 |

Thus, under equal role values, Lockbridge has **+0.8886089497 accessible role units** on the Prize-only measure despite having more roles stranded. The stranded-role statistic cannot be interpreted as total accessible role value without accounting for the additional Wobbuffet role.

## Exact weighted calculation

For every six-card Prize subset P, let b(P) be the number of Basic Pokémon in Prizes. The remaining 54-card deck has 14-b(P) Basic Pokémon, so the number of legal opening sevens is:

`C(54,7) - C(40+b(P),7)`.

Summed across all six-card Prize subsets, the exact number of legal-opening/Prize-set pairs is **7,637,545,871,155,200**, matching Agent6's result.

The enumeration can be reproduced without iterating all 60-choose-6 subsets by treating the ten target Basic cards and Heavy Ball as relevant identities. For each mask over those eleven identities, enumerate x Prized cards among the four other Basics and y among the 45 other non-Basics, where x+y plus the mask's Prized identities equals six. Multiply each case by `C(4,x) × C(45,y)` and by the legal-opening multiplicity above.

For role-value weights w_i, let M(P) be the roles completely inaccessible from outside Prizes after P:

- Hood's Clefairy role is missing only if both Clefairy copies are Prized.
- Lockbridge's Clefairy and Wobbuffet roles are separate singletons.
- Each of the eight common roles is missing when its singleton Basic is Prized.

Assume the one Heavy Ball can be used whenever it is not Prized and optimally retrieves the highest-value missing role. The Prize loss for P is:

`loss(P) = Σ(w_i for i in M(P)) - 1[Heavy Ball not Prized] × max(w_i for i in M(P))`.

If no roles are missing, the maximum term is zero. Expected loss is the sum of these losses weighted by the legal-opening multiplicities and divided by the exact denominator. Expected accessible role value is total role value minus expected loss.

## Break-even sensitivity

Assign each of the eight common roles and the Clefairy role value 1. Let Wobbuffet's incremental role value be w. The Lockbridge-minus-Hood expected accessible-role difference is:

`Δ(w) = w - (L_Lockbridge(w) - L_Hood)`.

The break-even is:

\\(w^*=0.0549338560\\)

The exact rational value is 469637868549/8549151695851.

| Wobbuffet role value w | Lockbridge minus Hood expected accessible role value |
|---:|---:|
| 0 | -0.0516521689 |
| 0.0549338560 | 0 |
| 0.25 | +0.1834131107 |
| 0.50 | +0.4184783903 |
| 1.00 | +0.8886089497 |

Under these assumptions, Wobbuffet's incremental value need only exceed about **5.5% of one common role** to offset the Prize-only access penalty. This threshold is a property of the assumed role weights and optimal Heavy Ball allocation, not an estimate of Wobbuffet's actual competitive value.

## Interpretation and limits

The result changes how the Prize-capacity evidence should be used:

1. The 29.3% versus 21.4% “at least one role stranded” comparison is a recovery-contention warning, not a candidate-strength ranking.
2. Lockbridge has an additional role; the equal-weight count already gives it more expected accessible role units despite more stranded roles.
3. The full four-slot package still has unresolved value trade-offs: one fewer Clefairy copy, loss of Pokémon Ranger, addition of Wobbuffet, and addition of Temple of Sinnoh.
4. The optimal Heavy Ball policy is optimistic. It assumes Heavy Ball is actually drawn/searchable in time and selects the best missing role; it does not model item lock, draw/search, opponent turn timing, or policy errors.
5. This calculation excludes non-Basic Prize access, actual role values, matchup outcomes, and the effect of Temple/Ranger on the full 29/32 field. It does not justify changing either fixed 60 or promoting Lockbridge.

**Decision boundary:** do not reject Lockbridge solely from the higher unweighted stranded-role rate. Conversely, do not promote it from the extra role count or this sensitivity threshold. A valid ranking still requires a full-package role valuation and comparable game evidence under a competent frozen policy when the shared gate permits it.

## Related evidence

- [Agent6: Copycat/Prize access and Heavy Ball capacity](agent6-copycat-prize-access-20261125.md)
- [Agent31: Lockbridge Prize access audit](agent31-lockbridge-prize-access-20261125.md)
- [Agent21: Lockbridge scope and policy admission](agent21-lockbridge-scope-and-policy-admission-20261125.md)
- [Agent21 communication to Agent31](../../../communications/agent31/2026-11/20261125T104745Z_agent21-value-weighted-lockbridge-prize-sensitivity.md)
- [Agent21 communication to Agent6](../../../communications/agent6/2026-11/20261125T105239Z_agent21-value-weighted-lockbridge-prize-sensitivity.md)
