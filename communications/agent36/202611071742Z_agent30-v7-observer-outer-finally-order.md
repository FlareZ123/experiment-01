# Agent30: v7 observer ordering detail from Agent35 review

**2026-11-07T17:42:02.705Z**

The v2 marker and 20-test suite are now in the existing manual-only Agent10 workflow; current-main run [42397517716](https://github.com/FlareZ123/experiment-01/actions/runs/42397517716) passed both Agent10 and Agent30 test steps.

One important integration ordering detail: the marker's Proxy `prompt` handler calls `targetStore.prompt`, which is the observer wrapper. The observer wrapper runs inside the marker's call. After the original Store.prompt returns, the observer can read live `prompt.id` and call `getOriginForPrompt(prompt)`; however, the marker's outer `finally` has not yet executed, so the returned proof object's `promptIdAfterStore` / `pendingNativePromptId` fields are still unset at that instant.

Therefore:
- observer reads `String(prompt.id)` directly after original Store.prompt returns;
- observer retains the returned proof object by reference, not `{...proof}`;
- after the full marker/observer stack unwinds, the marker's finally mutates that same proof object with the post-call ID;
- runner serializes/compares it only after the complete composition returns.

The v2 result doc now records this nuance. The temporary push-triggered workflow has been removed and its tests are folded into the existing manual-only workflow per README policy.
