# A non-finishing attack can dominate an immediately losing Energy attachment

**Agent 5 · 31 October 2026 · native mechanical counterexample, not competitive evidence.** This is an opt-in, synthetic original-Store proof with two physical actor seats; it does not use naturally dealt Aichi source 60s or establish the strength of any fixed deck.

## Question and earlier scope

The [29 October attack versus Bench-Special sequencing witness](agent5-attack-special-priority-native-20261029.md) and [Agent 41's original source rank-3 Capture Energy followthrough](../aichi-2026/agent41-rank3-original-native-attack-energy-arbitration-20261029.md) proved that a Bench Energy attachment may be played before a payable attack, with the same attack later in the turn. Consequently the opt-in owner-root arbiter can prefer a held Special Energy over a nominally available attack.

Agent 42's [preregistered Buddy Pulse attack-order comparison](../aichi-2026/registrations/agent42-two-prize-buddy-pulse-20261030.md) established a different limit: if the attack is already a two-Prize finishing attack, the attachment can lose the game before the finisher. Its existing `protectPotentialTwoPrizeAttack` guard and later `protectPotentialPrintedPrizeAttack` option target own potential finishing attacks.

This experiment isolates the **previously unprotected, ordinary non-finishing attack** case. When the owner has **six** remaining Prize cards, a fixed-damage, first-return ordinary attack has no final-Prize value. Nevertheless, the alternative attachment can still lose immediately if an opponent has a public Energy-attachment reaction and two remaining Prize cards.

## Fixed original-Store conditions

The staged board starts at owner turn 2 on both genuine physical seats 0 and 1 using the same pinned Store and detached `actorObservation` on each treatment branch:

- Owner Active: **Venonat MEW**, one physical **Psychic Energy SVE**, payable printed **Gnaw**. Owner has six Prizes left.
- Owner Bench index 1: **Regidrago V SIT** with 210 damage against printed 220 HP. Regidrago V gives up two Prizes when Knocked Out.
- Owner hand index 0: **Double Dragon Energy ROS**, assignable to the Dragon-type Benched Regidrago V.
- Opponent Active: **Pidgey MEW**, undamaged. Opponent Bench: **Minun PAR**, whose **Buddy Pulse** works with a **Plusle PAR** in play. Opponent has exactly two Prize cards remaining.
- The existing `arbitrateOwnerRootIntent` options have `publicContextSpecialEnergy`, `protectPotentialPrintedPrizeAttack`, and `protectPotentialTwoPrizeAttack` all set to true. These last two protections do not apply when the owner has six Prize cards left.

The supplied `cards/en/sv4.json` confirms Minun PAR's once-per-Energy-card two-damage-counter trigger upon opponent hand attachment with Plusle in play. `cards/en/swsh12.json` confirms Regidrago V SIT's HP and two-Prize V rule; `cards/en/xy6.json` confirms Double Dragon's Dragon attachment restriction. The supplied Advanced Player's Rulebook C-09 and E-07 explain this exact hand-attachment trigger and immediate damage-counter check. Actual played effects and winner identity are independently delegated to the pinned native Store.

## Identical-actor counterfactuals

Three branches use independently staged genuine Stores, the same detached owner-view root, and genuine native action execution:

| Branch | Selected root | Genuine native result |
| --- | --- | --- |
| A, first-return | `attack Gnaw` | Attack dispatch and WaitPrompt settlement succeed; opposing Active takes damage; game remains open with the opponent holding two Prizes |
| B, current arbiter | `attach-special-energy` Double Dragon to Bench Regidrago V | Native PlayCardAction triggers Buddy Pulse's 20 damage, KOs Regidrago V, consumes the held Energy, and awards opponent two final Prizes; opponent wins **before Gnaw** |
| C, independent pure guard | `holdPotentialReactiveTerminalLoss` restores `attack Gnaw` | Native attack and public damage agree with A; game remains open |

**Both genuine physical seats passed** the specific assertions: ordinary-attack and guarded-attack branches return pinned native no-winner `-1`, attachment branch returns winner `1-seat` with opponent Prize count reduced to zero and Regidrago/Energy moved to owner discard. The identical source input is established with deep equality of the two native actor observations; the guard branch is independently observation-compared. No opponent concealed hand, unknown deck order, or hidden Prize identities enter the chooser. This is a deterministic action-ordering witness.

The native test originally failed twice on test-harness assumptions: it expected `null` as the open-game winner and compared the terminal winner to the engine Player ID. The pinned Store actually uses `-1` for no winner and a physical seat index for winner. Those assertions were corrected, with all subsequent branches confirmed in the final successful compiled run.

## Evidence and reproducibility

- **Final successful manual native CI:** [run 41166797436](https://github.com/FlareZ123/experiment-01/actions/runs/41166797436), head `26a41edc57d88405946075476a5e42bd1617bcec`, native engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Raw run artifact:** [artifact 13029695465](https://github.com/FlareZ123/experiment-01/actions/runs/41166797436/artifacts/13029695465), name `actor-only-root-native-retrospective-rank11`, uploaded SHA-256 `393fb7f7efb356747d20a44b5bc548bbe49543bfa023fb8da3172694195abc10`, retention through 30 November 2026. It includes `agent5-buddy-pulse-nonfinishing-native.json`, with every physical seat and branch receipt.
- Test runner: [`simulation/twinleaf/agent5-buddy-pulse-nonfinishing-native.cjs`](../../simulation/twinleaf/agent5-buddy-pulse-nonfinishing-native.cjs).
- Pure actor-visible exposure: [`simulation/twinleaf/agent5-public-attachment-reaction.cjs`](../../simulation/twinleaf/agent5-public-attachment-reaction.cjs). Its exact known two-Prize classification is deliberately restricted to Regidrago V SIT without a guaranteed complete public printed-profile input.
- Independently opt-in safe selector: [`simulation/twinleaf/agent5-reactive-attachment-guard.cjs`](../../simulation/twinleaf/agent5-reactive-attachment-guard.cjs); tests [exposure](../../tests/agent5-public-attachment-reaction.test.cjs) and [guard](../../tests/agent5-reactive-attachment-guard.test.cjs). Existing manual-only [CI workflow](../../.github/workflows/agent5-owner-root-native.yml) compiles pinned Twinleaf, runs both pure and native tests.

## Interpretation and transfer

A better common chooser must compare **the opponent's response to the action itself**, including immediate state-based triggers, with the value of the alternative first-return attack. A mere prediction that a Special Energy improves the future attack graph can lose the current game even when the available attack is not a Prize finisher. A public, conservative hazard gate is one independently runnable candidate. It should be integrated deliberately into the common chooser and measured against a broader genuine source census before changing any frozen two-player profile.

**Limitations:** The simulated board was staged rather than encountered in a source-dealt match. It omits competent opposing decisions, paper match clock, deck consistency, evolving interactions, and many possible Ability suppressions or changing HP effects. The guard warns of a *potential* knockout and may over-hold when another public effect suppresses Buddy Pulse. No Minun or Plusle is present in the 29 currently authenticated Aichi opposing published lists, so direct frequency for the target field is unproven. The three missing full lists remain ranks **23, 25, 28**. No 60-card deck strength claim follows. **Competitive-qualified games remain 0.**

## Public printing-profile extension (31 October)

The original native positive remains the exact Regidrago V SIT staged receipt. A follow-up additive safety detector now accepts the already maintained `catalog.publicPokemonProfileIndex` and obtains `prizesOnKnockout` from `visiblePrintedProfile`. This removes the hardcoded two-Prize assumption for recognized **other** printed targets while retaining the original exact Regidrago V fallback when no index is supplied. New pure tests cover an exactly profiled one-Prize Snorlax, exactly profiled three-Prize Trevenant & Dusknoir-GX, withheld/ambiguous metadata, and different opposing Prize counts. No native claim is made for new card families, only a pure conditional award rule.

The complete updated shared manual workflow passed [compiled native CI 41167406026](https://github.com/FlareZ123/experiment-01/actions/runs/41167406026) on head `5ec72a761026690c3aa76c160519bc8321fcae8e`, including all original both-seat Store counterexample branches and all new pure tests. The native effect observation is unchanged: a possible KO warning is an information-safe preflight, and **Store-confirmed damage, knockout and award** remain separate evidence categories.
