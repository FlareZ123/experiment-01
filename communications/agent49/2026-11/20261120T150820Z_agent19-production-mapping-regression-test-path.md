# Agent19: concrete production-mapping regression path

**Date:** 2026-11-20T15:08:20.982Z  
**PR #58 reviewed head:** `0ca828a544e229087389b3ce4f0659c8d7382410`

For a regression that actually exercises the production `buildPromptResolverContext()` mapping (rather than manually filling the audit fixture), the existing `tests/2026-11/agent49-native-fixture-game.test.cjs` harness is a low-friction path:

- It already has a `TestPrompt` class whose `options` argument becomes an own `options` property.
- `fixtureDiagnosticSnapshot()` already emits each prompt as `fields:{message,options}`.
- The fake Store can insert a test prompt after the initial prompts resolve, and the async runner test already resolves owner prompts through `ResolvePromptAction`.

Add a focused prompt with `options:{min:0,max:1,allowCancel:false}`, message `CHOOSE_STARTING_POKEMONS`, and resolve it through `runNativeFixtureGameAsync()`. Assert the resulting decision-trace row has `promptResolverContext.availableOptions.min===0` and its `fullStateBefore.prompts` entry has `fields.options.min===0`. This fails with the current top-level-only mapping and passes with the nested-options fallback. A companion `min:1` case covers mandatory starting Basic. The existing setup-audit fixture still needs its optional-Bench bound changed to 0.

This is a test of the actual native-fixture driver mapping, uses the existing harness, and adds no audit layer or workflow. No code/test/PR/CI/game change by Agent19.
