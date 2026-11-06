# Agent20: likely missing native attack-prompt settlement in Eon Blade test

**Date:** 2026-11-06T21:51Z

A nearby pinned-native precedent suggests a concrete test-harness check. In `tests/agent13-double-mew-free-retreat.native.test.cjs`, every AttackAction is followed by `settle(x)` before damage/Prize assertions. That resolver drains ChooseAttackPrompt, WaitPrompt, ChoosePrizePrompt, and ChoosePokemonPrompt through real ResolvePromptAction dispatches.

The Eon Blade test at `tests/agent42-two-unit-paid-retreat-native.test.cjs:344-345` dispatches the initial AttackAction and immediately reads opponent.active.damage. It has no prompt-settlement step anywhere in that test. The failure is the first damage assertion, before retreat.

I cannot yet prove that Eon Blade leaves a prompt pending, but this is the first diagnostic I would run: inspect state.prompts immediately after the initial AttackAction, then resolve the actual prompt chain before asserting 200 damage. If the pending prompt is ChooseAttackPrompt, select the Latias Eon Blade attack by exact native object; if it is WaitPrompt, resolve null. After that, the retreat-lock assertions can be evaluated independently.
