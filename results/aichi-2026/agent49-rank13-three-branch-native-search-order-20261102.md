# Agent 49: native rank-13 two-Item connector choice, including the corrective third branch

**2 November 2026.** This is a controlled, source-printing-grounded two-seat native Store reachability comparison. It is **not** a natural-dealt original-source 60-card game, a released opponent policy, a competitive win or a proof of the optimal Item order.

## Setup and witnessed action branches

The rank-13 original authenticated 60 supplies both Item families and the donor printings. In each staged physical seat, the active Pokémon is a printed Latias ex SSP, Regidrago V is absent from play, there is a free Bench slot, and the owner holds:

`Quick Ball FST + Mysterious Treasure FLI + Salamence ex JTG + Dragapult ex TWM`.

The native deck is deliberately seeded with available `Regidrago V SIT`, `Regidrago VSTAR SIT` and `Budew ASC`. The remaining staged physical zones are test scaffolding, not a genuine original 60 deal. All branches start from the **same owner-visible first-root hand and board geometry** and are run separately in both physical seats.

| Deliberate first Item / target, then second Item / target | Native Regidrago V Benched | Held Regidrago VSTAR | Held Budew |
| --- | --- | --- | --- |
| Quick Ball searches V, then Mysterious Treasure searches VSTAR | Yes | **Yes** | No |
| Mysterious Treasure searches V, then Quick Ball searches Budew | Yes | No | **Yes** |
| **Mysterious Treasure searches VSTAR, then Quick Ball searches V** | Yes | **Yes** | No |

All six staged branches correctly paid **both** physical Dragon donors into discard, finalized **both** native Items into discard, settled prompt queues, searched actual owner-deck targets, and put V onto Bench. Both physical-seat tests passed: [compiled CI 41488502423](https://github.com/FlareZ123/experiment-01/actions/runs/41488502423), [runnable regression](../../tests/agent49-rank13-dual-connector-native.test.cjs). The last branch is the critical corrective counterexample. A simple recommendation to **always play Quick Ball first** would have been false: the same two targets can be reached by **Treasure-first** when its initial search takes VSTAR.

## Actual policy gap

The source printings can carry out all three branches, and a later selected actor policy is a separate question. The current [registered Treasure root](../../simulation/twinleaf/agent49-registered-treasure-early-setup.cjs) prefers an early donor payment to find first Regidrago V, while its [owner-authenticated prompt bridge](../../simulation/twinleaf/agent49-mysterious-treasure-prompt-continuation.cjs) prioritizes **Regidrago V** from a legal deck search whenever the player has no Regidrago in play. With Quick Ball and another donor also held, this first target choice can forgo the alternative Treasure-first VSTAR line. The [rank13 donor Quick Ball helper](../../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs) is designed to reject spending a donor on another first-V search after Regidrago is already in play, but can propose a later Quick Ball if the earlier Treasure instead finds VSTAR and there is still no V in play.

The native third branch confirms that a **K1 search-target selection** could be context-aware: at a real owner-deck prompt, check both V and VSTAR are physically search-eligible, that Quick Ball and its discard payment survive in the own hand, that no V is already in play or held, and that a Bench spot remains. Only then consider VSTAR first. K0 must not guess Prize identities; K1 is granted the actual owner-deck search. All search actions remain subject to native validation and competing use of the same held cards.

## Methods and limitations

Tests dispatch the **real pinned native Store** with physical original-printed cards; `ChooseCardsPrompt.validate` validates each payment and target. Quick Ball may auto-discard a sole other held card without emitting a separate payment prompt; the test therefore requires the **physical donor in discard** and native Item finality, avoiding an invalid assumption that every legal payment presents two prompts. The initial CI [41487025148](https://github.com/FlareZ123/experiment-01/actions/runs/41487025148) failed because the test mistook Quick Ball's offered owner-hand CardList for the owner's exact hand container. The corrected prompt provenance check requires the offered Card instance to remain physically in the authenticated owner's zone. Corrected compiled CI [41487926664](https://github.com/FlareZ123/experiment-01/actions/runs/41487926664) passed the original two branches, and the new third-branch CI passed both seats.

The exact mathematical [opener envelope](agent49-rank13-dual-connector-opening-envelope-20261102.md) shows only 248,388 of 300,306,336 Basic-valid seven-card initial hands match the **two-donor, two-Item, no-V** ingredient requirements, before any game has occurred. Its 99.74758% post-Prize two-target reach probability is a conditional *physical* statistic. No actual opponent decision, turn-to-turn VSTAR evolution, copied attack, match-clock legality, deckwide matchup coverage or competitive win is demonstrated.

**Next experiment:** compare the existing Treasure search-target policy with a preregistered K1 context-aware choice within the same full bilateral actor policy, with original physical deals, both seats, actual full native line and opponent continuation. Evaluate all attempts and failures. No baseline win-rate improvement or fixed-deck superiority has been established.
