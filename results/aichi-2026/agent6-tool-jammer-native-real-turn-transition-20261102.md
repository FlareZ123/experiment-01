# Agent 6: real opposing end turn after native Tool Jammer PlayCardAction

**2 November 2026, native pinned Twinleaf v a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, synthetic prepared board**

This extends [Tool Jammer from actual hand](agent6-native-tool-jammer-play-from-hand-20261102.md) by removing the final manual turn-handoff step.

The original opponent (physical seat opposite the test owner) first receives an authentic `PlayCardAction(opponent.id,0,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0})` while holding exactly one Tool Jammer BST in its real in-memory hand. The Store moves that physical card from hand to the opposing Active Tool attachment slot. It then receives a **native `PassTurnAction(opponent.id)`**. The tester resolves two native WaitPrompts via `ResolvePromptAction(waitId,null)`. That takes the game from native turn4, opponent's physical seat, to turn5, original owner's physical seat, with no pending prompts and no assignment to the owner's activePlayer field by the tester.

At the new genuine owner turn, with optional owner-local research ToolEffect guard enabled, the Store checks Active Latias ex SSP versus either Path to the Peak + opponent Active Tool Jammer + owner's Float Stone, or opposing Active Iron Thorns ex Initialization + Tool Jammer + owner's Stealthy Hood. Both modes correctly preserve printed retreat cost2 and reject the real unfunded native `RetreatAction`.

## Independent compiled receipt

[Manual CI 41482428736](https://github.com/FlareZ123/experiment-01/actions/runs/41482428736), [artifact 13160571499](https://github.com/FlareZ123/experiment-01/actions/runs/41482428736/artifacts/13160571499), independently downloaded ZIP SHA-256 `c4c2a00cf753b6e04221757a8349ef0525bc58c332514c788f064cfd8d5a3105`. Its `agent6-native-jammer-real-turn.json` records **4/4 staged cases, failedChecks:0**. All four rows:

- opponent Tool Jammer genuine play from hand: same physical Tool transferred to the proper Active, no pending prompts;
- actual `PassTurnAction` accepted, `passError:null`;
- `beforeTurn:4, afterTurn:5`;
- owner seat0: `beforeSeat:1, afterSeat:0`; owner seat1: `beforeSeat:0, afterSeat:1`;
- `resolvedWaitIds:[1,2]`, `pendingPromptTypes:[]`;
- native own retreat cost2; denied due insufficient Energy, own Active Latias remains.

The older **manually assigned owner-turn** method remains available only as a separate opt-in stage for historical reproducibility. No vendor source changed; no default selected-bilateral profile changed.

## Boundaries and next counterfactual

A genuine opponent turn boundary now links authentic Tool Jammer hand play to the owner response in the actual Store. The initial board, hand and Prize cards still arise from **explicit synthetic staging**, rather than naturally dealt original source decks. There was no real opponent policy deciding whether to spend the Tool Jammer this turn.

A separate pending `runPairedJammerTurnCounterfactual()` proposes the appropriate decision counterfactual: same pre-opponent synthetic board and one Tool Jammer in opponent hand, paired opponents either play that Tool to Active before ending the turn or keep it in hand before ending; both then allow the original owner into the same next turn. The unjammed arm executes native Hood-enabled Rondo two-Prize KO and an opposing Pidgey reply; jammed arm should block the initial owner retreat. [Manual CI](https://github.com/FlareZ123/experiment-01/actions/workflows/agent7-rank30-source-psychic-staging.yml) pending outcome at this note. Do not infer result until its archive is independently inspected.

**Research evidence only:** zero original shuffled full games qualified. The Aichi original Top32 field has 29 authenticated sixties, missing ranks23/25/28, and the 99.5% objective remains unproven.
