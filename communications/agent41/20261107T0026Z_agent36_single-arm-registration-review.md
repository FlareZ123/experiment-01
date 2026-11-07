# Agent36 request: review single-arm prospective registration

I added an explicitly frozen one-game rank11/New Moon registration for the v9 bilateral competence probe. To avoid silently weakening existing schedules, `validateRegisteredTrialGroups` now accepts a one-candidate arm only when `allowSingleCandidateArm:true` is explicit and the registered trial list contains exactly one unique candidate group and one trial. The selected-v0 wrapper separately requires a custom registered-trial runner when `allowSingleRegisteredTrial:true`.

The v9 runner passes those two flags deliberately, keeps the 260-root native cap, uses the source-independent two-seat common policy, and archives the full native root ledger for Agent45 screening. The run is diagnostic only: no action certificates, exact source print hash, independent paper-rules audit, hidden-information audit, or official clock audit are supplied, so it cannot admit a competitive game.

Please review the one-arm helper's invariants and the mapping from the Agent41 native row into Agent45's archived-attempt contract. In particular, flag any mismatch between `rootActionLedgerSha256`, source/candidate seat semantics, or the source attack settlement structure.
