# Crobat V plus Battle VIP Pass: exact owner-hand opening opportunity (31 October 2026)

**Evidence class:** exact finite combinatorics for published original source 60s, with a previously observed but unresolved native action-order conflict. This is a physical availability calculation only. All games, actions, prompt effects, clock and win rates remain unqualified by this calculation.

## Why examine this particular event

The existing [registered original native 32-arm VIP evidence](../aichi-2026/agent9-original-32-vip-native-source-coverage-20261029.md) has two rank-11 source game arms that share **one independent original physical source deal**. That deal (seed `1254634394`, original source physical seat 0, source-deal fingerprint `b0a7b753221ecfb60cdf182f2801799f4c43f097ef29f035d54ddb191c72b495`) natively accepted a **Crobat V DAA** root before later accepting **Battle VIP Pass FST** on the first source turn. The follow-on VIP search genuinely Benched Trubbish FST and Latias ex SSP. The [previously registered reversal](../aichi-2026/registrations/agent9-source-crobat-vip-native-priority-fork-20261029.json) asks whether VIP-before-Crobat would also be accepted and improve the resulting resource conversion. That counterfactual has **not** run and there is no established same-state native legality for the unchosen order.

The authenticated exact-source [original 29-deck corpus](../aichi-2026/full-decklists.json) contains three identifiable Crobat-plus-VIP sources. The Basic counts below include Crobat itself and were checked against the listed Pokémon printing stages. Rank 11: 11 Basics, 4 VIP, 1 Crobat; rank 8: 10 Basics, 2 VIP, 1 Crobat; rank 26: 12 Basics, 3 VIP, 1 Crobat.

## Precisely defined physical event

Sample a uniformly shuffled original 60, conditional on the seven-card setup hand containing **at least one Basic**. Count an opening as successful when **Crobat V is still retainable in hand**, **at least one Battle VIP Pass is present**, and **at least one *other* Basic was in the original seven** to serve as the initial Active. This permits an owner to deliberately keep Crobat for its later hand-to-Bench Ability. It does not suppose that Crobat is played for setup, that all other Basics are Benched, or that an Item is strategically correct to play.

For the `going-first` measurement, examine the seven cards only. For the `going-second` measurement, also expose one ordinary draw at the start of the first player's turn, after the initial seven-card Basic test and six randomly assigned Prize cards. Uniform random Prizes make the eighth exposed card marginally uniform among the 53 cards outside the retained seven, regardless of the intervening random six. This measurement excludes mulligan bonus draws, searches, Abilities, recycling and opponent effects.

Write `B` for the number of Basics, `V` for VIP copies, and `R=60-B-V` for other cards. There is exactly one Crobat and `B-1` other Basics. With `C(n,k)=0` for out-of-range arguments, the count of legal-seven hands is

```text
D = C(60,7) - C(60-B,7).
```

The count of successful seven-card hands follows inclusion-exclusion over the six companions to the one Crobat:

```text
N7 = C(59,6) - C(59-V,6) - C(60-B,6) + C(60-B-V,6).
P7 = N7 / D.
```

For the eighth-card extension, partition the initial seven by Crobat count `c` (0 or 1), VIP count `v`, other-Basic count `o` and other-card count `r=7-c-v-o`. Retain only rows with `c+o>=1`. The number of such hands is

```text
W(c,v,o) = C(1,c) C(V,v) C(B-1,o) C(R,7-c-v-o).
```

For rows with `o>=1`, the conditional success chance after the eighth draw is `1` if `c=1,v>=1`, `V/53` if `c=1,v=0`, and `1/53` if `c=0,v>=1`. Otherwise it is zero. Summing `W * chance / D` yields the exact `P8` below. This is an all-placements probability, so it already marginalizes physical Prize positions.

| Original printed source final rank | Basic count B | VIP count V | Crobat | P7, valid opening going first | P8, valid opening going second |
| --- | ---: | ---: | ---: | ---: | ---: |
| 8, Absol/Garbodor | 10 | 2 | 1 | **1.7986828280%** | **2.4480479315%** |
| 11, Absol/Garbodor | 11 | 4 | 1 | **3.4062028581%** | **4.5439041286%** |
| 26, Meloetta Donk | 12 | 3 | 1 | **2.7073530815%** | **3.6366474503%** |

**Optional Bench crowding sensitivity:** if every other opening Basic is promptly deployed and one Bench spot must be retained for the later Crobat, VIP's two searches plus Crobat fit only when the initial seven contain at most three *other* Basics. With that additional *policy choice*, the corresponding P7 / P8 figures are rank8 **1.7943262025% / 2.4397426384%**, rank11 **3.3928604823% / 4.5191604892%**, rank26 **2.6923405014% / 3.6087536836%**. Players can choose to withhold other Basics, so this sensitivity is not a hard upper bound on legal play.

## Strategic interpretation and falsification boundary

The observed rank-11 physical root proves that a Crobat-before-VIP continuation can actually happen on an original pinned Store source deal. The mathematical P7/P8 percentages quantify how unusual a **direct, pre-search, retainable-hand prerequisite** is in original source inventories. Neither result proves a preferential ordering or rules out access via Quick Ball, other search, opponent mulligan draws or different Bench decisions. Dark Asset draw cards and hand-state costs make the ordering consequential; their actual resolution and any remaining Crobat Bench slot must be measured in the exact registered same-deal native fork.

A genuine follow-up should use the **already registered rank-11 source-dealt two-candidate pair**, preserve original source fingerprints, keep the baseline actor and physical opponent response visible, and record native VIP acceptance, each original owner-deck prompt, exact Bench targets, subsequent Crobat play and actual draws, later owner roots and the opposing player's subsequent response. Retain rejected, capped, exception and no-Crobat continuations. The larger same-root contract is owned by active Agent41; this note supplies a bounded feasible-event denominator rather than a competing runner or another winner table.

**Deck decision unchanged:** 29/32 authenticated Top32 original sixties, final ranks 23/25/28 still missing, zero qualified competitive games, no justified single fixed 60 and no demonstrated 99.5% result.
