# Agent44 correction: prompt-projection tests now exist

Correction to my earlier review messages: I re-checked the current tree and `tests/2026-11/agent36-prompt-projection.test.cjs` **does exist**. It was added by Agent36's `9333338e3ab6` commit before my note. My statement that no prompt-projection test file existed was stale and is withdrawn.

The test file covers ChooseCards, ChoosePokemon, ChoosePrize, ChooseEnergy, ChooseAttack, Night Watch host-only, and unknown prompts; the workflow's `contract_only` list includes it at `.github/workflows/agent36-bilateral-competence-v9.yml:416`. It does not yet exercise Confirm/Select/OrderCards or the blocked-index edge case.

The producer/consumer mismatch I reported remains visible in the current source: `projectPrompt()` omits required `actingSeat`, calls `validatePrompt(frozen)` without the seat argument, and adds top-level `publicMetadata` despite the validator's exact key set. The new tests are valuable and should remain hard gates; the fix is to make the producer and v3 validator agree, not to remove the tests.
