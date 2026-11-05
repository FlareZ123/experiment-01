# Agent 4: native setup Confirm settlement, both seats (5 November 2026)

**Status:** focused development guard and pinned native positive tested, **0 qualified paper games**. Historical v1 evidence is retained as-is. This does not choose a fixed 60 or change the Aichi 29/32 original-source authentication count.

## Failure and correction

The previous `simulation/twinleaf/agent4-owner-setup-confirm.cjs` v1 counted a selected setup `ConfirmPrompt` as `accepted` whenever `Store.dispatch(ResolvePromptAction)` returned without an exception. Pinned Twinleaf has silent no-op paths for missing/stale prompt entries, so a nonthrowing dispatch is insufficient to demonstrate a resolved prompt.

Version `agent4-owner-setup-confirm-v2-native-settlement` retains the **exact pending prompt object** at owner-only selection and its chosen `false` answer. Before dispatch it checks that object is still pending in the live Store. After the native Store returns, it requires **that same object's `result` equals the submitted answer**. The guard accepts genuine resolutions even when the Store removes the object from the currently visible prompts collection after settlement. A stale, absent, unresolved, or silently removed prompt causes code `OWNER_SETUP_CONFIRM_UNSETTLED`. Audit fields now separate `returnedWithoutThrow`, `settled`, `unsettled`, `rejected` and `accepted`; only settled answers increment accepted.

The owner policy still conservatively declines optional setup confirmations. This correction is about native **settlement accounting**, not strategic quality or printed effects. Neither physical board change nor competent play is inferred from prompt-result mutation.

## Reproduction

- Source: [agent4-owner-setup-confirm.cjs](../../simulation/twinleaf/agent4-owner-setup-confirm.cjs).
- Adversarial tests: [agent4-owner-setup-confirm.test.cjs](../../tests/agent4-owner-setup-confirm.test.cjs). Both physical seats: native dispatch returns unchanged, removes a prompt without resolving, or receives a stale originally selected prompt; all must reject. A positive resolved-then-removed prompt must count as settled. Previous owner-redaction and outer raw-decoder quarantine regressions remain.
- Pinned actual Store: [agent4-owner-setup-confirm-native.test.cjs](../../tests/agent4-owner-setup-confirm-native.test.cjs), original 60-card rank 5 source against the registered candidate on both physical seats, through the actual `Store` and outer quarantine. Requires an original setup `ConfirmPrompt` to be resolved before the next native unsupported interface; each native attempt stops fail-closed and provides **no completed game**.
- Execution: reused existing manual-only [Twinleaf completion run 42049469013](https://github.com/FlareZ123/experiment-01/actions/runs/42049469013), registered head `30d8370d30dd9c4bf535671c1f8f4919890e5095`. The new both-seat pure prompt control step **passed**, and the compiled pinned both-seat original-rank-5 native step **passed**. The workflow's other steps are separate. No new workflow definition or vendor change was made.

## Admission boundary and next action

The guard is opt-in, and Issue #25's single selected two-player release is not established by this test. Re-run it inside the steward-selected combined owner policy when deciding whether a setup Confirm reached its printed continuation. Preserve physical original/contender deals, actual player seats, errors, and root caps. Claim no paper legality of other card effects from this narrow settlement witness. This is compatible with Agent3's independently hardened in-game modal adapter and the 5 November Critic native-settlement gate.
