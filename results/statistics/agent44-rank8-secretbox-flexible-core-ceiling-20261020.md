# Rank-8 Secret Box → Boost Shake: structural flexibility versus an overconstrained policy gate

**Agent 44, 20 October 2026. Evidence class: exact finite-deck probability, paper card text and strategy-line hypothesis. No actual full-game conversion or competitive win-rate claim.**

## Research question

The rank-8 Absol/Garbodor opponent's [existing conditional early Tool-Garbodor policy](../../simulation/twinleaf/rank8-boostshake-autonomous-policy.cjs) requires Secret Box, Boost Shake **and Float Stone held simultaneously**, three cards with separate eligible discard names, and an empty Bench slot. [Agent 7's exact source-locked calculation](rank8-secret-box-early-conditional-core.md) finds this *specific first-eight card-only predicate* with probability **85787/379377339 = 0.0226125788710%**, conditional on an initial legal seven containing a Basic. In the [preregistered sixteen-deal native panel](../aichi-2026/agent7-rank8-hood-pressure-registered-complete.md), it triggered 0/16. That observation is a negative for **the frozen stringent policy**, rather than evidence against other legal Secret Box lines.

The published rank-8 60 contains **10 Basic Pokémon, 1 Secret Box, 1 Boost Shake, 4 Float Stone, 4 Quick Ball, 2 Trubbish and 2 Garbodor**. The supplied card database prints Secret Box (TWM163) as an ACE SPEC Item requiring three other hand cards discarded, then searching an Item, Pokémon Tool, Supporter and Stadium; Boost Shake (EVS142) searches a compatible Evolution Pokémon and evolves it, explicitly allowing the first turn/turn played and ending the turn. These wordings suggest an alternate route when Secret Box and Boost Shake are both held while Float Stone and Quick Ball remain searchable.

## Exact weaker necessary hand condition

Consider an opening starting seven with at least one of rank-8's ten Basics, followed by six unseen random Prizes and the next ordinary draw. Examine the initial seven plus that draw; require **both singleton Secret Box and singleton Boost Shake**, with no other hand or game conditions. Random Prize placement does not alter the marginal distribution of this one next draw.

Let `C(n,k)` denote a binomial coefficient. Because these two singletons are non-Basic, there are two disjoint cases:

- Both in the original seven: select five other cards including at least one Basic and let the eighth be any of the 53 remaining card identities. Favorable ordered-start/next-draw pairs: `53 × (C(58,5) − C(48,5))`.
- Exactly one in the original seven, the other on the next draw: two choices for which singleton is held, with six other original-seven cards including a Basic. Favorable pairs: `2 × (C(58,6) − C(48,6))`.

The legal starting-seven and next-draw denominator is `53 × (C(60,7) − C(50,7))`.

| Hand-only event | Exact fraction | Probability |
| --- | --- | ---: |
| Initial Basic-valid seven | `216911/292581` | 74.1370765702% |
| Both unique Items seen by first normal draw, *and* Basic-valid original seven, unconditional | `789802/77533965` | 1.0186529220% |
| Both unique Items seen, **conditional on Basic-valid original seven** | **`789802/57481415`** | **1.3740128005%** |
| Prior policy's stricter opening predicate, same legal-seven condition | `85787/379377339` | 0.0226125789% |

This relaxed **hand-only super-event is approximately 60.76× as frequent** as the previously modeled rigid policy predicate. The ratio is between precisely defined opening events, **not** a prediction that in-game lock frequency or win probability rises 60-fold.

The favorable-pair count is **208,507,728** and the legal-pair denominator **15,175,093,560**, simplifying exactly to the fraction above. These results are deterministically reproduced by [`rank8_flexible_box_shake_ceiling()`](../../scripts/rank8_hood_core_early_exact.py) and tests under [`test_rank8_hood_core_early_exact.py`](../../tests/test_rank8_hood_core_early_exact.py), including an exhaustive physical-deal enumeration in a smaller eight-card toy universe. The existing stricter exact fractions remain unchanged. Existing manual-only [opening audit CI 39439677192](https://github.com/FlareZ123/experiment-01/actions/runs/39439677192) **passed at commit `ecabdc593f246de3be6cceace850640b92aaed40`**, including the updated source-specific tests.

## Mechanically plausible owner-information-safe line

At the beginning of the player's own first turn, a Basic-valid original seven can put **only one Basic into the Active** at setup, preserving other cards in hand. After the ordinary draw the player then holds seven cards. If they include Secret Box and Boost Shake, five other cards remain. Discarding three of those pays the *physical* Secret Box cost, leaving Boost Shake and two other cards, **before** accounting for searched cards.

In a deck-search prompt actually created by that Secret Box play, the owner can search for **Quick Ball** as its Item and **Float Stone** as its Pokémon Tool, provided those copies are still in their deck. With an open Bench slot, Quick Ball can discard one of the two other preserved cards to search a still-accessible Trubbish; that Trubbish can be Benched and equipped with Float Stone. The owner can then play held Boost Shake to evolve Trubbish to an accessible Garbodor and end their turn. A held Trubbish, Quick Ball, or Float Stone could instead remove a search requirement. Other eligible Tool printings (such as the source's Muscle Band) may also enable Garbotoxin, but are a separate branch.

This is a **card-text construction**, contingent on the actual owner-visible prompt, native legality and Prize configuration. It may be strategically unacceptable to pay three Secret Box discards and another Quick Ball discard. For example, the remaining five cards could contain vital singleton resources that should be preserved under a realistic discard-capability model. Item-lock, Bench occupancy, an inaccessible Garbodor, interrupted searches, or other opponent pressure can prevent the line. A theoretically solvable hand is not an established optimal or reliably executable tactic.

Search opportunity costs are central: Secret Box's Item and Tool categories must be compared with competing uses; fetching Quick Ball and Float Stone could preclude a stronger attack or recovery line. If Crispin can be retrieved as the separate Supporter category and legitimately played before Boost Shake, the [one-retrospective-deal Claw continuation](../aichi-2026/agent44-rank8-crispin-three-settled-claws-20261020.md) shows a paid subsequent attack exists, but **Crispin availability, legal one-Supporter timing and different Basic Energy types introduce further independent conditions**. The current 1.374% event ignores all of these.

## Implications for fixed-deck research

The original 0/16 trigger panel is correctly negative for its frozen, **rigid** policy. It cannot exclude flexible search-access lines that retrieve missing Tool or Item categories after an actual owner-authorized Secret Box search. The measured rigid-vs-flexible first-eight disparity gives an actionable **policy-design warning**, while established direct Trubbish + Boost Shake + Tool lines from [the any-compatible-Tool audit](../../scripts/aichi-absol-any-tool-first-turn.cjs) are a different and overlapping resource event. Do **not** add the probabilities of these routes as though they were disjoint.

The next experimental discriminator is a **reversible, actor-observation-safe source policy** that attempts these flexible prompt choices without assuming future deck content, with native Store acceptance, K0/K1 information boundaries, original-source root parity for no-op trials and all no-trigger/abort cases retained. A source-first pressure-to-candidate-response continuation under the shared bilateral policy would be substantially more informative than repeating selected positive seeds. No paper-clock or decision competence qualification follows from this static analysis.

The wider benchmark remains at the currently documented **29/32 exact source 60s and zero competitively qualified games**; no evidence here changes the fixed-deck nomination or supports the 99.5% objective.
