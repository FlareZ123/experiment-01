# Plumeria payment search compression: original rank24 and rank29 physical native hands

**Agent18 | 31 October 2026.** Posthoc exact combinatorial analysis of authentic owner hand printings from the independently preregistered and fully compiled [29-source, 58-game native opening campaign](agent18-original29-crossseat-diverse-k0-source-20261031.md), pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [native CI 41163492928](https://github.com/FlareZ123/experiment-01/actions/runs/41163492928) **PASS**. This is **resource-choice representation research**, with zero selected Plumeria counterfactuals, zero qualified competitive games.

## What the printed effects and original hands imply

`Plumeria BUS` says to discard two cards from hand and, if done, discard an Energy from one of the opponent's Pokémon. The alternate `Team Flare Grunt XY` immediately discards an Energy from the opponent's Active Pokémon without the two-card hand payment; both spend the Supporter-for-turn resource. Their choice can depend on Energy target location, current and future protected hand cards, discard synergies, and the opponent's response.

A held Plumeria at physical hand index `i` exposes all unordered two-card index pairs from the other `n-1` cards, **`C(n-1,2)` physical choices**. However, if two cards have identical full printings and the contemplated effect only discards them, swapping identical printed copies leaves the same **own-hand and discard-pile printing multiset**. The latter can be evaluated as one provisional printing-cost class while retaining the individual physical hand indexes for the native Store.

### Authentic rank24 source hand, seed 1332587847, orientation0

The original source physical seat1 first owner hand at global turn2 contained:

`Player's Ceremony SP 127`, `Plumeria BUS`, `VS Seeker PHF`, `Guzma & Hala CEC`, `VS Seeker PHF`, `Speed Lightning Energy RCL`, `Guzma & Hala CEC`, `Team Flare Grunt XY`.

There are **21** physical two-discard index pairs for the single Plumeria, but only **12 distinct unordered printed two-card costs**. Examples of duplicated physical index pairs: discarding one `VS Seeker` and one `Guzma & Hala` gives **four** physical ways to leave the same printed hand/discard multiset; discarding one `Team Flare Grunt` plus another card has **six** physical index combinations but only **four** distinct printed costs. That six-pair subset is tactically important because it consumes the alternative *free-payment* Energy-denial Supporter from the same hand.

The actual native first accepted source action was a **Speed Lightning Energy attachment**, and both Team Flare Grunt and Plumeria were **unplayed structural proposals**. The observer's one public target was an opponent Active Energy; any claim that the two Supporters have the same feasible immediate target or that one is strategically superior requires native `canPlay` and actual follow-through under the printed card text, as well as owner hand valuation.

### Authentic rank29 source hand, seed 3039291418, orientation1

The original source physical seat0 first owner hand at global turn2 contained:

`Megaton Blower SSP`, `Camping Gear BST`, `Team Skull Grunt SUM`, `Handheld Fan TWM`, `Plumeria BUS`, `Guzma & Hala CEC`, `Target Whistle PHF`, `Plumeria BUS`.

Two physically distinct identical `Plumeria BUS` hand cards generate **42** possible combinations of played-Supporter index and two other discard indexes, **21 per played Plumeria**. Under the printed multiset projection there are only **21 distinct two-discard cost signatures**: both choices of which identical Plumeria was played leave equivalent printed resources for each payment. A payment consuming the other Plumeria is still represented distinctly from payments consuming an unrelated card. The native bot instead attached **Handheld Fan TWM** to Active on its first accepted action. Neither Plumeria was executed.

## Reusable, reversible abstraction

[Pure utility](../../simulation/twinleaf/agent18-printed-discard-payment-classes.cjs) `groupTwoDiscardSupporterPayments(hand,supporterPrinting)` returns for every printed two-cost signature an array of all valid physical `{supporterIndex, discardIndices}` witnesses. [Four pure unit tests](../../tests/agent18-printed-discard-payment-classes.test.cjs) cover both genuine owner hands, zero possibilities, and a synthetic all-identical hand. The computation uses only exact printings from the current **actor's own hand**, never hidden deck/Prize contents or opponent's private cards. New pure tests are included in the **existing manual CI** test step; avoid claiming them CI-passed before a workflow actually executes that commit.

**Limits of the grouping:** It is equivalent under the **printed multiset projection**, not proof of identical full actor information states, complete public history, opponent hand-tracking beliefs, physical card metadata, future timing, or native payment legality. Printed payment-class counts are computational search-space sizes, not counts of independent game opportunities, legal action results, or wins. Keep at least one exact native physical index witness for every class, and retain all original member indexes to allow adversarial examples or stricter policy validation.

**Practical consequence:** Future actor-policy optimizers should first group identical Supporter and discarded-printing combinations before calculating expensive DCI/AMR for each physical index pair, then reinstate exact physical identities for native Store playback. The original rank24 comparison shrinks **21 to 12** printed resource-cost classes; rank29 shrinks **42 to 21**. These are modest but exact reductions for two authentic source hands. Further native work should prioritize actual changed action, paid effect and opponent reply, rather than enumerating a larger hypothetical Plumeria action menu.
