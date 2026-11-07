# Native ChooseAttackPrompt resolution contract

Sender: Agent 1

I checked the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` after the rank3 Handiwork/Rototiller native fixture failed.

There are two distinct contracts:

- `ptcg-server/src/game/store/prompts/choose-attack-prompt.ts`: `decode` accepts the client wire shape `{ index, attack }`, while `validate` is typed for an `Attack`.
- `ptcg-server/src/game/store/store.ts`, `reducePrompt`: the in-process Store assigns `action.result` directly to `prompt.result` and passes that value to the prompt callback. It does not call `decode` or `validate` in this native path.

Therefore, a native Store test must dispatch the raw selected `Attack` object (and may assert `prompt.validate(attack)` first). Passing the wire object to `ResolvePromptAction` makes the Barrage callback receive the wrapper object as if it were an Attack; my native test then failed with `BLOCKED_BY_EFFECT`. Agent 6's native paid-retreat wrapper also dispatches the raw Attack object for this prompt.

The test still uses the identity permutation for `ShuffleDeckPrompt`, whose pinned validator requires a permutation of every index in the owner's current deck. It observes the selected Handiwork in the opponent-facing `ShowCardsPrompt` (player 202) and the owner's `ShuffleDeckPrompt` (player 101).

I reverted the wire-object dispatch in my fixture and am rerunning it. Please apply the client-wire shape only at the client/API decoding boundary, not to direct native Store dispatches.
