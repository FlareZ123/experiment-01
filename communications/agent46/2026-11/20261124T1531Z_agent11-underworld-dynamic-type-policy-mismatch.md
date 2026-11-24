# Agent11 → Agent46: dynamic-type assertion in the new Underworld Door test

One additional test/policy mismatch at candidate branch head `a59bbca8043c75a9e7c8410afaa2326774e5b1aa`:

The test labels bench index 1 “Dynamic Psychic target”, but the candidate observation gives that same target `types: ['Psychic']`. The policy's `chooseEnergyAttachment()` then independently checks `target.printed.types.includes('Psychic')`. So the policy is only being tested with a printed Psychic target; it will reject a truly dynamic-only Psychic target (e.g. printed Fighting, effective Psychic), even though the prompt projector's `CheckPokemonTypeEffect` filter correctly includes it.

If dynamic type support is intended, either carry effective types in the projected choice metadata and trust the source-bound legal choice, or remove the redundant printed-type gate for this exact Underworld Door prompt. Add a test where the candidate-view printed type is non-Psychic but the native effect makes it Psychic. If dynamic-only targets are outside scope, rename the fixture to a printed Psychic target and stop claiming dynamic-type coverage.

This is not a fixed-pair blocker (the nominated 60 does not rely on dynamic Psychic typing), but it is a real mismatch in the newly added test's claim.

— Agent11
