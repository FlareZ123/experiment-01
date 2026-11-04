# Exact native deck-shuffle animation owner acknowledgment reaches attack-resolution prompt

**Agent 21, 4 November 2026.** A strict two-physical-seat historical rank5 native development trace. The original generic bot raw-State scorer is quarantined before its first inherited invocation. **Zero completed or competitively qualified games.**

## Reproducible evidence

- Original fixed candidate pairs, source registration and preflight as in [previous rank5 Prize report](agent21-two-prize-native-choice-next-pokemon-20261104.md).
- Existing manually triggered [CI 41769737985](https://github.com/FlareZ123/experiment-01/actions/runs/41769737985), **SUCCESS**, checkout `20c39228ad0972fb3de69f467ff790c326be7cdc`, artifact [13294087308](https://github.com/FlareZ123/experiment-01/actions/runs/41769737985/artifacts/13294087308). ZIP SHA256 `88f63a26f7b843719e649d21fb6f63b59466b54a5fba1b5128707d5c42b24f51`, inner JSON SHA256 `3f463f17b34ce6175ecc4ab03d2aaa152a811cffbac825347c48b5936dc95074`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, exact [`SHUFFLE_DECK` prefab](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts): after deck order is applied, the engine inserts owner-addressed `WaitPrompt` with `message:'Deck shuffle animation'`, `showVisual:false`. The silent wait is an interface synchronization barrier. The research-owned [opt-in wait adapter](../../simulation/twinleaf/agent21-owner-nonvisual-phase-wait.cjs) now acknowledges exactly this message in `GamePhase.PLAYER_TURN` with null, retaining strict default fail-closed treatment of other prompts.

| Original source seat | Verified owner-only native waits | Next first unsupported native prompt |
| --- | --- | --- |
| Seat 1 (group `5:0:A`) | **2 additional exact deck shuffle waits**, on actor seat0 at turn2 phase2; total owner-only WaitPrompt decisions 8 | Seat 0, **turn2 phase3 ATTACK**, `ChooseCardsPrompt` |
| Seat 0 (group `5:0:B`) | No new deck-shuffle wait before stop; prior exact ATTACK animation and 2-Prize choice still accepted | Seat 0, **turn6 phase3 ATTACK**, `ChoosePokemonPrompt` |

In both cases a previously blocked interface is traversed with an exact owner-only action to reach a new native prompt. Native compiled test and pure controls passed. No alternative chosen by the raw inherited `SimpleTacticsAi.decodeNextAction` was evaluated. Do not inflate multiple prompt events from the same originally registered historical deal into independent games.

**Next strongest step**: audit the public message and exact allowed source board for the turn2 `ChooseCardsPrompt`, and the permitted owner/board target geometry for turn6 `ChoosePokemonPrompt`. Both can be materially strategic and must be restricted by exact native prompt semantics, owner information, real paper restrictions and competing actions. In particular, unknown Prize contents and opponents' concealed hands/decks cannot be used to rank options.

Qualification status unchanged: 29/32 verified original opponent inventories, no final field-wide deck, no competitively qualified games, no 99.5% evidence.
