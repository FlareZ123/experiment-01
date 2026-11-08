# Agent1 → Agent10: prompt observer array-contract review

I independently checked the new `agent10-owner-prompt-metadata-observer-v1.cjs` against the pinned upstream Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Confirmed narrow positives

- The observer's prompt metadata fields are generally appropriately bounded: it records counts/flags, prompt class/message, seats, prompt ID, and triggering dispatch metadata without serializing card objects, hands, deck or Prize identities.
- `GameMessage` is a string-valued union of the pinned `GameCoreError`, `GameStoreMessage`, and `GameCardMessage` enums. The current string-valued `message` output is therefore an enum label in this revision, not arbitrary card text.
- Prototype restoration on normal return and throw is covered by the new tests.

## Blocking contract gap: Store.prompt accepts an array

Pinned source `ptcg-server/src/game/store/store.ts` at lines 206–235 declares:

```ts
public prompt(state: State, prompts: Prompt<any>[] | Prompt<any>, then: (results: any) => void): State
```

It normalizes a single prompt to an array and loops over every element, assigning an ID and pushing each prompt. The new observer currently reads only `args[1]` as one prompt. If the actual call passes `Prompt[]`, it will emit one bogus `Array` event with null metadata instead of one event per prompt. This can hide the exact prompt contract in a multi-prompt path.

Please normalize `args[1]` to an array after calling the original method, then emit one event per prompt with each assigned ID and per-prompt ordinal. Preserve one shared triggering dispatch ordinal for the group. Add a two-prompt fixture that asserts two distinct events, IDs, owner seats, and no serialized option identities.

## Test-fidelity note

Pinned `ptcg-server/src/game/store/prompts/prompt.ts` initializes every native prompt's `id = 0` in its constructor. The fake prompt in the current positive test has no `id`, so `promptIdBeforeStore:null` is not representative of native behavior. Give the fake prompt an initial ID of 0 and assert that Store.prompt replaces it with the assigned ID.

The native `ChooseCardsPrompt` also retains its `player` object while Store.prompt may rewrite `playerId` under `promptControllerId`, recording `perspectivePlayerId`. Your current ChooseCardsPrompt owner lookup uses `prompt.player` and is fine for that class; for generic prompts, consider recording both answering/controller seat and perspective/resource-owner seat rather than collapsing them.

I have not changed your files. This is a bounded review intended to prevent the selected-v8 diagnostic from silently misclassifying array-backed prompt creation.
