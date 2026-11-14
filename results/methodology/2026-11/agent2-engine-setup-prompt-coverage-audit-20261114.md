# Agent2 — exact engine setup-prompt coverage audit across current policies

**14 November 2026 · static source review · no fixture or CI run**

## Scope

Checked the current candidate policy (Agent46), rank1 opponent policy (Agent6), and rank2 opponent policy (Agent10) against Agent11's complete pinned-Expanded engine setup checklist in communications/agent46/20261114T1752Z_agent11-complete-engine-setup-prompt-checklist.md.

The required sequence is:
1. ChooseCardsPrompt + exact message CHOOSE_STARTING_POKEMONS.
2. ConfirmPrompt + exact engine message GO_FIRST after the coin flip.
3. SelectPrompt + exact engine message WANT_TO_DRAW_CARDS for the mulligan bonus.

These are phase-0/1 protocol requirements, not rank-specific strategy expansion.

## Current policy coverage

| Setup prompt | Candidate policy (Agent46) | Rank1 policy (Agent6) | Rank2 policy (Agent10) |
|---|---|---|---|
| CHOOSE_STARTING_POKEMONS | Routes all ChooseCardsPrompt to chooseCardCombination; no exact setup-message branch. This is not a demonstrated strategic starting-Pokémon selector. | Card-combination handler has a fixed knownSearchEffect allowlist that does not include CHOOSE_STARTING_POKEMONS; it abstains as unsupported source. | Generic card-combination/cardPriority path; no exact setup-message branch or demonstrated setup-specific selector. |
| GO_FIRST | ConfirmPrompt/SelectPrompt only selects automatically when there is exactly one choice; two-choice Yes/No shape abstains. | Confirmable allowlist contains card/Ability names but not GO_FIRST; abstains as unsupported confirmation source. | Generic fallback selects a No option for unknown contexts when one exists; it does not explicitly recognize GO_FIRST or document a seat-relative deterministic decision. |
| WANT_TO_DRAW_CARDS | SelectPrompt only accepts a single choice; multi-choice shape abstains as ambiguous. | SelectPrompt is accepted only for a fixed confirmable list; WANT_TO_DRAW_CARDS is not in it and abstains. | Generic Yes/No handling does not map draw-count choices; absent a No option it abstains, and it has no native count/index calculation. |

## Exact WANT_TO_DRAW_CARDS projection contract

Agent11's source clarification states:

- publicMetadata.count must be native values.length, not prompt.choices.length (which includes the separate cancel row).
- Filter kind === 'option'; ignore kind === 'cancel'.
- Derive drawCount = count - 1 - choiceIndex.
- Validate the descending Draw N card(s) labels against the derived index before selecting the opaque token.

Both physical-seat mappings and both role policies need the same correct handling. Do not infer the draw count from the rendered choice-array length.

## Impact and acceptance recommendation

This is a startup/game-path blocker. A worker may be schema-valid and still abstain or choose the wrong branch before the first meaningful turn. Any fixture that bypasses these prompts cannot establish complete game-play coverage.

Post-stopline acceptance should require:
1. Explicit, deterministic CHOOSE_STARTING_POKEMONS selection based on legal Basics and declared setup priorities.
2. Explicit GO_FIRST decision with a documented deterministic choice for each role and physical seat.
3. Exact WANT_TO_DRAW_CARDS count/index/token mapping, including the cancel row and label validation.
4. Tests for all three prompts in both physical seats and both role mappings.
5. Unknown setup prompts remain fail-closed.

Agent49 owns the single integration path; policy owners should implement only their policy-side decisions after the shared projection contract is agreed. Do not create a second setup adapter or duplicate prompt mapping in each worker.

No policy, runner, prompt adapter, CI or fixture was changed or run by this audit.
