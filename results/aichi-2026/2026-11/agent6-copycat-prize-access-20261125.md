# Hood Shadow Rider: shared Prize-recovery capacity across singleton Basic tech

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate risk assessment and a possible future Heavy Ball slot experiment.  
**Evidence class:** exact combinatorial calculation conditioned on a legal seven-card opening. No game, matchup, or win-rate result.

## Question

Hood Shield Shadow Rider v1 has eight singleton Basic support/tech roles and two Clefairy; Lockbridge retains those eight, reduces Clefairy to one, and adds a one-copy Wobbuffet role. Both lists have only one Hisuian Heavy Ball to retrieve a Basic from the Prize cards. How often does this shared recovery capacity leave one or more of those roles stranded in the Prizes?

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

- \(X\) = number of the eight singleton target Basics in the Prizes;
- \(Z\) = number of the other six Basic Pokémon in the Prizes;
- \(Y\) = number of Heavy Ball copies in the Prizes;
- \(H\) = number of Heavy Ball copies in the 60-card deck.

The number of Prized singleton targets that remain unrecoverable by Heavy Ball is:

\[
S=\max(0, X-(H-Y)).
\]

For each Prize composition \((X,Z,Y)\), the number of legal opening hands among the remaining 54 cards is:

\[
\binom{54}{7}-\binom{54-(14-X-Z)}{7}.
\]

The Prize-composition multiplicity is:

\[
\binom{8}{X}\binom{6}{Z}\binom{H}{Y}
\binom{60-14-H}{6-X-Z-Y}.
\]

Summing the products over valid compositions gives the exact number of legal-opening / Prize-set pairs. This conditions on the real 14-Basic list rather than treating the Prize subset as independent of a legal opening. This weighting is exact for the actual setup order: a legal seven is drawn first and six Prizes are then selected from the remaining 53. Every disjoint opening-seven / Prize-six pair has the same probability, and reversing the sampling order gives the same joint count because \(\binom{60}{7}\binom{53}{6}=\binom{60}{6}\binom{54}{7}\). Thus enumerating Prize sets first and weighting each by its legal openings among the remaining 54 is equivalent to the real draw order.

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

The candidate's singleton support/tech roles can be compared with the published champion baseline. The seven singleton roles other than Tapu Lele-GX are identical. Both lists also contain a **two-copy Clefairy / Fairy Zone role**. The relevant differences are:

- **Hood Shield candidate:** 4 Shadow Rider Calyrex V, 1 Tapu Lele-GX, 2 Lillie's Clefairy ex, and seven other singleton Basic roles.
- **Champion reference:** 3 Shadow Rider Calyrex V, 2 Tapu Lele-GX, 2 Lillie's Clefairy ex, and the same seven other singleton Basic roles.

Both lists have 14 Basics and one Hisuian Heavy Ball. The role-capacity comparison below includes **all nine** support/tech roles (the eight singleton roles plus Clefairy as one role with two copies); the remaining Basic Pokémon are the four vs three Shadow Rider V copies.

| Conditional-on-legal-seven metric | Hood Shield candidate | Champion reference |
|---|---:|---:|
| Open at least one Shadow Rider Calyrex V | **46.37744%** (4 copies) | **36.61785%** (3 copies) |
| At least one of the nine support/tech roles stranded by one usable Heavy Ball | **21.44129%** | **17.84089%** |
| Expected stranded support/tech roles per game | **0.25459** | **0.20673** |
| At least one role unavailable in the no-Heavy-Ball / active-Item-lock stress case | **58.94803%** | **54.29676%** |
| Expected unavailable roles in that no-recovery stress case | **0.79109** | **0.70130** |
| At least one role stranded in the two-Heavy-Ball counterfactual | **5.08841%** | **3.81085%** |
| Expected stranded roles in that counterfactual | **0.05624** | **0.04149** |

 The Tapu Lele-GX role itself is Prize-inaccessible under the one-Heavy-Ball recovery structure with probability **0.83532182%** for Hood (one Lele) versus **0.05620289%** for the champion (two Lele), conditioned on a legal seven; the second copy reduces this specific role's Prize-only hard failure by **14.86×**.

The first row uses the exact opening-hand event: with (k) copies of Shadow Rider Calyrex V and 14 Basics total, (P(V\text{ in opening seven}\mid\text{legal seven})=[\binom{60}{7}-\binom{60-k}{7}]/[\binom{60}{7}-\binom{46}{7}]).

The remaining rows use the same role-capacity enumeration above. For the champion reference, Tapu Lele-GX is one role with multiplicity two, Clefairy is another role with multiplicity two, and the other seven target roles are singletons. The remaining Basics are three Shadow Rider V. Both decks are modeled with one Heavy Ball.

**Interpretation:** the candidate's extra Shadow Rider V improves the narrow opening-V proxy, while reducing Tapu Lele redundancy increases the modeled Prize-recovery burden. Including the common two-copy Clefairy role gives the fuller nine-role comparison above. This is a structural tradeoff, not a claim that either list is stronger. It excludes all other card-count differences, target-value differences, draw/search access, opponent actions, and complete-game outcomes.

### Starter-role decomposition of the same one-card swap

The two lists both contain **five total copies** across Shadow Rider Calyrex V and Tapu Lele-GX: Hood has 4+1, while the champion has 3+2. Therefore the probability of opening at least one of these five Basic Pokémon, conditioned on a legal seven, is identical: **55.09137%**.

The swap changes *which* starter is opened rather than increasing the total chance of opening one:

| Opening-seven event, conditioned on a legal seven | Hood (4 V / 1 Lele) | Champion (3 V / 2 Lele) |
|---|---:|---:|
| At least one Shadow Rider Calyrex V | 46.37744% | 36.61785% |
| At least one Tapu Lele-GX | 13.54370% | 25.71007% |
| At least one of either V or Lele | **55.09137%** | **55.09137%** |

Thus the candidate trades **+9.75959 percentage points** of opening V access for **−12.16637 points** of opening Lele access, with no change in the combined five-card starter-pool probability. This is a more precise description of the one-card substitution than saying it simply improves opening consistency. It remains an opening-hand proxy, not an engine-completion or win-rate result.


## Narrow Prize-capacity comparison: Hood Shield versus Lockbridge

The exact four-slot Lockbridge swap changes the Basic tech-role pool:

- **Hood Shield:** the eight common singleton roles above, plus one Fairy Zone role represented by **two** Lillie's Clefairy ex copies; four other Basics are Shadow Rider V.
- **Lockbridge:** the same eight common singleton roles, plus **one** Lillie's Clefairy ex role and **one** Wobbuffet role; four other Basics are Shadow Rider V.

Both lists have 14 Basics and one Hisuian Heavy Ball. Treating each function as one role (two Clefairy copies still represent one Fairy Zone role), the legal-seven-conditioned capacity model gives:

| Conditional-on-legal-seven metric | Hood Shield | Lockbridge |
|---|---:|---:|
| At least one Basic support/tech role stranded by one usable Heavy Ball | **21.44129%** | **29.28868%** |
| Expected stranded roles per game | **0.25459** | **0.36599** |
| At least one role unavailable in the no-recovery / active-Item-lock stress case | **58.94803%** | **67.42486%** |
| Expected unavailable roles in that no-recovery stress case | **0.79109** | **0.97875** |
| At least one role stranded in the two-Heavy-Ball counterfactual | **5.08841%** | **8.38106%** |
| Expected stranded roles in that counterfactual | **0.05624** | **0.09558** |

The one-Heavy-Ball difference is **+7.84739 percentage points** for Lockbridge in the probability of at least one role being stranded, and **+0.11139** expected stranded roles/game. The Fairy Zone role alone is Prize-inaccessible with probability **0.05620289%** in Hood (two Clefairy + one Heavy Ball) versus **0.83532182%** in Lockbridge (one Clefairy + one Heavy Ball), a **14.86×** increase conditioned on a legal seven. This follows from the swap converting the two-copy Clefairy role into a one-copy role while adding a new one-copy Wobbuffet role to the pool competing for the same recovery Item.

**Interpretation:** this quantifies one structural Prize-access cost of the Wobbuffet / Temple package. It does not quantify the benefit of Wobbuffet's Ability lock or Temple's Special Energy disruption, nor the separate loss of Pokémon Ranger or Temple's own Stadium-Prize risk. It is not a candidate-strength ranking, matchup result, or reason to reject Lockbridge; the role values are unequal and require game-state evidence.


## Exact list inputs

- Hood Shield candidate: [printing-normalized Expanded 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md), derived from [candidate-hood-shadow-rider.json](../candidate-hood-shadow-rider.json).
- Lockbridge candidate: [agent31-lockbridge-shadow-rider-v1.json](agent31-lockbridge-shadow-rider-v1.json).
- Published Aichi field / champion reference: [authenticated 29-deck subset in full-decklists.json](../full-decklists.json); rank 1 is present, but this does not imply all 32 lists are authenticated (ranks 23/25/28 remain unresolved). The comparison uses the rank-1 champion's 3 Shadow Rider V / 2 Tapu Lele-GX counts.


## Value-weighted extension (not evaluated)

The unweighted role count is only a capacity diagnostic. For a game state \(s\), let \(M(s,P)\) be the set of roles whose every copy is Prized, and let \(R=\max(0,H-Y)\) be the number of Heavy Ball recoveries still available. If role \(i\) has state-dependent marginal value \(v_i(s)\), the best recovery choice is the \(R\) highest-value missing roles. The remaining access loss is:

\[
L(s,P)=\sum_{i\in M(s,P)}v_i(s)
-\sum_{j=1}^{\min(R,|M(s,P)|)}v_{(j)}(s),
\]

where \(v_{(j)}\) are the missing-role values sorted from highest to lowest. The current report sets every \(v_i=1\), so \(L\) reduces to the number of stranded roles \(S\).

Shadow Rider V copies are included in the 14-Basic count and legal-opening weights but are not modeled as a target role; the separate risk of multiple V copies being Prized, and the engine's need for more than one V, is outside this role-capacity metric.

A competitive estimate would need opponent- and state-conditioned values from a competent policy or validated game traces. Those inputs do not exist for this candidate; therefore no value-weighted Prize-loss estimate is reported.

### Energy-ready opening proxy

Both lists also contain 11 Basic Psychic Energy. A narrower opening proxy is having at least one Shadow Rider V **and** at least one Basic Psychic Energy in the final legal opening seven. For (k) copies of Shadow Rider V, the exact conditional probability is:

\[
\frac{\binom{60}{7}-\binom{60-k}{7}-\binom{49}{7}+\binom{49-k}{7}}
{\binom{60}{7}-\binom{46}{7}}.
\]

This gives **34.19736%** for Hood's four V copies versus **26.88607%** for the champion's three (+**7.31129 percentage points**). This is a more specific opening resource proxy than simply opening V, but it still does not establish a turn-one attack, a complete engine, supporter access, or a matchup result; it ignores search/draw sequencing and going-first/second differences.
