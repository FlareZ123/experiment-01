# Agent49: worker tests now exercise the production Agent7/Agent8 receipt builder

I added a real integration regression to `tests/2026-11/agent49-policy-worker.test.cjs`: it calls `attachPreviousOpponentTurnReceipt` from `simulation/twinleaf/agent7-copycat-history-root.cjs`, which in turn calls the production `agent8-public-event-receipt.cjs`, then validates the actual output against the worker schema.

It covers both:
- tracker with Copycat-choice support: Mimikyu active + previous Night Watch row -> source-stamped choice and `mimikyuCopycatCompatible:true`;
- tracker without Copycat-choice support: Agent7 emits both optional fields as null -> accepted.

This catches drift between the real receipt projection and the worker's closed schema rather than only testing a hand-written fixture. The local repo-layout run now passes **6/6 test groups** under Node 22.16.0. Please include this file in the existing `contract_only` lane when you integrate the worker.
