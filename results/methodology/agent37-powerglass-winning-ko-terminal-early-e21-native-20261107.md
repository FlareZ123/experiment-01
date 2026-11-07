# Agent37: Powerglass E-21 prompt can precede both paper game-ending KO conditions

**7 November 2026 | independent, actual compiled pinned Store experiment | one rule-fidelity counterexample per terminal condition, zero competitive games.**

## Why this expands the existing findings

[Agent35's original natural-game KO investigation](agent35-powerglass-e21-ko-prize-native-order-20261107.md) showed a Powerglass end-turn attach before Prize choice. My prior [source-derived ordering adjudication](agent37-powerglass-postko-prize-rule-order-adjudication-20261107.md) found that §A-01/D KO Prize resolution precedes §E-21 end-turn Powerglass in the provided Advanced Player's Rulebook v3.4. I added **two genuine engine configurations where the underlying KO is already sufficient to end the game**. The Store nevertheless offers its optional Powerglass energy prompt before completing the victory. This is a stronger source-grounded fidelity concern than a harmless permutation of ordinary prompts.

## Exact reproducibility

- Executable probe: [`simulation/twinleaf/agent37-powerglass-winning-ko-native.cjs`](../../simulation/twinleaf/agent37-powerglass-winning-ko-native.cjs), using the same pinned-Store API as Agent35's independently successful original stage. It neither modifies the vendor submodule nor reads an opponent's private physical zones in its automated player policy; this is a controlled test harness with explicit fixture state.
- Manual reusable Actions workflow: [`.github/workflows/agent35-powerglass-ko-order-native.yml`](../../.github/workflows/agent35-powerglass-ko-order-native.yml), with an added separate Agent37 stage. Pinned Twinleaf revision **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Built from repository commit **`d2204686b441ed1c397faec534a116662bf7905a`**.
- Independently observed successful run: [CI 42345883429](https://github.com/FlareZ123/experiment-01/actions/runs/42345883429), job **128323407491**, original native Tool/Prize test and both terminal-condition cases **passed with machine-readable stdout**. Earlier [CI 42345659631](https://github.com/FlareZ123/experiment-01/actions/runs/42345659631) passed as well, but counted physical five-slot Bench length rather than occupied Pokémon. That issue was corrected before the final run, by using `bench.filter(slot => slot.getPokemonCard()).length`, plus an assertion verifying that the fixture contains the requested zero or one **occupied** Bench slots. Do not use the earlier run's misleading `sourceBenchCount=5` field.
- Test setup in each isolated Store: owner Active **Unown AOR** with one Basic Psychic attached and a genuinely played Powerglass SFA, a second Basic Psychic in own discard; opposing Active **Trubbish FST** with exactly **60 damage on its 70 HP**, attacked by actual Store-accepted **Hidden Power** for 10. All face-down Prizes were populated; the first case gives the attacker **one** Prize remaining and one opponent Benched **Tapu Lele-GX**. The second case gives attacker **six** Prizes remaining and the opponent **zero occupied Bench** Pokémon.
- The harness resolved ordinary initial `WaitPrompt` but intentionally stopped at the first **choice-requiring** prompt. It did **not** resolve the Tool's energy choice, continue through a winning Prize selection, or assert a final recorded winner. This makes the prompt-order fact precise while avoiding invented post-choice outcomes.

## Native observations (second, corrected CI run)

| Genuine pinned-Store configuration | Opponent Active after KO | Occupied opposing Bench after KO | Attacker Prize cards still present | First choice-requiring prompt | Game phase integer |
| --- | --- | ---: | ---: | --- | ---: |
| **Last Prize wins if resolved** | None | **1** | **1** | **`AttachEnergyPrompt`** | 3 |
| **Last Pokémon wins if resolved** | None | **0** | **6** | **`AttachEnergyPrompt`** | 3 |

Both tests observed the actual prompt sequence **`WaitPrompt -> AttachEnergyPrompt`**. At the stopping point, the attacking Unown retains its single original Psychic and the Powerglass is active. The defender's last Pokémon in the second test is already off-board, with **no populated Bench** from which to promote. In the first test, a candidate would have won by taking that last Prize if allowed to finish the KO process. The attacker has one unclaimed Prize and must instead first answer an end-of-turn Tool question.

The `GamePhase` numeric value is preserved as a native observation, rather than being interpreted as a qualified winner status. The test proves a **choice offered before the pending winning condition is resolved**. It does not establish that the engine would ultimately award the wrong winner after the choice.

## Paper-rule conflict and precise scope

The attached Advanced Player's Rulebook v3.4 states:

- **§A-01:** attack resolution includes a Knock Out check.
- **§D:** the Knock Out procedure includes discarding the defeated Pokémon and **taking Prize cards**.
- **§E:** as soon as the player has no Pokémon in play, or the opponent has taken all Prize cards, enter game resolution.
- **§E-21:** optional Powerglass attachment occurs at end of turn, **after the attack has been completed**.

For a KO that takes the attacker's final Prize, §E enters the win-resolution process immediately after the KO/Prize stage. For a KO of the defending player's only Pokémon, §E enters it after that Pokémon leaves play. The ordinary optional end-of-turn Powerglass prompt is later than either winning condition under this manual. The official [Powerglass card listing](https://asia.pokemon-card.com/sg/card-search/detail/13785/) confirms the post-attack end-of-turn wording.

The present fixed native pin instead presents a selectable `AttachEnergyPrompt` **while the other player has no Pokémon left in play**, or **before the final Prize is taken**, respectively. This is a *specific reproducible paper-order fidelity gap* with the current implementation. It should be fixed by a research-owned hook or verified against an authoritative event-specific exception before treating affected matches as paper-admissible.

## Proposed engine-hook acceptance tests

1. Build the two exact isolated cases plus the existing nonterminal KO/Prize case, without changing upstream vendor code or the printed source cards.
2. Record the actual stages until game termination, explicitly differentiating physical Bench slots from occupied Pokémon; no weak assumption that a `bench.length===5` represents five opponents.
3. For a **nonterminal KO with a Prize**, settle the Prize before offering Powerglass. Capture actual object movement, Energy recipient and source/defender promotion.
4. For a **terminal KO**, establish the game-end condition before any optional post-attack Tool prompt; preserve correct winner and count of remaining Prizes. Confirm no blocking prompt remains on a completed game.
5. Retest other end-of-turn effects because the same `EndTurnEffect` sequencing may affect more than Powerglass. Preserve exact pinned revision and new research-hook diff for every result.

The planned change must be independently smoke-tested in the full simulator. A plausible patch idea by itself cannot certify all gameplay, and a successful action prompt in a staged game cannot qualify a competitive matchup. **Shared global benchmark still has 29/32 authenticated original printed 60s, zero qualified competitive games, and no evidence of a 99.5% win rate.**
