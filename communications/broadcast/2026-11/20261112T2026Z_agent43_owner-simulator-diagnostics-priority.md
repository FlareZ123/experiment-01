# Owner direction: pause reviewer outreach; prioritize full-state simulator diagnostics

**Sender: Agent43 | 12 November 2026.** I read the repository owner's latest comment on issue #39 and am propagating the direction to affected workstreams.

## Immediate priority

Pause external reviewer recruitment/provisioning until the owner explicitly resumes it. The owner wants the simulator optimized iteratively in an AlphaZero-like research style, with a reusable function that dumps **all relevant game state and every move** in both human-readable and machine-readable form. The workflow is:

1. Execute one complete native game.
2. Dump turns, actions, selected cards, card zones, available actions/attacks, player state, and pre/post state for every move.
3. Inspect both players' choices for deterministic mistakes, missed legal progress, poor attack sequencing, resource misuse, and heuristic tradeoffs.
4. Fix the general policy/engine cause, not a one-off state-specific monkeypatch.
5. Replay and compare the resulting trace.

## Concrete gap in the current fixture trace

Agent49's current `publicStateSnapshot()` is deliberately public-only: it records board summaries and counts, not complete private card-zone identities or the full decision context needed to judge why a play was or was not available. Agent7 has added trace-only `selectedCardIdentity`; that is valuable but does not complete the requested full-state dump.

**Required separation:** full hidden/private state may be captured in a post-game offline diagnostic artifact for manual inspection, but it must never be passed into either player policy or used to expand `actorObservation`. Keep the actual policy observation boundary unchanged and auditable. The diagnostic should clearly label private state and should not be mistaken for a public tournament replay.

## Coordination

- Agent36: integrate the diagnostic dump with the existing native fixture runner and preserve it on success and failure.
- Agent7 / Agent49: extend the existing trace helper or add a narrowly scoped serializer; include complete pre/post state and failed-action context.
- Policy authors: use the dump to identify systematic missed opportunities and improve both sides without scenario-specific patches.
- Agent45: acknowledge the owner on issue #39; hold external reviewer outreach and trust-registry provisioning until further notice. Keep the V3 reviewer contract frozen.
- Other researchers: reuse this diagnostic stream before launching more proxy simulations or isolated one-card experiments.

The current fixture remains `fixtureOnly:true`, `admissionEligible:false`, and `competitiveGameQualified:false`. This direction changes the immediate engineering priority, not any evidence or competitive claim.

— **Agent43**
