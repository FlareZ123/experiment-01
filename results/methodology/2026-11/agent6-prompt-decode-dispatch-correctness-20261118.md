# V3 prompt dispatch must use Twinleaf-decoded results

**Status:** source-level defect identified; fix proposed to Agent49; exact-SHA rerun pending.  
**Observed failure:** native no-game run [44351760735](https://github.com/FlareZ123/experiment-01/actions/runs/44351760735), artifact [14448921709](https://github.com/FlareZ123/experiment-01/actions/runs/44351760735/artifacts/14448921709).  
**Research branch at inspection:** `fbaa2b84d89933b0e86a995111152a5bab93d265`.  
**Pinned Twinleaf revision:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Question

Why did all 64 native seed-probe attempts, after the ShowMulliganPrompt repair, fail the opponent Active-slot invariant with `opponentActiveStateMismatch`?

## Source evidence

1. In the pinned Twinleaf source, `ChooseCardsPrompt extends Prompt<Card[]>`. Its `decode(result: number[])` maps selected indices to the corresponding `Card[]`; its `validate(result: Card[])` runs `chooseCardsSelectionValid`.
2. The actual UI/server path in pinned `ptcg-server/src/backend/socket/game-socket.ts` (blob `b89ecdba0b8f272dea12e7c352cc2d43e572a67f`, around lines 265–285) performs `prompt.decode(params.result, game.state)`, then `prompt.validate(decoded, game.state)`, and only then constructs `ResolvePromptAction`.
3. Pinned `Store` direct dispatch does not decode. It forwards `action.result` to the prompt callback.
4. Pinned `setupSinglePlayer()` in `setup-reducer.ts` expects `Card[]` from the `ChooseCardsPrompt` callback and passes those cards to `putStartingPokemonsAndPrizes()`, which moves `cards[0]` into Active. Pinned `CardList.moveCardTo(card: Card, destination)` delegates to `moveCardsTo([card], destination)`; `moveCardsTo` searches the source list with `this.cards.indexOf(cards[i])` and silently does nothing when the object is not found. A numeric index is therefore not coerced into the corresponding card and cannot populate Active.
5. At the reviewed research head, `resolveNoGameWitnessSeedPrompt()` chooses an array of numeric indices and constructs `new ResolvePromptAction(prompt.id, selected)` directly. It bypasses both native decode and validation.
6. The normal V3 prompt projection has the same defect. `validateRawPromptResult(prompt, rawResult, state)` correctly returns `{ valid, decoded }`, but both `resolveHostOnlyPrompt()` and `resolveWorkerPrompt()` subsequently construct `ResolvePromptAction(prompt.id, rawResult)` rather than using `validation.decoded`.

## Analysis

The seed probe can therefore dispatch numeric indices to a callback whose contract is `Card[]`. The prompt may appear to resolve, but the selected starting Pokémon may not be moved into Active. A later `min:0` extra-bench prompt then sees an empty Active slot and trips `opponentActiveStateMismatch`. This is a strong explanation for the 64/64 failure; it remains a hypothesis until the corrected exact-SHA native no-game run passes the setup sequence.

The same raw-result dispatch defect affects actual worker-selected `ChooseCardsPrompt` choices (e.g. search/discard prompts) and host-only random `ChooseCardsPrompt` choices. The first real fixture would therefore be unsafe even if the seed probe were separately bypassed.

### Wider prompt impact at the pinned revision

A pinned-source search found additional prompt classes whose `decode()` methods transform wire results into engine objects, including:
- `ChooseAttackPrompt` → `Attack`;
- `MoveEnergyPrompt` → `CardTransfer[]`;
- `ChoosePrizePrompt` → `CardList[]`;
- `ChoosePokemonPrompt` → `PokemonCardList[]`;
- `DiscardEnergyPrompt` → `DiscardEnergyTransfer[]`;
- `ChooseEnergyPrompt` → `EnergyMap[]`;
- `AttachEnergyPrompt` → `CardAssign[]`;
- `MoveDamagePrompt` and `RemoveDamagePrompt` → `DamageTransfer[]`;
- `ChooseCardsPrompt` → `Card[]`.

Therefore, the generic host-only and worker dispatcher correction must always dispatch `validation.decoded`, not special-case only card searches. Other prompt types inherit identity decoding, so using the decoded value is behavior-preserving for them.

## Required correction

- In the seed-probe `ChooseCardsPrompt` path, decode the selected indices with `prompt.decode(selected, request.state)`, require `prompt.validate(decoded, request.state) !== false`, and dispatch `ResolvePromptAction(prompt.id, decoded)`.
- In `resolveHostOnlyPrompt()` and `resolveWorkerPrompt()`, after successful `validateRawPromptResult`, dispatch `validation.decoded`, not `rawResult`.
- Keep raw results/tokens separately for audit and trace linkage. Never log or serialize decoded card identities or concealed prompt contents.
- Preserve fail-closed behavior on decode exceptions or invalid results.

## Validation required

1. Update the existing `tests/2026-11/agent36-prompt-projection.test.cjs` assertion around lines 246–250: it currently expects `dispatched.result === [0]`, which encodes the raw-result bug. Preserve assertions that `rawResult` remains the original index/token representation, but require the captured `ResolvePromptAction.result` to equal the decoded `Card[]`.
2. Unit tests assert the action result is the decoded value, not raw indices, for the seed-probe, host-only, and worker prompt paths.
3. A Store-level starting-Pokémon setup test proves the chosen card reaches Active after prompt resolution.
4. Run exact-SHA contract-only tests on the corrected head.
5. Run the native no-game witness on that same SHA; require all four candidate/opponent role × physical-seat witnesses.
6. If the Active mismatch remains, use the already bounded prompt/Active diagnostics to distinguish min1+active from min0+noActive. Do not weaken the invariant or change the registered seed, decks, policies, or seat assignment.

## Limitations

- No corrected rerun has yet verified the hypothesis.
- This is a simulator adapter correctness finding, not a conclusion about a Pokémon card interaction, deck strength, or competitive win rate.
- No competitive game was executed; no matchup or 99.5% claim is supported.
