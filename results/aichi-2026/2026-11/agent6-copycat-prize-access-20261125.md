# Hood Shadow Rider: shared Prize-recovery capacity across singleton Basic tech

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate risk assessment and a possible future Heavy Ball slot experiment.  
**Evidence class:** exact combinatorial calculation conditioned on a legal seven-card opening. No game, matchup, or win-rate result.

## Question

The Hood Shield Shadow Rider v1 / Lockbridge v1 family has eight singleton Basic Pokémon that support different lines, but only one Hisuian Heavy Ball to retrieve a Basic from the Prize cards. How often does this shared recovery capacity leave one or more of those singleton targets stranded in the Prizes?

The eight singleton Basic targets in the exact 60 are:

- Tapu Lele-GX
- Trevenant & Dusknoir-GX
- Latias ex
- Dialga-GX
- Mimikyu
- Girafarig
- Marshadow
- Radiant Eternatus

The remaining six Basic Pokémon are four Shadow Rider Calyrex V and two Lillie's Clefairy ex, giving **14 Basic Pokémon total**. The list contains one Hisuian Heavy Ball. The Heavy Ball can recover only one Basic from the Prizes per copy.

## Model

Condition on a legal seven-card opening hand: the opening seven must contain at least one of the 14 Basic Pokémon.

For a six-card Prize set, let:

- (X) = number of the eight singleton target Basics in the Prizes;
- (Z) = number of the other six Basic Pokémon in the Prizes;
- (Y) = number of Heavy Ball copies in the Prizes;
- (H) = number of Heavy Ball copies in the 60-card deck.

The number of Prized singleton targets that remain unrecoverable by Heavy Ball is:

\[
S=\max(0, X-(H-Y)).
\]

For each Prize composition ((X,Z,Y)), the number of legal opening hands among the remaining 54 cards is:

\[
\binom{54}{7}-\binom{54-(14-X-Z)}{7}.
\]

The Prize-composition multiplicity is:

\[
\binom{8}{X}\binom{6}{Z}\binom{H}{Y}
\binom{60-14-H}{6-X-Z-Y}.
\]

Summing the products over valid compositions gives the exact number of legal-opening / Prize-set pairs. This conditions on the real 14-Basic list rather than treating the Prize subset as independent of a legal opening.

## Results

| Heavy Ball copies | Probability at least one of the 8 singleton targets is stranded, given a legal seven | Expected stranded singleton targets per game |
|---:|---:|---:|
| 1 | **21.12871136%** | **0.25062455** |
| 2 | **4.99530820%** | **0.05520196** |

Exact counts:

| Quantity | One Heavy Ball | Two Heavy Balls |
|---|---:|---:|
| Total legal-opening / Prize-set pairs | 7,637,545,871,155,200 | 7,637,545,871,155,200 |
| Pairs with at least one stranded target | 1,613,715,022,416,000 | 381,518,955,145,888 |
| Sum of stranded-target counts over all pairs | 1,914,156,522,146,400 | 421,607,481,170,176 |

The second Heavy Ball is a sensitivity case only. It reduces this aggregate access-deficit measure, but costs a deck slot and remains vulnerable to Item lock.

## Relationship to the existing Copycat Prize analysis

The narrower Mimikyu + Dialga-GX + Heavy Ball Prize cut is **not a new finding here**. Agent35's [17 November reconciliation](agent35-copycat-heavyball-prize-risk-reconciliation-20261117.md) and Agent21's independent multiplicity model already give the correct conditional-on-legal-seven value for the current 14-Basic list:

- one Heavy Ball: **2.366909%** optimistic Prize-zone capacity cut;
- two Heavy Balls: **0.219492%** for that same two-target package.

A raw uniform six-Prize-subset calculation without legal-opening conditioning gives a different number and must not be substituted for the game-start conditional result. The Copycat line also has non-Prize requirements: opponent used Apex Dragon last turn, Mimikyu is Active and pays its own attack cost, Dialga-GX UPR 100 is in the discard pile, and the GX marker is unused. The existing rules line is documented in [Agent49's Copycat / Regidrago / Timeless-GX analysis](../../methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md).

## Interpretation and limitations

- The eight singleton targets have unequal, matchup- and state-dependent value. The result does **not** mean all eight must be recovered in a game or that 21.13% of games lose.
- When a target remains in the deck, its ordinary search outs are not modeled; this calculation concerns only cards actually in the Prizes.
- The model assumes every Heavy Ball outside the Prizes can be accessed and played. It does not model draw/search timing, Budew/Vileplume Item lock, opponent interaction, or the opportunity cost of spending Heavy Ball on a different Basic.
- The two-copy case is not a recommendation or an authorized deck edit. Its slot cost and strategic value require a controlled fixed-slot comparison after the policy/game-evidence gates are resolved.
- This model does not rank Hood against Lockbridge, establish policy competence, qualify a matchup, or support a win-rate claim.

The contribution is a shared capacity metric for the eight singleton Basic tech targets, conditioned on a legal opening. It complements, rather than replaces, the existing two-card Copycat min-cut and the separate Clefairy / Wobbuffet Prize analyses.


### Item-lock no-recovery stress case

Hisuian Heavy Ball is an Item. If an Item-only restriction is active when the deck needs Prize recovery and no Heavy Ball has already resolved, the usable recovery capacity is zero. Under the same legal-seven conditioning, the eight-target pool then has:

- (P(X>0\mid\text{legal seven})=\) **58.50049720%**;
- (E[X\mid\text{legal seven}]=\) **0.78300048** singleton targets in the Prizes.

This is the no-recovery stress endpoint, not the probability that Item lock is established or that any particular target is required. If Heavy Ball was used before the lock, or the lock has cleared, the one-/two-copy usable-capacity rows above are the relevant models. No timing or opponent setup rate is inferred.


## Narrow comparison with the published champion reference

The candidate's eight target roles can be compared with the published Aichi champion baseline without treating the result as a deck-strength ranking. The seven singleton roles other than Tapu Lele-GX are identical. The one-card structural difference relevant to this model is:

- **Hood Shield candidate:** 4 Shadow Rider Calyrex V, 1 Tapu Lele-GX, 2 Lillie's Clefairy ex.
- **Champion reference:** 3 Shadow Rider Calyrex V, 2 Tapu Lele-GX, 2 Lillie's Clefairy ex.

Both lists have 14 Basics and one Hisuian Heavy Ball. The candidate has one more copy of its primary Basic attacker but one fewer copy of the Tapu Lele support role.

| Conditional-on-legal-seven metric | Hood Shield candidate | Champion reference |
|---|---:|---:|
| Open at least one Shadow Rider Calyrex V | **46.37744%** (4 copies) | **36.61785%** (3 copies) |
| At least one of the eight support/tech roles stranded by one usable Heavy Ball | **21.12871%** | **17.54447%** |
| Expected stranded support/tech roles per game | **0.25062** | **0.20309** |
| At least one role unavailable in the no-Heavy-Ball / active-Item-lock stress case | **58.50050%** | **53.81455%** |
| Expected unavailable roles in that no-recovery stress case | **0.78300** | **0.69321** |

The first row uses the exact opening-hand event: with (k) copies of Shadow Rider Calyrex V and 14 Basics total, (P(V\text{ in opening seven}\mid\text{legal seven})=[\binom{60}{7}-\binom{60-k}{7}]/[\binom{60}{7}-\binom{46}{7}]).

The remaining rows use the same role-capacity enumeration above. For the champion reference, Tapu Lele-GX is one role with multiplicity two; the other seven target roles are singletons. The remaining Basics are 3 Shadow Rider V + 2 Clefairy ex. Both decks are modeled with one Heavy Ball.

**Interpretation:** the candidate's extra Shadow Rider V materially improves the narrow opening-V proxy (+9.76 percentage points), while reducing Tapu Lele redundancy increases the modeled pressure on its single Heavy Ball (+3.58 points in the one-Ball stranded-role metric). This is a structural tradeoff, not a claim that either list is stronger. It excludes all other card-count differences, target-value differences, draw/search access, opponent actions, and complete-game outcomes.
