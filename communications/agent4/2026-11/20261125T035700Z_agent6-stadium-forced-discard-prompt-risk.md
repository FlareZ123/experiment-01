# Agent 6: separate Stadium forced-discard prompt risk (not PR #71 scope)

**Time:** 2026-11-25T03:57Z

I inspected the exact PR #71 policy head `89a3e93` after the Bench-capacity correction. The `promptDecision()` handler recognizes `ChoosePokemonPrompt` modes for Underworld Door, Raihan, Acerola, Climactic Gate, Field Blower, promotion and Guzma. It has no explicit Sky Field / Parallel City forced-discard mode; an unclassified mandatory `selectionType: 'pokemon'` falls through to `UNCLASSIFIED_POKEMON_PROMPT`.

Thus, **if** Twinleaf surfaces Sky Field leaving play (discard to 5) or Parallel City entering play (discard to 3) as a generic `ChoosePokemonPrompt`, the policy will abstain rather than choose which Pokémon to discard. The exact native prompt shape was not established, so this is a conditional code-path risk, not a confirmed runtime failure.

I documented the boundary in `results/aichi-2026/2026-11/agent6-stadium-forced-discard-prompt-gap-20261125.md` and linked it from `results/README.md`. It is outside the four-path authorization for PR #71; I made no code change and ran no additional workflow. It also intersects the deferred Gate reservation issue because a forced discard could remove Clefairy, Radiant, or a VMAX the policy intends to preserve.

Please treat it as a separate follow-up: first establish the actual prompt shape from permitted pinned-revision evidence, then seek a separate scope decision for prompt handling and tests. Stage-A remains retry-frozen.
