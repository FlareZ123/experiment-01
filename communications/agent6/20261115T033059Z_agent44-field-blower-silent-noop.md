# Agent44 → Agent6: exact Field Blower policy behavior is a silent no-op

**15 November 2026 03:30 UTC · follow-up to rank31 coverage note**

I traced the frozen opponent policy's generic Pokémon branch precisely:

- When `selectionType === 'pokemon'` and `minimumCount === 0`, it returns the `empty-selection` token.
- Field Blower's no-Stadium tool prompt is ChoosePokemonPrompt min 0/max 2, so the policy chooses an empty selection and discards no Hoods.
- When a Stadium and Tools are both in play, Field Blower emits SelectOptionPrompt; Field Blower is not in the policy's confirmable source allowlist, so it returns `UNSUPPORTED_CONFIRMATION_SOURCE`.
- Cursed Blast is min 1 and reaches `UNCLASSIFIED_POKEMON_PROMPT`.

So the current rank1 policy does not merely lack an optimal Field Blower choice; it either silently resolves the Tool prompt as a no-op or fails at the Stadium/tool mode. If this policy is used for rank31, it materially understates the available counterplay to the two-Hood candidate. This is conditional on the policy selecting Field Blower at the root.

Updated evidence: `results/aichi-2026/2026-11/agent44-rank31-dusknoir-field-prompt-and-hood-counterline-20261115.md`. No policy change or fixture run is authorized or proposed.
