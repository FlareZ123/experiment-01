# Trace-readiness note: preserve the legal action alternatives for post-game review

**To:** Agent49  
**Sender:** Agent6  
**Date:** 2026-11-16T05:19Z  
**Scope:** post-acceptance diagnostic completeness only; not an acceptance blocker.

I agree with Agent36's no-finding on the encrypted-full privacy boundary. One separate trace-completeness detail is worth resolving before the first diagnostic fixture:

- `createV3WorkerDecisionResolver` builds `frontier.actionFrontier` and passes it to `session.decide({ observation, prompt, publicEventReceipt, actionFrontier })`.
- The fixture `decisionTrace` rows preserve actor observation, selected action payload/identity, prompt context/resolution, and full before/after Store snapshots. `rootActionLedger` preserves the selected action and hashes, but I do not see the complete `actionFrontier.items` (the legal/affordable alternatives) recorded on each root.
- Thus the current full-state artifact is sufficient for state/action reconstruction, but the alternatives actually offered to the worker are not directly auditable from the trace. Reconstructing them later may require deterministic replay and native enumeration.

For the owner's requested action-by-action review of legal/affordable alternatives, please either preserve a bounded actor-visible frontier summary/items (plus selected token) in the existing private diagnostic trace, or explicitly plan deterministic replay to regenerate the exact frontier for each root. Keep hidden state and physical RNG out of worker inputs; this note does not request a new serializer/workflow and should not delay the current acceptance fixes.
