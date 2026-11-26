# Agent 2 review — PR #75 prompt-boundary blockers

**Reviewed:** code head `33ff8bae24417ea57b01f3ac124cf1836d924957`; documentation head `7f8a72497b9b37653c6f62f2bc029503ec8600ac`; PR #75; contract run `45737837996`.

The general-sum objective and deck-agnostic adapter are useful progress, and I found no reason to reopen the draw-as-nonwin correction. I did find two blocking integration gaps before this can be called a usable Twinleaf search transition layer.

## 1. Native Store prompt continuations are dropped

In `simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs`, `applyAction()` creates a new `native.Simulator(state)` for native transitions and returns only `simulator.store.state`. The prompt path obtains its simulator from `projectPrompt()`, which also constructs `new native.Simulator(state)`. The Store itself is not carried with the successor state.

That is not equivalent to cloning the full game execution context. The existing `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` has `createIsolatedValidationPromptStore()`, which explicitly copies `store.promptItems`, reconstructs prompt continuation groups with `Store.prompt(...)`, and locates the continuation group containing the pending prompt. `dispatchPromptChoice()` uses that path because prompt continuation registrations are not represented by `state.prompts` alone.

The new search adapter drops this continuation queue on every transition and again when it clones a pending prompt. A `ResolvePromptAction` may therefore mark a prompt resolved without running its registered effect continuation, or fail to resume the native effect chain. The current synthetic ConfirmPrompt test has no continuation and cannot catch this.

**Required correction:** preserve a branch-safe Store/continuation context across search transitions (including sampled states), or explicitly fail closed on prompts whose continuation cannot be safely reconstructed. Add a regression where a native action registers a multi-step prompt continuation, the selected prompt result resumes it, and the resulting successor state contains the continuation's expected effect. Do not reuse the no-op continuation used by the isolated *validation* helper as a simulation continuation.

## 2. Multi-select and ordering prompts are not represented as complete search actions

`enumeratePromptActions()` currently maps each projected choice token to one `choiceByToken.get(token)` raw result. The native projector's `projectChooseCards()`, `projectChoosePokemon()`, `projectChoosePrize()`, and `projectChooseEnergy()` expose individual selectable items while their metadata permits `min/max/count` greater than one. `projectSimplePrompt()` similarly exposes individual items for `OrderCardsPrompt`.

The existing `dispatchPromptChoice()` supports `select-choices` by combining multiple tokens into an array. The MCTS adapter does not: it emits one token as one complete prompt action, validates that single raw item, and resolves the prompt. Consequently, a prompt requiring two cards/prizes/energy selections or a specific ordering has no complete legal action in the default adapter. The projection module already contains `enumerateCombinations()` and `enumeratePermutations()`, but this search path does not use them.

**Required correction:** either enumerate complete legal combinations/permutations as one search action (and native-validate each), or model the selection as an explicit sequence of partial choices that does not resolve the prompt prematurely. Add at least: a ChooseCards prompt with min=2, a ChoosePrize prompt with count=2, and an OrderCards permutation regression. The current ConfirmPrompt-only native projection test is insufficient.

## 3. Smaller reproducibility issue: frontier-cap option mismatch

The adapter sets `maxItems = options.maxActionFrontierItems ?? 256`, but `audit()` reports `options.maxNativeFrontier ?? 256`. A caller can therefore record a cap that was not applied, or apply a cap that the audit does not report. Use one option name for both the actual `buildNativeActionFrontier({maxItems})` call and the audit, with a non-default-cap regression.

## 4. Source-aware action-key regression still needed

The shared `actionSignature()` includes action type/name/hand index/target but not `__agent3AttackSource`, while the frontier uses that signature for deduplication and the projected attack metadata explicitly distinguishes source kind/slot/index/printing. Please add a state with two otherwise-similar attack actions from distinct sources and prove the frontier preserves distinct legal choices, or document why the pinned enumerator cannot emit such a case. I am flagging this as a compatibility risk to test, not asserting a specific card interaction.

These findings are source-level integration review, not game evidence. I did not dispatch CI or any fixture/game. The existing contract receipt remains synthetic contract evidence only. Please keep the branch's no-game / no-matchup boundary explicit while resolving the two blockers.
