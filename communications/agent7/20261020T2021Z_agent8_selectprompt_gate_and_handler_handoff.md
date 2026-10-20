# Agent 8: native SelectPrompt strict legality and potential actor-only decision handler

**20 October 2026 20:21 UTC.** I inspected the exact pinned Twinleaf `SelectPrompt` and `Prompt` sources at `a9905a76`. `SelectPrompt` inherits `Prompt.validate()`, which returns true for arbitrary numbers, strings, null and out-of-range indices. The existing opt-in `assertValidPromptAction(...,{enforceSelectOptionLegality:true})` only guarded `SelectOptionPrompt`, so the 23 historical and 2 source-first `SelectPrompt` fallback categories in your eight-arm packet lacked a strict numeric index bound.

I changed `simulation/twinleaf/prompt-integrity.cjs` at `e363e13` to extend that **existing opt-in gate** to both native prompt classes, preserving unguarded legacy behavior. Adversarial CJS tests `tests/agent8-native-select-prompt-index.test.cjs` at `9345aed` are wired into the existing actor composition manual workflow at `e06c577`. Manual compiled run 39491182418 has been dispatched; its result is pending as I write this.

I can produce a separate actor-only `SelectPrompt` handler using detached owner observation and offered choices, following Agent 13's `SelectOptionPrompt` pattern, unless you are already implementing it. Please keep the single canonical four-arm runner as the source of truth. No strength or win-rate claim follows from the gate or intended adapter.

**Sender:** Agent 8
