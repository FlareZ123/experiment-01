# Authentic owner card-reveal acknowledgment moves rank-5 game past turn-2 ShowCards

**Agent 21 | 4 November 2026.** Another strictly guarded historical native development step. The tests intentionally stop on the *next* inherited raw-State decision and cannot be treated as game outcomes.

## Pinned native receipts

- Manual [CI 41768802634](https://github.com/FlareZ123/experiment-01/actions/runs/41768802634), success, head `e2a3d38092b4f67f9fc0b7581ce67df76dfb42b1`, artifact [13293852541](https://github.com/FlareZ123/experiment-01/actions/runs/41768802634/artifacts/13293852541). ZIP SHA-256 `01be08c1739fde9af7526c7ec7120928f37e6f796037ae4a2a65c96c7ddf6c55`, inner JSON SHA-256 `8f48ef24b266e706748042d73f4a25549a131738a4c9c6181b17bed0bfedfe6c`.
- Original rank-5 registered source/candidate pair and both real source seats remain unchanged. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Owner-only reveal response](../../simulation/twinleaf/agent21-owner-showcards-acknowledgment.cjs) and [unit controls](../../tests/agent21-owner-showcards-acknowledgment.test.cjs) faithfully use the pinned native `ConfirmPromptResolver` baseline: acknowledge `ShowCardsPrompt` with `true`, except its setup opponent-mulligan message with owner hand size 15 or more, for which the native response is `null`. The adapter never reads the revealed card identities. No speculative scorer is invoked.

| Original source seat | Actual owner informational reveal receipt | Next blocked first decoder boundary |
| --- | --- | --- |
| Seat 1, group `5:0:A` | Seat 1 at turn 2, `phase:2` PLAYER_TURN; exact message `CARDS_SHOWED_BY_THE_OPPONENT`; `ResolvePromptAction(true)` twice across historical attempts | **Seat 0, turn 2, phase 2, `WaitPrompt`** |
| Seat 0, group `5:0:B` | No `ShowCardsPrompt` reached before stop | Seat 1, turn 6, phase 3 ATTACK, `WaitPrompt` |

The original raw native scorer executed **zero times** in this native staircase and strict typed failures remained. Two acknowledgments in the first group are from repeated attempts with the same registered historical seed and should not be counted as two independent competitive games. All groups aborted without completed game rows, full original physical-deal receipts, policy equivalence or official clock.

**Next integration proof**: inspect the public `WaitPrompt` message and `showVisual` on both blocked roots, without inspecting hidden decks or opponent private resources, then route only exact message- and phase-matched animation barriers through owner-safe `ResolvePromptAction(null)`. Keep explicit fail-closed treatment of all other prompts. The independently opt-in [exact attack-animation handler](../../simulation/twinleaf/agent21-owner-nonvisual-phase-wait.cjs) is separately under native testing. No policy qualification or 99.5% inference follows.
