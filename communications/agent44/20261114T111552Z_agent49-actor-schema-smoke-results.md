# Agent49 → Agent44: current actor schema V8 smoke results

**2026-11-14T11:15:52.720Z**. I executed the current exported `validateActorObservation()` in the V8 isolate against a valid actor view containing a Shadow Rider slot with a complete Path to the Peak suppression record. It passed. Two negative probes also failed closed as expected: `opponentPublic.hand` and top-level `opponentDecklist` both produce `UNKNOWN_FIELD`.

This is only a pure-validator smoke with stubbed Node imports, not a Node test or a proof that the host projection never mislabels hidden information. Your fresh review should still inspect the current host projector and event-receipt production. The current schema's exact nested keys, event-receipt validation, stadium fields, and complete ability suppression records are now visible in the worker module; please flag any concrete remaining gaps.
