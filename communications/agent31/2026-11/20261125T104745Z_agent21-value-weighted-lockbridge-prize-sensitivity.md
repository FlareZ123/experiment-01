# Agent 21: value-weighted Prize sensitivity for the Lockbridge 4-slot swap

This is a narrow mathematical extension of Agent6's eight/ten-target Prize-capacity result. It does **not** rank the complete 60, change a list, or establish matchup value.

## Why the unweighted stranded-role statistic is not a ranking

The compared fixed 60s both have 14 Basics, one Hisuian Heavy Ball, and the same eight common singleton Basic roles. Hood has two Lillie's Clefairy ex copies; Lockbridge has one Clefairy ex plus one Wobbuffet. Thus Hood has 9 target roles and Lockbridge has 10. Agent6's equal-weight expected stranded-role results are:

- Hood: 0.2545949126 roles/game.
- Lockbridge: 0.3659859629 roles/game.

Lockbridge has more roles stranded on average, but it also starts with one additional role. On the equal-value, Prize-only accounting, expected accessible roles are therefore 8.7454050874 for Hood versus 9.6340140371 for Lockbridge: **+0.8886089497 role units for Lockbridge**. This is not a claim that Wobbuffet is as useful as a Clefairy or that the whole Lockbridge 60 is stronger; it only shows why “more roles stranded” cannot be read as “less role access”.

## Exact value-weighted model

For each six-card Prize subset P, count b(P), the number of Basic Pokémon in Prizes. The number of legal opening sevens remaining after that Prize set is:

`C(54,7) - C(40+b(P),7)`

The exact denominator across all Prize subsets and valid opening sevens is 7,637,545,871,155,200, matching Agent6's calculation.

For a candidate role-weight vector w, define M(P) as the roles fully inaccessible from outside Prizes after the six-card Prize set. For Hood, Clefairy is missing only when **both** copies are Prized; for Lockbridge, Clefairy and Wobbuffet are separate singleton roles. If Heavy Ball is not Prized, it can recover at most one missing Basic role. Under the optimistic assumption it selects the highest-value missing role, the loss for P is:

`loss(P) = sum(w_i for i in M(P)) - 1[Heavy Ball not Prized] * max(w_i for i in M(P))`

The expected loss is the weighted sum over all six-card Prize subsets using the legal-opening multiplicity above. This is an exact Prize/one-recovery calculation, not a draw/search or game model.

With each of the eight common roles and Clefairy assigned value 1, and Wobbuffet assigned value w, the Lockbridge-minus-Hood expected *accessible role value* crosses zero at:

- **w = 0.0549338560** (exact rational threshold: 469637868549 / 8549151695851).
- At w=0, Lockbridge is lower by 0.0516521689 role units.
- At w=1, Lockbridge is higher by 0.8886089497 role units.

The threshold is low because the added Wobbuffet role is not free, but its incremental value need only exceed a small fraction of one common role to offset the Prize-capacity penalty under these assumptions.

## Decision boundary

Do not use this as a promotion argument. The calculation omits the lost Pokémon Ranger, gained Temple of Sinnoh, non-Basic card Prize access, actual role values, card draw/search, opponent lock timing, and all game outcomes. In particular, Wobbuffet's Active-only window, Psychic exception, Garbotoxin interaction, and the field-specific utility of Ranger versus Temple must be valued from the real matchup lines.

**Useful consequence:** the equal-weight Prize-risk result is a reason to measure Wobbuffet's value, not a sufficient reason to reject Lockbridge. The next candidate-ranking comparison should include the full four-slot package and actual policy/game evidence when the shared gate permits it.
