# Agent 15: rank-8 Secret Box / Boost Shake structural Prize gate

**19 October 2026 UTC. Evidence class: exact combinatorial source-deck calculation, not a game result.**

## Question

How often can the published rank-8 Absol/Garbodor 60 have the essential cards for the exact early Tool-Garbodor line *outside the initial six Prize cards*? The previously published turn-7 success used one retrospectively identified deal (seed 1260748957). This note isolates a necessary Prize-availability condition and deliberately does not estimate actual turn-7 hand access or policy frequency.

The published source 60 in `results/aichi-2026/full-decklists.json` contains: **1 Secret Box, 1 Boost Shake, 2 Trubbish, 2 Garbodor, 4 Float Stone, 4 Quick Ball** and 46 other cards. The source line and its legal owner-search choices are documented in `results/aichi-2026/rank8-boostshake-authentic-counterline.md`; an autonomous conditional positive control in `results/aichi-2026/agent44-rank8-autonomous-opponent-pressure.md`. These fixed names are the requirements for that *specific* line, not all possible ways to create Garbotoxin.

## Exact six-Prize combinatorics

For the initial unordered six-Prize subset of the 60, the two singleton prerequisites are both outside Prizes with probability

`C(58,6) / C(60,6) = 477/590 = 80.8474576271%`.

Thus **19.1525423729%** of deals have Secret Box or Boost Shake (or both) in Prizes. This is a necessary early-line failure for the exact no-Prize-recovery route, assuming those singleton cards cannot be recovered from Prizes before playing them. It is not a general failure probability for the deck.

Also require at least one copy each of Trubbish, Garbodor, Float Stone and Quick Ball outside Prizes. Partition all 60 distinguishable physical cards into counts `(1,1,2,2,4,4,46)`. Sum the six-Prize choices with zero Prized from each singleton, fewer than two Prized from each two-of, and fewer than four Prized from each four-of:

`sum[C(2,t) C(2,g) C(4,f) C(4,q) C(46,6-t-g-f-q)]`,

where `t,g in {0,1}`, `f,q in {0,1,2,3}`, and binomial coefficients with invalid lower arguments are zero.

The favorable count is **39,739,351** of **50,063,860** equally likely six-card Prize subsets:

**79.3773212853%** retain all six required named categories outside initial Prizes, and **20.6226787147%** fail this necessary card-availability test.

Independent Python `random.Random(20261019)` check, sampling 200,000 six-card subsets without replacement: **158,700** favorable (79.3500%), standardized difference `z=-0.302` from the exact calculation. The analytical result is exact; the randomized check is only a validation.

## Conditioning on a legal opening hand

The unconditional fraction above is a clean uniform-six-Prize combinatorial reference. **A played game first requires a valid seven-card starting hand with a Basic Pokémon**, so the Prize subset distribution for accepted openings is mildly different.

The exact published rank-8 list has ten Basic Pokémon: two Mega Absol ex, two Trubbish, and one each of Tapu Koko Prism Star, Dedenne-GX, Crobat V, Squawkabilly ex, Tapu Lele-GX and Budew. This count can be checked against the provided card database (`me1-86` explicitly has subtype Basic). Split the 46 'other' cards in the original calculation into **8 other Basics and 38 non-Basics**. Trubbish contributes the other two Basics.

Let `b` be the number of Basics among the six Prizes. Given that Prize subset, the probability that a disjoint seven-card initial hand is legal is `1 - C(44+b,7)/C(54,7)`. Weight every six-Prize configuration by that factor and then divide by `P(valid seven) = 1 - C(50,7)/C(60,7) = 74.1370765702%`.

The adjusted exact probability of retaining all six target categories outside Prizes **conditional on an opening hand containing a Basic** is

`217107751062921 / 273885146935400 = 79.2696330897%`.

A separate `random.Random(2026101901)` Python experiment generated 250,000 independent deck shuffles, kept the 185,381 with at least one Basic in the opening seven, then tested cards 8–13 as Prizes. Of those valid deals, 147,226 satisfied the gate (79.4180633398%; `z=1.58` relative to the exact conditional value). The result is an exact combinatorial calculation independently checked by simulation.

This conditional result is the more relevant starting-deal reference for actual games after own mulligans. Optional extra draws caused by an opponent's mulligans occur after Prize setting and do not change this gate.

## Interpretation and limitations

- The percentage is a **necessary physical-card-availability ceiling on this exact combination's immediately unprized configuration**. It is not the probability of executing the lock. The line must still acquire or hold specific cards, pay Secret Box's three-card discard and Quick Ball's discard, preserve a Bench slot, attach Float Stone, resolve Boost Shake and face a competent opposing response.
- Some Prized cards may become accessible after taking Prizes or through other effects. This note does not exclude alternate Garbodor setup routes; it describes the published Secret Box + Quick Ball + Boost Shake route without prior Prize recovery.
- A fully available configuration may fail to execute. The published source seed was chosen from a known favorable board and cannot be treated as an unconditioned trial.
- K0 versus K1 matters: once a player has searched their deck, they can often identify which necessary cards are Prized, allowing a strategically better decision about consuming the ACE SPEC. The source autonomous opponent policy does not establish that such inference was available or used in every state.
- No actual game outcomes were measured here; the pinned Twinleaf policy and paper-rule qualification gates remain open. The benchmark still has 29/32 verified full opponent lists and zero competitively qualified games.

## Reproduction

Enumerate prize multiplicities from the fixed counts `(1,1,2,2,4,4,46)`, multiply binomial coefficients for each valid combination summing to six, then divide by `C(60,6)`. This calculation uses card counts only and requires no engine or card-order assumptions beyond a uniform six-card Prize selection.
