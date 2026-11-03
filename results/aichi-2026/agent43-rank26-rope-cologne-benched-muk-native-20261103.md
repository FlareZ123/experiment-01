# Agent43: original rank26 Rope→Cologne suppression of sole Bench Muk in pinned native Store

**3 November 2026 | branch staged printed-Item proof and exact opening combinatorics | no qualified game.**

## Research question

The structural [Apex Alchemy v0 fixed 60](agent43-apex-alchemy-structural-candidate-20261102.md) can evolve Benched Alolan Grimer SUM57 into Benched Alolan Muk SUM58 via Boost Shake EVS142. A Benched Muk removes all Basic Pokémon Abilities, including original rank26 Exeggcute PLF4's discard-pile Propagation. Original Aichi rank26 Meloetta Donk authentically contains **one Escape Rope BST125 and one Canceling Cologne ASR136**. Does rank26's physically held Rope+Cologne chain counter a sole Benched Muk, and does a second opposing Bench Pokémon change the outcome?

The printed sequence has a precise opponent-choice branch. Escape Rope makes **the opponent choose** which of their Benched Pokémon to promote. Canceling Cologne removes Abilities from the **opponent's Active Pokémon** only. Source Exeggcute's Propagation must then be evaluated with the actual live Muk position. A Bench Muk itself remains effective if Rope does not promote it.

## Actual pinned-native four-arm counterfactual

Used [PR22](https://github.com/FlareZ123/experiment-01/pull/22) staged native test `tests/agent43-muk-exeggcute-crosszone.native.test.cjs`, appended function `ropeCologneContinuation`. Actual exact head `60b9fdc057b0e0bcf71d4b667dbce14078dd6f33` on research branch `agent43-muk-discard-propagation-native-20261103`, original vendor pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Manual GitHub Actions run 41717738138](https://github.com/FlareZ123/experiment-01/actions/runs/41717738138) **SUCCEEDED**. One native script contains **17/17 passing tests**, including the four new cases; the other 13 existing cases remain separately documented in [original Muk/Propagation report](agent43-muk-propagation-staged-native-20261103.md).

Both seats staged original rank26 source active Meloetta ex BLK44, source discard Exeggcute PLF4, source physical hand Escape Rope BST125 and Canceling Cologne ASR136; opposing Active Regidrago V SIT135 and opposing **Benched Muk** evolved from Grimer. A separate arm adds opposing Benched Lunatone OBF for real second Bench choice. All paper-relevant printings were pulled from the pinned native card catalog, with their physical IDs recorded. Each arm executed Store actions, not handwritten zone movements after setup: source paid Rope and resolved the opponent's native ChoosePokemonPrompt using the actual Pokémon card list; source then paid Cologne from the hand and dispatched discard-pile UseAbilityAction.

| Source seat | Opposing Bench geometry | Opponent native Rope choice | Physically paid Items | Source Exeggcute result |
| --- | --- | --- | --- | --- |
| 0 | **Only Muk** | Muk becomes Active | Both moved from hand to source discard | Propagation accepted, Exeggcute in hand |
| 1 | **Only Muk** | Muk becomes Active | Both moved from hand to source discard | Propagation accepted, Exeggcute in hand |
| 0 | Muk + Lunatone | Lunatone becomes Active; Muk stays Bench | Both moved from hand to source discard | `UNKNOWN_POWER`; Exeggcute stays discard |
| 1 | Muk + Lunatone | Lunatone becomes Active; Muk stays Bench | Both moved from hand to source discard | `UNKNOWN_POWER`; Exeggcute stays discard |

All four have **zero unresolved prompts**. Both Items are observably consumed; physical opposing Active is independently checked against chosen ID, and the actual source egg location is checked at the end. This is a precise two-seat card-mechanics and opponent-choice demonstration. The engineered source positions, deck/prize filler, and pre-staged opponent evolution make it **neither a natural match nor a certified optimal counterplay decision**.

## Exact limited opening-access screen

To check the rarity of a particularly narrow paper opportunity, I enumerated the original 60 card categories without any search, draw effects or opponent mulligan bonus. **Source:** 12 Basic Pokémon, singleton Escape Rope, singleton Cologne, 46 other cards. Require Basic-valid initial seven and both specific singleton Items in first seven plus one ordinary draw. **Candidate:** 2 Grimer, 2 Muk, 3 Boost Shake, 10 other Basic and 43 non-Basic other cards. Require *exactly* one Grimer and one non-Grimer Basic in initial seven (the other Basic can start Active and Grimer may sit as sole Bench), **non-Basic eighth draw**, first-eight Boost Shake, and a Muk remaining in deck after six random inaccessible Prizes. No search, extra draw, or alternative setup.

| Exact resource opportunity | Probability conditional on each own Basic-valid seven |
| --- | ---: |
| Original source first eight hold both Rope and Cologne | **1.402936631669264%** |
| Candidate direct sole Benched Grimer/Boost Shake and unprized Muk | **2.865152207599552%** |
| Independent product of those two narrow events, both Basic-valid | **0.040196269873495%** |

These figures were derived from multivariate hypergeometric first-eight compositions with exact first-seven/last-card weights, and separately checked by a rational-arithmetic **first-seven → eighth-card → six-Prize** enumeration using Python `fractions.Fraction`. The source category's Basic-valid first-seven weight is 0 if no Basic in eight, 7/8 if one in eight, otherwise 1. The candidate category's exactly two required Basics in seven and non-Basic eighth has conditional weight 6/8 in the eight-card composition. If `m` Muk remain outside the first eight, its deck survival probability is `1 - C(52-m,6-m)/C(52,6)`. Both independent enumeration orders agree. The reusable CJS functions `rank26DirectRopeCologneAccess()` and `candidateDirectSoleBenchMukAccess()` plus regression in `tests/agent43-muk-thorns-firstturn-collision.test.cjs` were committed to main, with candidate SHA `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769` unchanged.

The new CJS numerical regressions **passed** in the [manual global field gate run 41718628816](https://github.com/FlareZ123/experiment-01/actions/runs/41718628816): all three Agent43 Node test files were green. The overall job was **red** due to two separate Agent30 source-registration/public-Prize assertions, already reported to Agent30. Those assertions are unrelated to these exact arithmetic functions, but the run cannot be called a globally successful CI release.

The exact joint **0.04020%** is not the overall chance to have a counterline. It omits three Order Pad and four Trainers' Mail, any card searching/drawing, source Egg discard establishment, opponent mulligans, conditional source choice to play Rope, candidate choice to use Shake or put extra Basics on Bench, source going second, resources surviving later turns, locks on Items, and attack/KO consequences. Existing [Agent2 source Cologne access result](../statistics/agent2-rank26-mail-pad-cologne-joint-20261103.md) already finds far broader conditional singleton Cologne access once Pad/Mail are modeled. **No general probability of countering Muk, claiming a Prize or winning a game follows from the narrow product.**

## Decision impact and caveat

Sole Bench Muk is **conditionally exposed** to a two-Item escape from its own suppression, while an additional Benched Pokémon permits the opponent to avoid promoting Muk. The existence of additional Bench Pokémon also consumes scarce Bench slots and may create other gust/disruption liabilities. An optimizer must represent opposing target choice, physical Item custody, and downstream owner Ability activation rather than score generic Escape Rope/Cologne access as a uniform lock answer.

Agent2 previously reported `simulation/twinleaf/rank26-cologne-opener.cjs` recognizes Active Iron Thorns and Klefki but **does not** recognize opposing Active Muk. The staged witness establishes a real missing source-policy target class; it does not automatically establish a good source choice in every game. Sent detailed messages to Agents 2 and 50 to coordinate selected-policy response work and a two-Bench adversarial negative control.

**Status unchanged:** rank26 original 60 verified, 29/32 full original opponent lists, 0 qualified paper games, no selected best fixed 60, no demonstrated 99.5% field rate. The exact four added tests are staged native interaction proofs; their success must never be promoted to a matchup win sample.
