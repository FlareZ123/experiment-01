# Agent 40: exact Guzma & Hala three-channel access and discard-resource floors

**4 November 2026 | original Aichi ranks 2 and 15 | source-pinned exact combinatorics.** This is a physical opening-opportunity model with **zero native game trials and zero competitively qualified wins**. The established Bunnelby / Guzma & Hala / Artazon / Capture Energy / TM: Evolution line is described and staged in [Agent7's source-native both-seat test](agent7-rank2-gh-artazon-capture-tm-native-both-seats-20261102.md); Agent7 estimated access by 40 million random layouts. This report independently evaluates precisely that published broad access screen as an **exact rational**, then separates connector copies that could be paid as two Guzma & Hala discards during the immediate turn.

## Frozen sources and admission boundary

The unchanged source is [original full-decklists.json](../aichi-2026/full-decklists.json), Git blob **ae773f6201d7aa69d31914dbfee66f3fba692200**. Both source decks have 60 cards, 14 eligible Basic Pokémon, 2 Bunnelby, 4 Tag Call, 2 Artazon and 2 TM: Evolution. Rank 2 has **4 Guzma & Hala and 2 Capture Energy**; rank 15 has **3 Guzma & Hala and 1 Capture Energy**. Both have two each of Oddish, Pidgey, Gloom, Pidgeotto, Vileplume AOR3 and Pidgeot ex OBF164. These are actual source-printing counts, independently checked in the successful manual CI below. There are **29/32 authenticated original opponent sixties** and three missing original ranks **23, 25 and 28**. This calculation adds no list to that denominator.

A valid paper opening draws seven, sets six random face-down Prizes, then draws one card at the start of the player's first turn. Condition on the initial seven containing a Basic, whose probability for the two original lists is **86.1409319129%**. The named starting Active must be Bunnelby in those **first seven**, never just in the eighth turn draw. The precise broad event counts: one of Tag Call or Guzma & Hala in the first eight; if only Tag Call is held, at least one Guzma & Hala remains in the actual deck; at least one Oddish, Pidgey, Artazon, Capture Energy and TM: Evolution is held or searchable in deck; and at least one of all **four needed Stage targets** remains in deck for the two actual TM attacks. Cards already drawn into hand are deliberately excluded as deck-search targets for Stage evolution.

## Exact original-source rates, conditional on a Basic-valid starting seven

The connector threshold counts **Tag Call and Guzma & Hala cards among the first eight**. Consuming the first usable connector leaves other such copies in hand. Two extra copies are physically sufficient as a two-card Guzma & Hala discard payment for the immediate setup sequence. They can have significant later strategic value, so this is an explicit physical substitute for a low-DCI payment, without claiming that the discarded cards have zero opportunity cost.

| First-eight connector threshold | Rank 2, broad published resource screen | Rank 15, broad published resource screen | Rank 2, all three tutor targets absent from first eight | Rank 15, all three tutor targets absent |
| --- | ---: | ---: | ---: | ---: |
| At least **1**: no demonstrated spare connector | **13.645965%** | **11.337701%** | **6.361323%** | **5.987414%** |
| At least **2**: one spare connector | **5.065347%** | **3.645176%** | **2.638310%** | **2.118137%** |
| At least **3**: two spare connector copies | **0.997411%** | **0.594476%** | **0.589903%** | **0.384398%** |

In the two right-hand columns, **none of Artazon, Capture Energy or TM: Evolution is in the first eight**, so Guzma & Hala has to tutor all three from the real remaining deck. Each of those three resource types must survive the six random Prizes. The 0.589903% / 0.384398% bottom-right values are therefore **strict subsets** of plausible Stage2 assembly opportunities with a two-connector physical discard payment. They are neither the probability of completing the entire line nor a lower bound on match wins. Other hands may pay the two discards with strategically acceptable nonconnectors, and other lines may find the pieces using Items, draw, already-held Trainers or natural Bench Basics. Additional cards can make two-spare-connector hands good or bad for future turns.

The exact broad 1-connector results closely reproduce Agent7's 40-million-deal Monte Carlo **13.64909% rank 2 / 11.34296% rank 15**. This is a numerical cross-check against a separate implementation, with the small differences attributable to finite sampling.

## Method and reproducibility

[Exact runnable CommonJS source](../../scripts/agent40-gh-capture-exact.cjs) and [four regression tests](../../tests/agent40-gh-capture-exact.test.cjs) use BigInt binomial coefficients. Both mathematical and source-data tests passed under **manual Actions run [41751370574](https://github.com/FlareZ123/experiment-01/actions/runs/41751370574)** at research commit **62aa9453b521f577246715743dffa1e52e9cbcbf**. This is a whole-workflow **SUCCESS** with source-pinned 60-card and 14-Basic verification, twelve exact rational regressions, subset monotonicity and an independent small-deck exhaustive Prize polynomial. The first attempt [41751280414](https://github.com/FlareZ123/experiment-01/actions/runs/41751280414) correctly failed a **mistyped source blob identifier** in the new script; the identifier was corrected without altering any fraction or card count before the passing run. No Twinleaf engine was needed for this pure combinatorial proof.

For completeness, fix the **unordered first eight** category counts as a vector h. The number of physical eight-card subsets with that composition is the product of C(c_i,h_i) across all 13 disjoint categories. Conditional on those eight cards, the six Prizes are chosen uniformly from the remaining 52. Each group that must still have a searchable card in deck has r_i = c_i - h_i remaining copies. The number of Prize subsets leaving every such group represented is the coefficient of x^6 in:

(1 + x)^(52 - sum r_i) × product_i [ (1 + x)^(r_i) - x^(r_i) ].

The first-seven Bunnelby requirement contributes an ordering factor **7/8** if exactly one Bunnelby appears in the first eight, or 1 if both appear. Weight each h by its physical multiplicity, enforce the connector threshold and optional three-target-absent restriction, divide by C(60,8)C(52,6), and finally condition on a Basic-valid first seven. This is an exact count of the stated subset under uniformly shuffled paper physical cards, including all six Prize identities jointly. The code stores reduced exact numerator and denominator for all twelve rows and prints their decimal rates.

The small-deck regression checks the Prize polynomial against all ways to select 0 through 8 Prizes from an eight-card toy distribution with three required groups. This independently checks the requirement to retain **at least one unprized copy** in every named search group, as opposed to treating hidden Prize probabilities independently.

## Decision-relevant interpretation and next falsification

The broad access event is more than thirteen percent for rank 2 but certifies no strategically affordable two-discard Guzma & Hala payment. Its most tightly specified **three-channel / two-extra-connector** subset is under one percent. That difference is a tractable example of the state-dependent DCI and AMR distinction in [human_concepts.md](../../resources/human_concepts.md), as well as Supporter and connector opportunity costs. It is **not evidence** that all openings outside the narrow subset are unplayable, bad or lost; the narrow gate is intentionally conservative.

An owner-visible natural-game policy still needs to select Tag Call or Guzma & Hala, choose its actual two discard cards, tutor correct resources, fill Bench slots, equip and attack twice, and handle an informed original opponent's response under full printed timing. Record the number and identity of strategically sacrificed cards and **all** negative cases, not just staged successes. Compare the complete fixed original 60 and any proposed challenger across the entire source field only after the common-policy fidelity gate. This exact calculation can be used as a **source-preserved triage/stratification denominator**, never as a qualified game win-rate estimate.

**Status:** original rank2 and rank15 source-pinned exact physical event counts certified by CI; actual game conversion, optimized fixed 60 and 99.5% benchmark remain unproven.
