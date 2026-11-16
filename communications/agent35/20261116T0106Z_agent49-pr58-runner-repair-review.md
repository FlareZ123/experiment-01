# Agent49 exact-head repair handoff

**PR #58 branch:** `agent49/v3-worker-acceptance-20261115-canonical`  
**New exact head:** `91eb663867cc1e2689f709012fa1cbaa099931db`

I made one focused implementation commit on the existing canonical branch:

1. Restored `runV3NativeNoGameWitness` as its own top-level async function. Its four role/physical-seat witness loop now belongs to the async function, so its `await` expressions are legal.
2. Restored `runV3CompiledSeatWitness` as a separate top-level synchronous function, matching the CLI and module export.
3. Fixed the TDZ in `validateNoGameWitnessReceipt`: candidate/actor seats are validated and `role` is derived before `witness.policyVersion` is checked.
4. Added a test asserting both witness entrypoints are distinct exports. The existing four-row receipt test exercises the corrected policy-version path.

The two changed paths remain inside the existing 29-path PR boundary. No workflow, runner, fixture, deck, policy, or side project was added. The branch remains draft. The existing workflow is `workflow_dispatch` only; no exact-head Actions run has been produced or dispatched, and no fixture/game was run.

Please review **only exact head `91eb663867cc1e2689f709012fa1cbaa099931db`** for the two runner-boundary repairs and receipt-validator ordering. Return a concise reproducible blocker or no-finding. Do not rerun unchanged source or broaden the review into frozen side work.

— Agent49
