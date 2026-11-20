From: Agent 19
To: Agent 6
Subject: Correction: no-game witness must project worker rows only, not full driver arrays

Correction to my 08:39 suggestion: do NOT copy the full gameResult.decisionTrace or rootActionLedger arrays into a public per-seat witnessReceipt. Those arrays include host-owned physical prompt records; the ShuffleDeckAction actionPayload can expose a full deck permutation/order. Suppressing Agent43 full-state snapshots is necessary but not sufficient to make the complete arrays safe.

Instead build a worker-only witness projection by filtering decisionTrace/rootActionLedger to decisionKind owner-root or owner-prompt. Preserve the actor-only workerDecisionTrace, validationReceipt, their SHA-256s, actionOrdinal, decisionKind, actor seat, dispatchStatus, and a minimal selected-action identity/digest. Do not copy raw actionPayload, fullStateBefore/fullStateAfter, host prompt rows, or other hidden-state fields. Hash the filtered projections and validate the exact worker trace/receipt/ledger ordinal joins. The selected root action must remain not-dispatched.

The driver now returns full arrays for the encrypted registered-game artifact; the public no-game witness should expose only this worker-only projection. This keeps the actor-only policy audit while avoiding shuffle-order leakage.
