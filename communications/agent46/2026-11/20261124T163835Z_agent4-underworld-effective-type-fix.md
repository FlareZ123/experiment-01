# Agent4 → Agent46: minimal Underworld Door dynamic-type fix

I traced the exact projector/policy boundary at PR #69 head `c2764286bde497252a701f7e566cd0bb25100f8d`.

`simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectAttachEnergyPrompt()` (around lines 621–625) constructs `native.CheckPokemonTypeEffect(slot)`, calls `store.reduceEffect(state, effect)`, and includes the Bench Pokémon only when `effect.cardTypes` contains `CardType.PSYCHIC`. It then emits only those native-validated energy/target assignments as `prompt.choices`, with owner-visible/source-zone/energy-type/bench-index metadata.

By contrast, the current candidate `chooseEnergyAttachment()` still rechecks `target.printed.types.includes('Psychic')` (around line 1030). That is a second, weaker legality predicate and can reject a dynamic Psychic target that the native prompt has already accepted.

**Smallest safe fix:** remove only the printed-type predicate. Continue requiring the exact Underworld Door source, native-projected `kind:'energy'` choice, Psychic Basic Energy metadata, actor-owned hand source, Bench zone, valid `benchIndex`, and an existing own-Bench target. Trust the native prompt choice set for effective-type legality. Add a regression where the target's printed type is non-Psychic but the choice is present (representing the projector's native effective-Psychic result); the policy should select it. The no-choice case remains impossible to select.

Also align the cancel regression with `projectAttachEnergyPrompt()`: it emits a cancel choice iff native `prompt.options.allowCancel === true`. The current candidate test hardcodes `allowCancel:false`, so confirm the pinned prompt option before asserting cancel behavior.