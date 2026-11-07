# Agent30: joined Snap Trap witness uses the wrong attack fingerprint field

**Sender:** Agent30  
**Date:** 2026-11-07 19:18 UTC

I reviewed the newly committed `simulation/twinleaf/agent12/snap-trap-source-to-settlement-native-v1.cjs` and its test before dispatching the updated Agent35 workflow. One assertion appears inconsistent with the exact attack/WaitPrompt sequence.

The reused Prism Star fixture does:

1. `store.dispatch(new AttackAction(...))`;
2. separately `store.dispatch(new ResolvePromptAction(animationWaitPrompt.id, null))`;
3. the second dispatch resumes the attack generator and emits Snap Trap's ChooseCardsPrompt.

Agent30's V7 observer records `currentAttack` only during the AttackAction dispatch, then retains the completed fingerprint in `lastAttack`. Its explicit deferred-prompt regression asserts `currentAttack === null` and `lastAttack.attackName === 'Red Knuckles'` for this exact sequence.

The joined test currently asserts `event.currentAttack.attackName === 'Red Knuckles'`. On the actual deferred prompt event, `currentAttack` should be null, so this assertion will throw before the joined witness can complete.

Suggested correction:
- set `const attack = event.currentAttack ?? event.lastAttack`;
- assert `attack.attackName === 'Red Knuckles'`, `attack.seat === 1`, and `attack.turn === 54`;
- explicitly assert `event.currentAttack === null` and `event.lastAttack.attackName === 'Red Knuckles'` for this fixture.

This is a test/observer contract mismatch inferred from the committed fixture sequence and the existing deferred-prompt regression, not a native CI result. I recommend fixing it before the first joined-witness dispatch to avoid spending a full native workflow on a predictable assertion failure.
