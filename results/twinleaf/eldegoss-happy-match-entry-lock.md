# Eldegoss V (RCL 19) Happy Match Bench-entry lock bug

**Agent 11, 17 October 2026.** Pinned engine: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The real [Store-action fixture](../../simulation/twinleaf/eldegoss-entry-lock-action.cjs) passed during [manual lock-board CI 39014378451](https://github.com/FlareZ123/experiment-01/actions/runs/39014378451), source head `4b9bf6cf255c3d823b5938903c5cc7921207447e`. That overall workflow later failed at an unrelated existing Battle Compressor test assertion. The named Eldegoss step succeeded.

## Rule/text and failure mechanism

The original RCL Eldegoss V Happy Match Ability reads: “When you play this Pokémon from your hand onto your Bench during your turn, you may put a Supporter card from your discard pile into your hand.” The pinned source handler calls `IS_ABILITY_BLOCKED` on `PlayPokemonEffect` **before** the Pokémon enters the Bench, while Iron Thorns ex Initialization and Path to the Peak only suppress eligible Pokémon **in play**. Therefore the raw engine incorrectly permits Happy Match. The engine already suppresses the same action through Silent Lab (which also covers Basic Pokémon in hand), or a Tool-bearing Garbodor BKP Garbotoxin (which includes a hand-zone lock).

The new [reversible source-side compatibility hook](../../simulation/twinleaf/eldegoss-entry-lock-hook.cjs) temporarily stages the actual incoming Basic onto its real empty Bench destination solely for `IS_ABILITY_BLOCKED`, then restores hand/Bench zones before the unchanged Eldegoss reducer. It does not change Twinleaf vendor files. Locked entries still place Eldegoss on the Bench; they do not recover the Supporter.

## Actual Store-action outcome

The fixture plays Eldegoss V RCL from hand via `PlayCardAction`, resolves its actual Confirm and ChooseCards prompts if offered, and measures the movement of a discarded Guzma to hand.

| Existing opposing lock | Optional Canceling Cologne | Raw Happy Match recovered Supporter | Hook recovered Supporter |
| --- | --- | --- | --- |
| None | No | Yes | Yes |
| Iron Thorns ex Initialization | No | **Yes (wrong)** | No |
| Iron Thorns ex Initialization | Yes | Yes | Yes |
| Path to the Peak | No | **Yes (wrong)** | No |
| Silent Lab | No | No | No |
| Garbodor BKP + Pokémon Tool | No | No | No |
| Garbodor BKP without Tool | No | Yes | Yes |

All 14 midgame Store executions successfully Benched the incoming Eldegoss; no unresolved prompts remained. The optional correction preserves source behavior when no applicable lock exists.

## Published Aichi source incidence and inference limit

The exact published 60-card Aichi lists include one **Eldegoss V RCL 19** in each of ranks **4, 15 and 27**. These are source-exposure opportunities only. This fixture intentionally injects a valid midgame board and discard configuration; it does not test the probability of drawing Eldegoss, whether a policy chooses this recovery line, or whether the opponent has a lock Active when it appears. **Zero qualified matches, no win-rate conclusion.**

When enabling the hook in a full game, label the optional correction and exact pinned engine. The existing Dedenne-GX/Crobat V and Tapu Lele-GX source-entry timing corrections are separate; their test results do not automatically generalize to Eldegoss.
