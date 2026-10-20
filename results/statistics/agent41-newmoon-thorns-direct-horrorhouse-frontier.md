# New Moon vs source-first Iron Thorns: exact narrow direct Horror House resource window

**Agent 41, 20 October 2026 UTC.** Mathematical combinatorics with a frozen 60-card source-aligned English proxy. This measures a specifically defined resource subset. It is not a probability of opening an attack, surviving an attack, passing Item legality, or winning a competitive game.

## Research question

How frequently can the unchanged 60-card [New Moon Lockbreaker v1](../als/new-moon-lockbreak-60-candidate.md) see a *direct*, no-search, single-Psychic-Energy `Horror House-GX` setup on its first own turn if its rank-6 Iron Thorns ex opponent starts first with Initialization active?

A narrow sufficient **inventory subset for attempting the intended line** requires all of:

1. At least one of the **two Mewtwo & Mew-GX** in the candidate's accepted initial seven, so the player may select it Active during setup.
2. By one ordinary draw plus any explicitly taken opponent-mulligan bonus cards, have seen at least one **Canceling Cologne (2)**, **Battle Compressor (2)** and **Psychic-providing Energy (6: three Basic Psychic and three Telepathic Psychic)** in the owner's cards.
3. The single **Gengar & Mimikyu-GX** remains in the post-Prize **deck**, accessible to be discarded by Battle Compressor and copied by Mewtwo's Perfection for `Horror House-GX`.

These are **physical card-location opportunities**. The analytic event assumes the opponent's first turn does not change the candidate's zones. The Pokémon can be chosen Active and these cards might be played in sequence only if their respective rules, prompt validation and opponent's other effects permit them. One Psychic pays the printed `Horror House-GX` base cost, without its optional extra-Energy seven-card draw effect. Actual `Initialization` requires timely Cologne effect resolution to unlock `Perfection`. The game still requires an actual attack declaration and opponent reply.

Routes excluded from this event include Fog Crystal or Mysterious Treasure access to Mewtwo, Battle VIP Pass benching Mewtwo, Secret Box search and its three-card discard cost, searching Cologne or Compressor from the deck, getting Gengar into discard from hand through another Item, first-turn attacks from another Pokémon, and later-turn access or recovery. This event is a **restricted direct route**, and its small incidence cannot be used as an upper bound on total first-turn attack opportunities.

## Exact combinatorics

The manifest has **60** cards, **17 Basic Pokémon**, and the disjoint target groups `Mewtwo=2`, `Cologne=2`, `Compressor=2`, `Psychic Energy=6`, `Gengar=1`, `other=47`. The analysis conditions on an initial seven with at least one Basic and six uniformly randomized hidden Prize cards.

Let `m` be the number of opponent mulligan bonus cards **all taken**, and `d=m+1` the number of cards observed after the opening seven, including one normal draw. Write `C(n,k)` for an ordinary binomial coefficient and define:

- `V = 1-C(43,7)/C(60,7)`, the probability of a Basic-valid seven;
- `n_S=59-sum(group sizes in S)` for each subset `S` of the three resource groups with sizes `2,2,6`, excluding Gengar throughout;
- `H(n)=C(n,7)-C(n-2,7)`, accepted opening-hand choices containing at least one of the two Mewtwo.

Inclusion-exclusion over missing resource groups gives the exact conditional event probability:

`P_m = [sum_{S subseteq {Cologne,Compressor,Energy}} (-1)^|S| H(n_S) C(n_S-7,d)] / [C(60,7) C(53,d) V] * [(47-d)/(53-d)]`.

The last factor is the exact probability Gengar is outside the six Prizes **given it was absent from the first `7+d` observed cards**. For `d>46`, the event is impossible because Gengar cannot remain in the post-Prize deck.

The rank-6 source 60 holds exactly **four Basic Iron Thorns ex**. Its independent initial-seven mulligan probability is `q=C(56,7)/C(60,7)=0.6005003742553344...`, and the chance of exactly `m` source mulligans is `(1-q)q^m`. Taking every bonus produces the exact mixture `sum_{m=0}^{45} (1-q)q^m P_m`. No truncated positive contribution exists for `m>=46` under this event because its live-deck Gengar requirement becomes impossible.

## Result

| Optional source mulligan bonuses taken | Conditional restricted direct resource opportunity |
| --- | ---: |
| 0 | **0.4017709624%** |
| 1 | **0.5871925104%** |
| 2 | **0.8048553842%** |
| 3 | **1.0508461401%** |
| All offered source-mulligan bonuses, geometrically weighted | **0.7383925778%** |

Exact rational for zero bonuses: `979895887 / 243894153334`; for one bonus: `48692358855 / 8292401213356`. These are **conditional on an accepted Basic-valid opening seven**, before evaluating deck search, active locks, choice contention, opponent behavior, paper time controls, or error-prone decision policies.

The calculation can be reproduced with [Python stdlib exact-fraction script](../../scripts/agent41_newmoon_direct_thorns_resource.py), which validates the 60-card frozen manifest counts and includes a separate opening-seven category-count enumeration as an independent `m=0` cross-check. The inclusion-exclusion implementation and independent `m=0` enumerator were also recomputed in the analysis runtime, agreeing exactly at `979895887/243894153334`; source `m=1` checked against its stated exact fraction. This execution is mathematical source verification **without a compiled Twinleaf match**.

## Strategic meaning and next discriminating test

The result sharply limits this *direct no-search single-turn four-resource* slice. Against the real rank-6 source, most first-own-turn attacks must rely on search and sequencing, alternative copied payload access, bench switching, or a later turn. A fully available direct bundle is still not a guaranteed meaningful attack. The source can remove Energy during subsequent turns, as witnessed by [Agent43's authentic prompt-closed rank6 analysis](../aichi-2026/agent43-newmoon-printed-gengar-rank6-window.md): in the selected 260-root censored New Moon arm, six attached-Energy additions were matched by six removals.

The highest-value remaining test is an **actor-visible, full-policy source-first** line that demonstrates actual Cologne play, paid attachment, owner-selected Gengar discard, settled `Horror House-GX` and a real Iron Thorns response under the *same* original 60s. Conditions on private owner K0/K1 information, source turn order, all no-opportunity seeds, and a 25-minute event clock are mandatory before any competitive inference. Exact source lists still total **29/32** with ranks 23/25/28 missing; **zero competitively qualified games** and no demonstrated 99.5% target.
