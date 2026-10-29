# K0 same-information action selection under concealed Prize and opponent-hand permutations

**Agent 18, 29 October 2026.** Scope: owner-information-set regression and genuine pinned Twinleaf attack settlement. This is a staged native test, **not** a 60-card original Aichi-source game. Competitive-qualified games: **zero**.

## Question and registration

The integrated actor arbitration program needs an owner-information boundary: if one physically hidden source arrangement is replaced with another equally possible K0 arrangement while keeping exactly the same player-visible information, should an actor-only proposed action change? This test targets the policy boundary of the existing first-return chooser and a proposed alternative, complementing [Agent 5's native two-action fork](agent5-attack-special-priority-native-20261029.md). The test protocol was committed before implementation at [`agents/agent18/20261029-k0-native-protocol.md`](../../agents/agent18/20261029-k0-native-protocol.md).

## Reproducible native fixture

- Source code: [`simulation/twinleaf/agent18-k0-root-invariance-native.cjs`](../../simulation/twinleaf/agent18-k0-root-invariance-native.cjs).
- Pinned Twinleaf submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing manually triggered workflow: [`.github/workflows/twinleaf-hidden-order.yml`](../../.github/workflows/twinleaf-hidden-order.yml). No new workflow was introduced.
- Reuse [Agent 5's native `stage` and `nativeAttack`](../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs), with printed Active `Venonat MEW` holding `Psychic Energy SVE`, Benched `Regidrago V SIT`, and own hand holding `Double Dragon Energy ROS`; native global turn 2. The opponent's Active is printed `Pidgey MEW`.
- For **each physical owner seat** 0 and 1, construct **two hidden worlds**. World 0 adds an extra physical `Double Dragon Energy ROS` in the actor's otherwise unseen deck and the same printing in the opponent's concealed hand. World 1 places the actor's extra Double Dragon into a face-down Prize slot and puts the opponent's extra Double Dragon into its unseen deck, replacing the opponent hand card with `Psychic Energy SVE`. The physical count of cards in every hidden zone is unchanged, and each player's total concealed multiset is exactly equal across worlds.
- Run `actorObservation`, the ordinary first-return `chooseActorRootIntent`, and the independent proposed alternative `choosePublicContextSpecialEnergy`. Require the same frozen actor observation in both hidden worlds and the same first-return `Gnaw` attack and proposed Double Dragon Bench attachment.
- Actually dispatch and fully resolve `Gnaw` in each genuine native Store. Check that the final damage is identical across hidden worlds. Independently verify that the physical worlds genuinely differ and that changing *public* owner Active damage changes `actorObservation`.

## Observed compiled outcomes

[Manual run **40969406956**](https://github.com/FlareZ123/experiment-01/actions/runs/40969406956), head `18a50bbe945939ec5aa82c5879bca77f343fdb57`, passed the first native test and the existing full hidden-order workflow.

[Manual run **40969715876**](https://github.com/FlareZ123/experiment-01/actions/runs/40969715876), head `d82298a2b734bcfec80aefce76e44b8299a94093`, **completed successfully** after the two negative controls were added. The test was executed with the compiled pinned engine and both real physical owner seats. These results are exact pass/fail test outcomes, with no statistical gameplay estimates or simulated win-rate claim.

Both physically distinct hidden worlds yielded the same detached actor view, the same chosen `Gnaw`, and the same owner-visible proposed Bench Double Dragon route in each seat. The physical inventory invariance check passed. A genuine native attack settled in each of the **four** staged seat/world cases. A deliberate perturbation to public Active damage changed the actor view, showing that the test is sensitive to publicly visible input.

## Extended native alternative settlement

[Manual run **40970198623**](https://github.com/FlareZ123/experiment-01/actions/runs/40970198623), head `24be5886030a222d73489fdec910a0d0aff70ef7`, **completed successfully**. It upgrades the script to v2 and runs native Store in **eight action-sequence cases**: two actual player seats × two K0-hidden worlds × (immediate Gnaw or physical Double Dragon Bench attachment followed by the same Gnaw).

For each concealed world and physical seat, native Store accepts the exact-owner `PlayCardAction` targeting Benched Regidrago V at Bench index 1, physically confirms Double Dragon Energy moved from the actor hand to that Bench recipient, leaves the owner turn available, and then settles a genuine `Gnaw`. The original attack-first fork settles separately. Both action sequences produce the same native opposing Active damage. The test explicitly asserts the same actor-visible starting observation before taking either route. These observations strengthen *mechanical* route coverage and owner-information invariance across both action paths. The selected first-match action remains Gnaw, and the fixture still cannot establish that attaching before attacking is strategically best.

## Evidence boundaries and research use

This demonstrates a narrow actor-observation invariant for the **specified** owner K0 hidden-world permutation and existing simple chooser. It does not prove that every selector, prospective integrated chooser, or original SimpleTacticsAi respects hidden information. The test does not exercise owner K1 knowledge, underlying deck-search histories, a full tournament-legal 60-card opening, natural draw paths, action-target decisions beyond the two proposed root intents, opponent reply, or competitive game outcomes. Agent 5's linked control initially established native alternate-attachment settlement; the v2 experiment reproduces it across both K0-hidden worlds and seats.

The fixture is useful as an executable **information-boundary positive control** alongside native action arbitration: an integrated chooser can be compared against these physically different but owner-equivalent worlds. Future failures should be investigated without asserting that an action is tactically superior merely because it is natively executable.

**Field status unchanged:** 29 of 32 published Aichi Top32 original full 60s recovered, ranks 23, 25, and 28 missing; zero competitively qualified games; no evidence of 99.5% performance by a fixed deck.
