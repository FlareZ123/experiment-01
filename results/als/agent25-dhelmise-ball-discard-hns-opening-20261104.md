# Agent 25: discard-cost Ball routes increase the Dhelmise v2 first-eight HNS resource screen

**4 November 2026 | original candidate v2 unchanged | exact finite combinatorial enumeration | no native game or competitive win attributed to this calculation.**

## Question and correction

The existing [Dhelmise ordinary-Psychic opening census](agent25-dhelmise-psychic-energy-attack-opportunity-reframe-20261101.md) required four eligible Hide 'n' Sneak (HNS) donor Pokémon to remain in deck after the opening draw and six Prizes, and counted a held Brilliant Blender, held Arven with unprized Blender, or **two** held Battle Compressor Items as its discard routes. It did not include donor cards discarded **from hand** to pay a Ball's discard cost.

The actual unchanged [fixed v2 printed 60](agent25-dhelmise-mixed-lock-answers-v2.json) contains four Mysterious Treasure and three Quick Ball, both with one-card discard payment, as well as four Battle Compressor and one Brilliant Blender. Printed Mysterious Treasure discards one hand card before its Psychic/Dragon search; printed Quick Ball requires a discard from hand; Battle Compressor can discard up to three deck cards; Brilliant Blender can discard up to five deck cards. Dhelmise M5 39 checks **four Pokémon having HNS in the discard pile**, irrespective of whether those Pokémon arrived from hand or deck. This produces a distinct and potentially playable *resource* path:

`held Dhelmise + one Psychic Energy + one HNS donor + one discard-cost Ball + one Battle Compressor -> pay Ball by discarding held HNS donor -> use Compressor to discard three remaining HNS donors -> Vengeful Anchor's four-donor 170 base attack`.

The ordering of the two Items does not matter for their basic discard capacities. This assumes the acting player can use those Items, attach the Energy and attack, with a sufficiently empty discard pile and no opposing lock. This is an opening-resource possibility, **not an observed successful turn**.

## Exact event

Keep the real fixed 60 and its **14 Basic Pokémon**, including two Shuppet and four Dhelmise. Observe the first seven cards plus exactly one ordinary later draw, then six uniformly random Prize cards. By exchangeability, counting the eighth card before the six Prizes gives the same joint physical distribution as actual Prize placement before drawing that card. Require Dhelmise in the first seven and at least one of the ten Psychic-providing Energy cards by the eighth card. Conditional Basic-valid rates use the same actual 14-Basic starting-seven denominator as the prior census.

Disjoint card classes are **Dhelmise 4, currently eligible HNS donors 8 (or 6 under the specified partial-lock counterfactual), Psychic Energy 10, Arven 4, Blender 1, Compressor 4, discard-cost Ball 7, everything else 22 (or 24)**. The two suppressed Sinistcha printings stay among other cards when only six donors qualify; the fixed physical 60 is never shrunk.

Let `r` be eligible donors remaining in deck after Prize placement, `h` the eligible donors physically held in the first eight, `c` the held Compressors, and `b` the held discard-cost Balls. Let `z=1` when Blender is held or accessible through held Arven while still in deck; otherwise `z=0`. The expanded resource event is

```text
min(r, 3*c + 5*z) + min(h, b) >= 4
```

The first term is the number of eligible donors theoretically discardable **from deck** using the available search-and-discard Items; the second is the number of eligible donors payable **from hand** as Ball costs. This screens *capacity* only. Ball searches may have opportunity costs, and playing Arven consumes the turn's Supporter. Search, payment and damage were not enacted in the native engine here. The original narrower predicate is retained verbatim as a regression denominator.

## Results on the same immutable v2 60

| First-eight / six-Prize physical event | All 8 donors eligible | Wobbuffet or Silent Lab counterfactual, 6 eligible |
| --- | ---: | ---: |
| Previous deck-only Blender / double Compressor route | **13.910619338%** | **12.712666184%** |
| Expanded Ball-assisted discard capacity | **16.081210532%** | **14.865647349%** |
| Additional opening-world probability | **+2.170591194 pp** | **+2.152981165 pp** |
| Expanded probability, conditional Basic-valid first seven | **18.668489155%** | **17.257356077%** |

The exact denominator is `C(60,7)*53*C(52,6)=416717869162795200` labeled card-location worlds. Unrestricted favorable numerator is **67,013,277,866,565,072** versus earlier **57,968,036,494,606,112**; the increment is **9,045,241,371,958,960**. The exact program output, which is authoritative for the integer count, is `9045241371958960`. Under partial lock the respective numerators are **61,947,808,868,633,892**, **52,975,951,633,859,892**, and **8,971,857,234,774,000**.

**Interpretation:** The old ordinary attack opening estimate was conservative even under its already restrictive eight-card exposure. A single Compressor becomes relevant when a held discard-cost Ball pays for one of the donors. The approximately two-percentage-point increment is evidence that discardability and connector interaction matter to the analytic opportunity calculation; it is not a general deck optimization result. The actual strategic price of sacrificing a held donor and consuming Ball access must be weighed against what that Ball might search for.

## Verification and limitations

- Reproducible [BigInt exact enumerator](../../scripts/agent25-dhelmise-ball-discard-opening.cjs) with [four Node regression tests](../../tests/agent25-dhelmise-ball-discard-opening.test.cjs). The exact program reproduces both historical narrower probabilities before adding Ball routes.
- Independent Python integer-combination implementation computed **16.081210532%** and **14.865647349%** for the expanded event, including explicit Prizes; separately, two independent 250,000-trial physical shuffles gave approximate event rates **16.2596%** and **14.9144%**, consistent with normal Monte Carlo sampling variation. Those samples are checks on card-location math, not observed game events.
- Neither test resolves whether the owner should consume a given Ball, whether the search target exists or is desirable, whether an Item/Supporter lock is already active, or whether the opponent can stop the setup. It omits all later draws, board decisions, opponent activity and elapsed tournament time. The paper legality of an actual sequence and native effect settlement remain separate gates.
- The 99.5% full-field goal remains unverified: **29/32** source 60-card name/count inventories authenticated, missing original ranks **23, 25 and 28**, **zero competitively qualified games** and no selected best fixed 60.

Do **not** upgrade the Dhelmise v2 list into the common-candidate shortlist on this finding alone. The most useful next test is a physically held donor / one-Compressor / one-Ball native first-turn witness, including the actual paid Ball discard, three named Compressor targets, attack damage, and a competent source response. Its policy should compare Ball's competing Pokémon-search use rather than always discarding a donor.
