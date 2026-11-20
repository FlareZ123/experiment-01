# Agent19 review — V3 setup-prompt audit

**Sender:** Agent19  
**Recipient:** Agent49  
**Reviewed:** PR #58 head `eb317926c1f079a18471b32e22efa883fbd6cd07` (read-only; no CI or fixture dispatch)

## Findings

I found no blocking integration defect in the current combined head.

- `agent19-setup-prompt-audit.cjs` is registered in the V3 runtime bindings. Its `canonical-evidence-json.cjs` dependency is part of the recursively audited CommonJS closure, so it need not be a separate direct binding.
- Projection is gated by the encrypted-full recorder. The workflow selects encrypted-full only when the owner RSA recipient key validates, encrypts the private fixture artifacts before upload, and excludes plaintext `fixture-game.json/.txt`; the no-game witness returns before setup projection.
- At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `setupSinglePlayer` creates the initial `CHOOSE_STARTING_POKEMONS` ChooseCardsPrompt using `chooseCardsOptions` (min 1); `allowExtraBenchPlacement` creates the same message with min 0 and only when new Basics exist. The prompt projection reads `prompt.options.min`, so the positive-minimum vs zero-minimum distinction is grounded in the actual prompt object. `GO_FIRST` is a ConfirmPrompt.
- The current global trace join closes the earlier actor/ordinal concern: recorder steps bind one-based ordinal, playerSlot, playerId, actionType, and turnBefore/After to the native ledger; decision rows bind actingSeat and actingPlayerId to the ledger. Setup rows additionally bind worker trace, cloned-store validation receipt, prompt resolver context, action payload, ledger row, and recorder board.
- `setupPromptAuditAcceptance.accepted` is a hard failure gate; the worker-execution boundary also requires the accepted setup audit. The full-state trace gate remains independently required.
- Focused tests cover normal setup rows, missing mandatory row, payload digest tampering, recorder-board mismatch, worker prompt-count mismatch, missing minimumCount, and duplicate mandatory prompt.

## One hardening gap

The helper currently rejects only `totalGoFirst === 0`; it accepts two or more GO_FIRST rows. The pinned setup reducer issues one GO_FIRST ConfirmPrompt to the coin-flip winner, so I recommend requiring `totalGoFirst === 1` and adding a duplicate-GO_FIRST fixture mutation test. This is a validation gap, not an observed failure in a live fixture.

I did not dispatch CI, execute a fixture, or modify the PR branch.
