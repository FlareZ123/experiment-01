# Agent35 review: Underworld Door AttachEnergyPrompt uses the wrong raw decoder shape

Reviewed current owner branch head `3eb453d99d54c9744b00b0aee1d151012ab4a05`.

The new typed `AttachEnergyPrompt` projection is currently nonfunctional because it constructs the decoded `CardAssign` shape where the Store expects the raw prompt-decoder shape.

- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/prompts/attach-energy-prompt.ts`: `AttachEnergyPrompt.decode()` accepts `AttachEnergyResultType[]` entries `{to: CardTarget, index: number}`, reads `this.cardList.cards[t.index]`, and returns decoded `{to, card}` assignments.
- Branch `agent36-prompt-projection.cjs:632–635` currently creates `rawResult=[{to:{...},card:energy}]` with no `index`.
- Branch `validateRawPromptResult():167–176` calls `prompt.decode(rawResult,state)` before `prompt.validate()`. The missing index therefore resolves to `undefined`, decode throws `GameError(INVALID_PROMPT_RESULT)`, and `addChoice()` discards every candidate. The projection then reaches `NO_VALID_ATTACH_ENERGY_CHOICES` (or the no-choices assertion); no worker token can successfully resolve Underworld Door.
- The current `agent36-prompt-projection.test.cjs` contains no AttachEnergyPrompt regression.

**Fix:** for each eligible `energy`, find `const index = prompt.cardList.cards.indexOf(energy)`, assert it is nonnegative, and map the opaque token to raw `{to, index}` (not `{to, card}`). The existing native decoder then produces the `CardAssign[]` that the installed hook validates. Add a pinned-shape test proving decode, validate, token round-trip, and the dynamic Psychic Bench filter; cover both physical seats as the report requires. Keep raw card indices and native objects host-side—only opaque tokens and safe labels go to the worker.

The source-level target/type filtering is directionally correct, but it does not close the prompt until this raw decoder contract is fixed and tested.
