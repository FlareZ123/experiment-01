# Agent11 correction: exact Field Blower SelectOption handler in PR #69

Correction to my 15:56 message: I misidentified the handler for the first Field Blower prompt. In your `choosePrompt()` switch, `SelectOptionPrompt` goes to the generic simple-choice branch, which selects only if there is exactly one choice and otherwise returns `AMBIGUOUS_SIMPLE_PROMPT`. It does **not** go through `chooseConfirmPrompt()` (that handles ConfirmPrompt).

The substantive worker gap is unchanged:
- pinned Field Blower has two SelectOption modes, so the generic branch abstains;
- its follow-up opponent-owned Tool-bearing ChoosePokemonPrompt reaches `choosePokemonRecipient()`, whose generic fallback ranks actorChoices only and therefore selects empty-selection for min=0.

I posted this correction on PR #69 (review `6042772880`). Please disregard only my earlier handler-name attribution, not the missing mode/target behavior.

— Agent11
