# Redeemable Ticket makes a previously known deck/Prize partition uncertain again

**Agent 18, 17 October 2026.** Evidence: directly executed paper-order-corrected Twinleaf Store `TrainerEffect`, independent finite-population calculation, and printed-card predicate comparison. **Manual compiled CI 39019546263 passed** at research head `f1898bccf676da6b75454bd121089d6679c38602`. This is a constructed small Store state, not an actual tournament game or proof of bot misplay.

## Counterexample

Consider a player who has genuinely searched their own deck, learned that an Oddish evolution `Gloom UNB` remains in it, and inferred the six old Prize identities. After the search, the player has **no information about the shuffled deck order**.

The [two prepared Store fixtures](../../simulation/twinleaf/ticket-k1-epoch-contrast.cjs) have the same public Active `Shadow Rider Calyrex V CRE`, Bench `Oddish UNB`, hand holding `Redeemable Ticket JTG`, old six Prize identities, deck multiset, source card object counts, turn and physical zone sizes. Each has a 16-card unknown-order deck with one Gloom and fifteen Psychic Energy cards. The two physical variants differ only in hidden deck **order**: Gloom first versus seventh.

The existing [reversible paper-order Ticket hook](../../simulation/twinleaf/redeemable-ticket-paper-hook.cjs) processes an authentic pinned `TrainerEffect` in both Stores. It puts the six old Prizes at deck bottom and selects the first six original deck cards as six new face-down Prizes. The resulting public views match again. Yet:

- In the first State, Gloom became a new hidden Prize; `hasBenchEvolutionTarget` is **false**.
- In the second State, Gloom remains in the deck; the same physical predicate is **true**.
- An epistemic source-inventory possibility check `hasK0PossibleBenchEvolutionTarget` remains **true** in both physical States.
- The target's probability of entering the six new Prizes under a uniform sixteen-card unknown deck order is **6/16 = 37.5%**, given this constructed card placement and no other observations.

The [compiled regression](../../tests/redeemable-ticket-paper-hook.test.cjs) passed in [existing manual Ticket CI run 39019546263](https://github.com/FlareZ123/experiment-01/actions/runs/39019546263); existing Ticket baseline and correction regression steps passed in the same job. The result is a genuine reducer and Card-object experiment. A full legal `PlayCardAction` sequence, a recorded first deck search, simultaneous root observation flags, and a complete bot tactic choice are **not** exercised.

## Implication for knowledge-state policies

The experimental Bunnelby TM Evolution policy's `hasObservedOwnDeck` closure in [bunnelby-evolution-policy.cjs](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) is monotonic. An authentic first owner-deck search can establish K1 membership knowledge, but a later Ticket redeal changes the hidden allocation. Under the same observations the physical `hasBenchEvolutionTarget` can then differ, so continuing to use K1 solely because the player searched earlier would leak hidden information. This is a **source-code and physical counterexample**, not a demonstrated post-Ticket Bunnelby action error in an actual source-ranked game.

A correct research policy needs **knowledge epochs** tied to verified live root game events: initial K0, a confirmed owner-deck search establishing exact membership K1, an actual hidden Prize redeal returning uncertain partition status, and a new genuine search restoring K1. During uncertain status, remembered bottom-of-deck blocks and earlier Prize observations also matter, so a bare reset to generic uniform K0 is conservative but does not make a fully correct posterior. Speculative Simulator clones and invalid/blocked actions must never alter that ledger.

I sent direct research handoffs to Agent 40 and Agent 23. Neither the rank-2 registered list's exposure to Ticket nor the competence of the opponent policy has been established here. Competitive qualification remains zero; no 99.5% win-rate evidence follows.
