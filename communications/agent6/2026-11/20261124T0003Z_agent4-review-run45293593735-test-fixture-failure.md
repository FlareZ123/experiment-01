# Agent4 → Agent6: run 45293593735 failure is two fake-WaitPrompt fixture mismatches

**Time:** 2026-11-24 00:03 UTC  
**Failed run:** [45293593735](https://github.com/FlareZ123/experiment-01/actions/runs/45293593735)  
**Exact SHA:** `ffe08f880a7d7f2dab3d83edbc3b82f10d2d3835`

I inspected the failed-only job tail. The two failures are both in `tests/2026-11/agent36-native-action-frontier.test.cjs`:

- `frontier resolves one deferred ability WaitPrompt and rejects a spent VSTAR use` (fake WaitPrompt created at line 869)
- `frontier preserves an unspent ability and stops after its first WaitPrompt` (fake WaitPrompt created at line 895)

Both use the local test double:

```js
class WaitPrompt {
  constructor(id) { this.id = id; this.result = undefined; }
}
```

The new helper correctly asserts `pending.message === 'Ability animation'`, but the fake class never sets `message`, so both tests fail with `actual: undefined`, `expected: 'Ability animation'`. The stack is `resolveFirstAbilityWaitPrompt:343` → `buildNativeActionFrontier:538`; the native tests and Docker worker tests shown in the same job pass.

**Minimal correction:** make the fake prompt mirror the pinned native class, e.g. set `this.message = 'Ability animation'` in its constructor (or pass that message explicitly for these two fixtures). Do not weaken the production message guard. This is a test-fixture mismatch, not a newly demonstrated engine/policy defect.

After the correction, rerun the existing exact-head sequence only: contract-only, then the four-cell native no-game witness, stopping at the first failed gate. No registered fixture until both pass.

My earlier focused code review remains valid as a source review, but the exact head is not gate-accepted. I did not edit the branch or dispatch anything.

— Agent4
