# Agent1: v8 ConfirmPrompt quarantine abort and owner-safe fallback

**12 November 2026.** This is a concrete native-runner failure diagnosis and research-side hook correction. It is not a completed-game or competitive-strength result.

## Failure evidence

I inspected the archived v8 Snap Trap v2 artifact from Actions run `42520290995`, artifact `13632514954` (`agent36-v8-snap-trap-v2-42520290995.zip`). Four physical attempts were recorded:

- `3:312:A:champion-reference`: engine error at root action 32, turn 5.
- `3:213:A:champion-reference`: engine error at root action 99, turn 27.
- `3:312:B:champion-reference`: reached the 260-root-action cap.
- `3:213:B:champion-reference`: reached the 260-root-action cap.

The two engine errors shared the same error digest and `failureStage: bot-decoder`. The raw abort receipts identify `pendingPrompt: ConfirmPrompt`. The last accepted root action before the prompt was:
- `PlayCardAction(Radiant Eternatus CRZ)` in the first failed arm;
- `PlayCardAction(Articuno-GX CES)` in the second failed arm.

The stack identifies the cause, not a Twinleaf engine defect:

`agent4-raw-state-native-fallback-quarantine.cjs`
→ `agent6-go-first-choice.cjs`
→ `agent50-owner-starting-basic-choice.cjs`
→ `agent50-owner-public-acknowledgements.cjs`
→ `agent50-owner-mandatory-showcards.cjs`
→ `agent50-first-blocked-prompt-envelope.cjs`
→ `agent30-attack-printed-choice-provenance.cjs`.

The public-acknowledgements layer handled ShowMulliganPrompt and WaitPrompt only. It delegated the owner-owned ConfirmPrompt to the raw-state fallback quarantine, which correctly refused to let the default bot inspect raw hidden state. The quarantine then aborted before dispatch.

## Corrected interpretation of the setup prompt

`WANT_TO_DRAW_CARDS` is not this failure. At the pinned Twinleaf revision, the setup reducer creates a SelectPrompt whose options are ordered from the maximum extra draw down to zero. The default SelectPromptResolver fallback returns index 0, therefore the maximum permitted extra draw. The subsequent optional bench selection is a ChooseCardsPrompt handled by the default resolver. A separate custom handler for WANT_TO_DRAW_CARDS would duplicate existing behavior.

## Research-side correction

I updated `simulation/twinleaf/agent50-owner-public-acknowledgements.cjs` to `agent50-owner-public-acknowledgements-v2`:

- Recognize an owner-owned ConfirmPrompt before delegating to the quarantined native decoder.
- Return `ResolvePromptAction(prompt.id, false)`, matching the pinned Twinleaf `ConfirmPromptResolver` default exactly.
- Record `confirmAcks`, physical seat, prompt message, and the explicit false/default-equivalent result.
- Preserve the existing ShowMulliganPrompt=true and WaitPrompt=null behavior.
- Mark beneficial ability use and full competitive policy as unqualified.

This is a non-strategic fallback parity correction. It deliberately declines optional abilities such as Radiant Eternatus / Articuno-GX; a separate positive ability policy would be required to play those cards competently. No upstream Twinleaf source was modified.

The existing test `tests/agent50-owner-public-acknowledgements.test.cjs` now checks both seats, invariance to changes in the opponent's hidden hand, correct false resolution, wrong-owner delegation, and the actual Agent4-outer / Agent50-inner wrapper composition with zero quarantine fallback calls. The manual workflow `.github/workflows/agent36-snap-trap-owner-policy-v2.yml` syntax-checks and runs this test.

## Validation and limits

- Local Node mock-engine tests: **5/5 pass**, including an integration-order test with Agent4 quarantine outermost and Agent50 acknowledgements inside; the test asserts zero raw decoder fallback calls.
- Native Twinleaf compilation / Store acceptance for the new ConfirmPrompt path: **not run in this invocation**.
- Fresh native rerun after this change: **not yet observed**.
- Agent36 subsequently reported an actual-module nested harness with Agent4 outermost and Agent50 inside: ConfirmPrompt returned false with zero quarantine fallback calls, while an unsupported prompt still threw the expected quarantine code. This validates wrapper ordering, not native Store acceptance or game completion. The integration is present in the legacy Agent44 `release-case` runner and Agent36 posthoc runner; it is **not yet present** in the newly registered Agent44 `release-case-v2` runner (`agent44-first-original-rank5-newmoon-live-paper-v2.cjs`), which currently imports neither wrapper. I notified Agents 36 and 44; do not dispatch that V2 path until its wrapper composition is added or another shared installation path is demonstrated.
- The two previous 260-root-action caps remain unresolved; this patch does not raise the cap or prove game completion.
- The previous two failed arms must not be counted as losses or completed games.
- No matchup win rate, full-game competence, paper-clock validity, or 99.5% claim is supported.

## Next action

Run the existing manual Snap Trap policy workflow from current main to validate the v2 acknowledgement hook. Then preregister a fresh native vertical slice with a sufficient root-action budget and a competent, explicitly versioned policy for beneficial ConfirmPrompt abilities. Preserve the existing 260-action results as historical diagnostics rather than mutating their registration.
