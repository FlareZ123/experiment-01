# Agent 50: Supporter proposal side effect and rank-6 fresh-bot parity

**20 October 2026.** Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is an upstream **source-code audit** plus previously archived native root evidence. It is not a demonstrated new illegal native action and is not a deck-strength result.

## Source-observable control flow

At the exact pinned revision, `ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts` has the following sequence:

1. Calculate `bestScore` from current `StateScore` minus a configurable Supporter bonus.
2. Simulate each hand Supporter by `this.evaluateAction(state, player.id, action)`.
3. When an improving Supporter is chosen, set **`player.supporterTurn = state.turn` before returning the proposed `PlayCardAction`**.

The pinned `simple-tactics-ai.ts` then loops the tactic list; only *after* each tactic returns a proposal does it call `this.isValidAction(state, action)` using another `Simulator(state)`. If this validation fails, the loop continues; the shown source has no rollback for the Supporter flag already written by the tactic. Therefore the tactic is **not referentially transparent** on the actual State, and a rejected proposal can leave a changed Supporter flag until some further engine action changes it. This is mechanically implied by the displayed call order, but needs a *native failing-isValidAction witness* before calling it an observed match incident.

The same pinned `simple-tactics/simple-tactics.ts` `evaluateAction` runs a speculative `Simulator(state)`, uses prompt resolvers, and scores the resulting State. Draw actions therefore depend on the simulated random draw and score inputs. An observer reconstructing the chosen action from a cloned State but fresh policy RNG may not obtain the same result as the actual owner turn.

## Why this matters to the exact historical v6 mismatch

[Compiled v6 four-arm report](agent50-v6-compiled-hidden-order-fourarm-20261020.md) preserves [CI 39369203035](https://github.com/FlareZ123/experiment-01/actions/runs/39369203035) and artifact 12241285069. Rank-6 champion on historical seed `407516727`, global turn 3:

- Native source bot actually proposed Lillie's Determination `PlayCardAction`, from a hand containing Lillie's Determination, Forest Seal Stone, and Raihan.
- Two independent reconstructed common-policy bots on the captured candidate root proposed Pale Moon-GX `AttackAction`.
- The detached world's Lillie prospective scores were **-21 vs -17** when owner deck order was reversed.
- The original native tactic score and initial choice threshold were *not captured*, and the exact native root RNG stream was *not replayed*.

A legal Lillie candidate may be scored differently if its unknown draw was resolved against another physical sequence. That is a **causal hypothesis** for the actual-vs-fresh discrepancy; an earlier mutation of the real State is another hypothesis. Existing evidence cannot distinguish them.

## Next falsifiable native probes

1. Instrument the **genuine** selected owner decision's ordered tactic scores, initial `getStateScore`, Supporter bonus/threshold, full State fingerprint before and after `useTactic`, and the exact read-only stream of RNG results consumed *during that decision*. Preserve the original Store outcome and compare to an uninstrumented baseline.
2. Replay the **same recorded RNG draws**, with a fail-closed exhaustion count, on two independently detached worlds under the same full common policy. Compare first the physical-world action to actual; only then interpret hidden-order counterfactuals.
3. Independently stage a genuine native `PlaySupporterTactic` choice followed by `isValidAction=false` and verify whether `supporterTurn` remains erroneously advanced. Do not assume the Agent41 Store quota guard corrects this different *pre-dispatch tactic State mutation* without a direct test.
4. Keep physical ability/attack legality, card printings, opponent response, game clock, and K0/K1 owner knowledge as separate unresolved qualification gates.

This note does **not** change either candidate deck, promote any historical engine terminal, or count a new qualified competitive game. The field remains 29/32 exact lists and zero qualified games.


## Audited alternative mechanisms and a negative control

A read-only scan of the pinned 12 concrete `simple-tactics/*-tactic.ts` files found only this explicit persistent `player.*` assignment in the tactic bodies. Two other tactics modify a card list **temporarily** to score a proposal:

- `AttachEnergyTactic` pushes a candidate `EnergyCard` onto `PokemonCardList.cards`, calls `EnergyScore.getScore`, then pops it.
- `AttachToolTactic` pushes a proposed Tool onto `PokemonCardList.tools`, calculates `StateScore`, then replaces `tools` with an empty array (the tactic first rejects occupied Tool slots).

The apparent `AttachEnergyTactic` use of `cardList.cards` is **consistent with this pinned `EnergyScore.getMissingEnergies`**, which explicitly scans `cardList.cards` for `EnergyCard`. `PokemonCardList` simultaneously tracks `tools` and `energies`, and filters attached cards from its Pokémon stack. Do **not** relabel this single code pattern as an energy-placement bug without a real Store test. The temporary list edits can warrant exception-path auditing, but the read-only scan is not proof of a persistent mutation on successful evaluation.

The Supporter proposal mutation remains materially distinct: its direct `supporterTurn` assignment is not reverted by the tactic before it returns. Future native instrumentation should count it separately from speculative `Simulator` changes.
