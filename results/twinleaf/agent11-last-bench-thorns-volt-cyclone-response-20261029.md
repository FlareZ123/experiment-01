# Staged last-Bench decision followed by printed rank-6 Volt Cyclone pressure

Agent 11, 29 October 2026. This extends the [two-seat native Dedenne/Regidrago final-Bench test](agent11-last-bench-thorns-native-fork-20261029.md). It remains a staged mechanics experiment, not a natural original-60 deal.

## Registered physical stage

Construct two identical genuine Store positions for each owner seat. Opponent Active `Iron Thorns ex TWM` has attached printed `Speed Lightning Energy RCL` and `Double Colorless Energy SUM`, both present in the rank-6 original Aichi 60. Opponent has no Benched Pokémon. Owner Active is printed `Regidrago V SIT`, owner Bench has four other original rank-10-compatible Basic Pokémon and one free slot, hand `[Dedenne GX UNB, Regidrago V SIT]`. All identities come from actual pinned CardManager. Two branches start from equal detached owner observations.

The original first-return actor chooser selects Dedenne to the last Bench slot; another genuine native branch benches Regidrago V. With the existing reversible Entry Draw lock fix, Dedenne's setup Ability remains suppressed under opposing Iron Thorns Initialization. After both accepted native plays, manually end the owner turn with `PassTurnAction`. The next genuine player must be the rank-6 Iron Thorns actor. Have that actor use the printed `Volt Cyclone` `AttackAction`; settle only native WaitPrompts. The attached Speed Lightning and Double Colorless Energy jointly meet the printed Lightning+Colorless+Colorless cost. No target prompts are expected because opposing Iron Thorns has no Bench to receive transferred Energy. The active Regidrago V is expected to survive 140 damage in both forks.

Assertions require a matching source-action response, physical surviving final Bench identity, no unresolved prompt or engine exception, equal damage across both branches and next owner turn chronology. This confirms only reachability and sequencing, with a **manually selected opponent attack**. It is no proof of a strategically competent source AI or tournament performance.

## Reproduction

- [Native two-seat continuation](../../simulation/twinleaf/agent11-last-bench-volt-cyclone-reply.cjs), imports the established staged Store builder.
- Same existing [manual Twinleaf smoke workflow](../../.github/workflows/twinleaf-smoke.yml); new step placed immediately after the original last-Bench positive test.
- [CI 40976878330](https://github.com/FlareZ123/experiment-01/actions/runs/40976878330), dispatched at commit `77ee378a23ae908cc49545e04646c511838be6b7`. The **new printed Volt Cyclone reply test step passed** after compilation, including both actual owner seats, true native PassTurnAction, source opponent AttackAction and expected 140 damage on Regidrago V in each branch. This is a completed native action-continuation witness, though the full reused smoke workflow can still fail independently at an existing Canceling Cologne regression. Treat step-level passage separately from overall workflow status.

## Interpretation

The fixed 60-card source decks are verified only as original printing inventory, not dealt here. Opponent reply is **scripted** to prove native pressure; no autonomous policy, true source-deal frequency, alternate response quality, paper event-clock or competitive victory can be inferred. A broader integrated policy needs natural owner-visible Bench contention, a genuine source opponent choice and real tactical alternatives. Exact original Aichi lists remain 29/32, with 23/25/28 missing and zero qualified games.
