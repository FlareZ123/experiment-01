# Rank-11 Quick Ball connector contention: first-turn Garbodor lock vs Dark Patch Mega Absol staging

**Agent 21 | 29 October 2026 | exact finite-card-location study. No game decisions, native Store simulations, wins or competitively qualified games.**

## Strategic question

The [Prize-aware Quick Ball-only Garbodor frontier](agent21-rank11-quickball-prize-frontier-20261029.md) identified a disjoint additional **2.11122892%** of original-seven/first-draw hands with held **Boost Shake + a suitable Tool + Quick Ball**, neither hand Trubbish nor Battle VIP Pass, and searchable **Trubbish and Garbodor after six Prizes**. The shared source policy already executes the direct hand Trubbish/VIP version, but does not explicitly choose Quick Ball-only access.

However, [Agent10's prior original-source tactical analysis](agent10-rank11-quickball-darkpatch-opening-20261021.md) independently established a different Quick Ball line using a Darkness Energy discard to fund **Dark Patch** onto a Benched **Mega Absol ex**. The prior exact unrestricted Quick Ball + Dark Patch + Darkness setup-access event is **7.69747120%** under its own conditions. **Using the same physical Quick Ball to fetch two missing Basic Pokémon is impossible.** How often do the narrower Boost-Quick-only hands actually overlap the Dark Patch resources and create a connector choice?

## Exact event definitions

Original rank-11 60 physical groups, derived from [the registered printing manifest](full-decklists.json): `(Trubbish 2, Garbodor 2, Boost 2, eligible Tool 6, Quick Ball 4, VIP 4, Dark Patch 3, Darkness Energy 8, Mega Absol ex 3, other Basic 6, other 20)`.

Use one uniformly random original seven conditioned on at least one Basic, one ordinary first-turn draw and six uniformly random Prizes. For the **Quick-only Boost route**, require held Boost+Tool+Quick, zero hand Trubbish and zero VIP, and at least one searchable Trubbish and Garbodor after Prizes. For the overlap, additionally require **Dark Patch and Darkness Energy in the first eight**. Then partition overlap by whether a Mega Absol is **already bench-eligible from the hand**, or must be searched from the live deck. Bench-eligible means the first seven could start a *different Basic* Active or there are at least two held Mega Absol after the first draw; the sole forced-Active Mega cannot receive Dark Patch.

If Mega must be fetched, ensure **unprized searchable Mega Absol** alongside Trubbish/Garbodor by a three-target inclusion-exclusion formula. A case with exactly one held Quick Ball then has mutually exclusive immediate **Trubbish** and **Mega Absol** search choices under these two *named* routes. Two held Quick Ball copies may search both but require two paid discards, with sequencing and other costs still unresolved.

Exact denominator `[C(60,7)-C(49,7)]×53×C(52,6) = 324,031,005,021,884,160`.

| Exact Prize-searchable original-eight event | Configurations | Probability |
| --- | ---: | ---: |
| Quick-only Boost + Tool + searchable Trubbish/Garbodor | 6,841,036,302,154,704 | **2.11122892%** |
| Above plus held Dark Patch and Darkness | 887,394,561,799,680 | **0.27386100%** |
| Overlap with an already **bench-eligible held Mega Absol** | 117,605,890,455,552 | **0.03629464%** |
| Overlap, **exactly one Quick**, Mega not currently bench-eligible but searchable after Prizes | 697,245,824,110,176 | **0.21517874%** |
| Overlap, **at least two Quick**, Mega not currently bench-eligible but searchable | 69,338,151,492,192 | **0.02139862%** |
| Overlap with no bench-eligible held Mega and no searchable Mega left | 3,204,695,741,760 | **0.00098900%** |

The last four rows **partition** the 0.273861% overlapping event. The same-Quick **named-target conflict** occurs in **10.1921%** of the prize-safe Quick-only Boost subset, or **78.5722%** of its smaller Dark-Patch+Energy overlap. These are card-location intersections, not probabilities of an *actual* strategic decision, of a deck becoming worse, or of an unreachable Mega attack.

## Interpretation for opportunity-aware source policies

A card-search hypergraph that marks the same Quick Ball as accessing Trubbish/Garbodor lock **and** Mega Absol/Dark Patch acceleration may double-count one physical resource. In the **0.21518%** subset above, a *single held* Quick Ball cannot search both missing Basic targets in the named source lines, even when both are in the searchable deck. This is a concrete numerical connector-contention class. It is small relative to the raw **2.11123%** Quick-only additional lock resource event. A model must compare the value of a quick lock against attacking tempo and the possibility of paying the Quick discard with Darkness to activate Dark Patch, rather than mechanically rewarding both graph paths.

**Limitations:** the actual source has other connectors and potential later draws, a held Crobat V can be another Benched Darkness recipient, and a one-Quick Trubbish search might **itself** discard Darkness and support a Dark Patch attachment elsewhere on the same turn. A held Mega can be actively Benched before Boost Shake, though Boost Shake then ends the turn. No source policy has been demonstrated to encounter or mishandle the counted subset, and no claim of universal connector conflict or optimal choice follows. The result excludes early Item lock, Bench crowding, actual discardability, K0 versus K1 search information, alternative tools, Prize recovery and opponent tactical reply.

## Reproduction

[Standalone CommonJS BigInt classifier](../../scripts/agent21-rank11-quickball-connector-contention.cjs) evaluates the exact eleven-category multivariate hypergeometric seven/eighth compositions, with a generic inclusion-exclusion subroutine for two and three simultaneous searchable target groups. Its [four focused pure regressions](../../tests/agent21-rank11-quickball-connector-contention.test.cjs) passed **4/4** locally in Node v22.16.0 against the same separately reconstructed original-source count fixture. It reproduces the independent **6,841,036,302,154,704** Quick-only numerator from the first enumerator, independently partitions the 0.273861% overlap, and checks the source's eleven-group 60-card partition. No compiled Twinleaf execution is claimed.

**Actionable next step:** attach actual first-source-decision owner-visible hand and Bench K0 telemetry, inspect whether a unique Quick Ball is relevant for multiple payable lines, and only then adjudicate the live K1 searched targets and accepted native Store sequence. Use the common original-source policy and preserve any stronger Dark Patch/Garbodor alternatives rather than interpreting theoretical paths as additive success probabilities.

**Benchmark:** 29/32 verified exact opponent 60s, zero competitively qualified games, no 99.5% fixed deck demonstrated.
