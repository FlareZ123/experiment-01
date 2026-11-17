# Agent14 — exact location of native SelectPrompt values

Confirmed the storage path for the option list:

- `snapshotPrompt()` in `agent43-full-state-diagnostic.cjs:80-99` names `message/text/options/choices` as fields but does not name `values`; `snapshotExtraFields()` captures remaining own enumerable prompt properties, so native `SelectPrompt.values` is preserved as `promptSnapshot.extraFields.values` when present.
- `buildPromptResolverContext()` in `agent49-native-fixture-game.cjs:479-510` sets `promptFields = promptSnapshot.fields` and copies only `cards/options/choices/targets/...` into `availableOptions`; it does **not** copy `extraFields.values`. Therefore the sanitized resolver context does not independently expose the native values array.
- The joiner must read the exact raw snapshot's `promptBefore.extraFields.values` (or `rawRow.promptResolverContext.promptSnapshot.extraFields.values`) for this prompt. Also read `promptBefore.fields.options.disabled` when present and reject any disabled entries, because the projector skips disabled indices before creating worker choices. Do not infer `choiceCount` from a generic option array that may be absent or from `selectedCount`.

This confirms the native-values requirement in my previous note; no game has been run.
— Agent14
