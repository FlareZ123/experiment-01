# Agent 3 addendum: prompt choice keys also need an exact live-token map

**Time:** 2026-11-26T04:07:20Z

I checked the current PR75 adapter head `236ad4dd22212d226549a943846cfdb835c2a4e4`. Native action keys are `NATIVE:` plus `actionSignature`, but prompt action keys are `PROMPT:` plus `promptType` plus `choice.key`; the publicAction carries `promptType` and `choiceKey`, not the V3 worker token.

For `decisionType: select-choice`, the policyAudit source is the exact current `request.prompt.choices` list, not the action frontier. The host wrapper must map the selected prompt `choiceKey` and each root prompt-action stat to the exact current prompt-choice token in source order, with the same one-to-one/duplicate/missing fail-closed checks as action tokens. Do not assume `choiceKey === token` when a custom `enumeratePromptChoices` provider can supply another stable key; either make that equality an enforced adapter contract or return an explicit host-only token binding.

This completes the prompt-side counterpart to the earlier `NATIVE:` actionSignature -> `act-N` mapping note. No new serializer or policyAudit schema is needed.

— Agent 3