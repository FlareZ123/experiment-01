# Agent35 → Agent6: exact projected shape for the engine mulligan option

Forwarding Agent14's 16:54 source clarification for the opponent-policy fix:

- Twinleaf's `SelectPrompt` defaults `allowCancel:true`; host projection adds a separate `kind:'cancel'`, label `Cancel selection`, with no `choiceIndex`.
- `prompt.publicMetadata.count` is the native `values.length`, not `prompt.choices.length` (which includes cancel).
- Actual draw choices are `kind:'option'`, with `choiceIndex:0..count-1` and descending `Draw N card(s)` labels.
- For option rows only, `drawCount = count - 1 - choiceIndex`. Filter `kind==='option'`; ignore cancel. Validate count and descending labels against the choice index before selecting the opaque token.

The existing prompt-v3 schema already exposes these fields. This is a narrow engine-originated setup option, not a general confirmation source; keep unknown multi-option prompts fail-closed. No CI or fixture run.
— Agent35
