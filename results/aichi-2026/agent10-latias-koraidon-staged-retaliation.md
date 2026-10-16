# Agent 10: adversarial Latias Eon Blade → Koraidon Retribution Strike Store sequence

**16 October 2026.** **Passed [manual pinned-Twinleaf CI 38883022207](https://github.com/FlareZ123/experiment-01/actions/runs/38883022207)**: three test cases including new two-attack rule contract and earlier independent Latias Energy-choice tests. The first version of the new test deliberately failed at the immediate damage snapshot: Twinleaf defers Eon Blade's damage until \`WaitPrompt\` resolution. The corrected regression resolves every required game prompt before asserting the damage and Knock Out. No source-match replay or competitive-policy qualification has occurred.

## Source-card context

The [published rank-10 Regidrago source 60](full-decklists.json) contains **Koraidon ex TEF 120 (one)**, **Double Dragon Energy ROS 97 (four)**, and **Muscle Band XY 121 (two)**. The [Temple Shadow Rider fixed list](candidate-temple-shadow-rider.md) contains **Latias ex SSP 76 (one)** and basic Psychic Energy.

The attached complete card database confirms these printed texts: Latias has 210 HP and \`Eon Blade\` deals 200 for \`Psychic + Psychic + Colorless\`; Koraidon has 230 HP and \`Retribution Strike\` deals \`20 + 10 per damage counter on Koraidon\` for two Colorless; Muscle Band adds 20 damage against the opponent's Active; Double Dragon provides two units of Energy to eligible Dragon Pokémon. Both attacks have correctly resolvable game-engine cost in the staged positions. The original [rank-10 source trace investigation](agent44-v3-rank10-pass-probe.md) found separate candidate Latias third-Psychic attachment and Koraidon missed-attack opportunities, motivating this adversarial counterline.

## Precisely staged conditional board

The [runnable game-store fixture](../../simulation/twinleaf/latias-koraidon-adversarial-sequence.cjs) injects source-printing cards onto a deliberately prepared midgame board. It uses an actual \`PlayCardAction\` to attach the third basic Psychic from the candidate's hand to Active Latias ex. Opponent Active is initially an **undamaged** Koraidon ex carrying one Double Dragon Energy and Muscle Band, with a Benched Dratini. Candidate benches Tapu Lele-GX for a legal promotion. Both players have six occupied unknown Prizes and nonempty decks to avoid test-induced sudden death.

The test dispatches genuine \`AttackAction('Eon Blade')\` and resolves all three pending \`WaitPrompt\` actions. Koraidon takes **exactly 200 damage**, retaining **30 HP**. The engine transitions to the opponent's turn with Koraidon still Active. The opponent then dispatches \`AttackAction('Retribution Strike')\`; the test resolves Wait, two-Prize selection, Active promotion and remaining Wait prompts.

| Step | Grounding | Outcome |
| --- | --- | --- |
| Active third Psychic attachment | Actual \`PlayCardAction\` | Three Psychic on Latias |
| Latias uses Eon Blade | Actual \`AttackAction\` + three Wait prompts | **200** damage to Koraidon, **30 HP** remains |
| Koraidon uses Retribution Strike | Actual \`AttackAction\` | Counterattack accepted |
| Predicted counter damage from printed text | Mathematical card-text arithmetic | **20 + (20 × 10) + 20 = 240**, before Weakness/Resistance |
| Counterattack KO and resolution | Actual \`WaitPrompt\`, \`ChoosePrizePrompt\`, \`ChoosePokemonPrompt\` reducers | **Latias ex Knocked Out**; opponent takes **two Prizes**, Tapu Lele-GX promoted |

The fixture explicitly distinguishes the **card-text-predicted 240 damage** from what the engine directly asserts, namely the real complete Knock Out and Prize transitions. It does not claim an instrumented intermediate 240-damage observation after deferred resolution.

## Interpretation

The earlier [same-head rank-10 A/B experiment](agent10-rank10-latias-paired-policy.md) found that simply prioritizing Latias's third Psychic dramatically changed the Temple A game under the unmodified speculative Simulator. This adversarial fixture shows **one physically plausible reason why blindly rewarding an Eon Blade attack is strategically unsafe**: an undamaged 230-HP Koraidon survives the 200 damage and can respond with a Knock Out and two Prizes using source-listed cards already shown in earlier public-board evidence. Other board configurations, healing, switching, opponent decisions and follow-up attacks can change the tactical evaluation.

Important limits: the injected situation is not the exact recovered Temple A game state; no beginning-of-game draw or search path is simulated; Koraidon and Muscle Band are staged; no AI policy actually chooses the retaliation; no deck-level matchup game is qualified; conditions such as pre-existing Koraidon damage, stadiums, Ability effects and other cards can change the line. The fixture is a **validated conditional threat**, not a reason to reject Latias universally or to claim the simulated policy result is false.

The next evidence gate is to rewind a source-ranked Temple A attachment decision from the **full actual Store state**, let both sides make realistic choices, record the literal action/prompt sequence and verify independent cloned-state noninterference. The rank-10 qualification cell remains **No**.

## Reproduction

- [Pinned-engine attack/prompt sequence](../../simulation/twinleaf/latias-koraidon-adversarial-sequence.cjs)
- [Two-attack regression](../../tests/latias-koraidon-adversarial-sequence.test.cjs)
- [Manual-only workflow](../../.github/workflows/latias-koraidon-adversarial-sequence.yml)
- [Passing CI 38883022207](https://github.com/FlareZ123/experiment-01/actions/runs/38883022207); earlier failed run 38882646695 is retained as evidence of the incomplete asynchronous snapshot trap.
