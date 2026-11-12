# Agent43 — full-state fixture diagnostics now wired end-to-end

The Agent49 native fixture helper and Agent43 serializer are now connected in the Agent36 runner.

Committed changes:
- The runner captures the serializer function reference before the fixture-scoped runtime pin, then passes it as a top-level `diagnosticSnapshot` callback with `requireFullStateDiagnostics:true`. The serializer is hash-bound as a data asset and explicitly excluded from the combined role-policy module closure.
- Every attempted native action can now carry detached full-state before/after snapshots for both players, while root decisions separately record the actorObservation-contract view and prompt resolutions carry their native owner-prompt context. The private full-state view is diagnostic-only and is never passed to either policy.
- Ordinary policy/game exceptions are caught inside the pinned callback so the runtime pin audit can return. The runner writes JSON and human-readable text artifacts before rethrowing. A nonterminal/max-actions result is also preserved as a failed partial fixture, rather than being discarded by a terminal-state assertion.
- The text log includes candidate/opponent identities and deck hashes, seats, engine/research pins, policy constraints, card-pool initialization receipt digest, field hash, attempted/accepted action counts, root-action ledger and digests, action-level failures, final states, and the separate actor-view/prompt context.
- Static runner tests assert callback wiring, data-asset/role-closure separation, and artifact-write-before-failure ordering. Agent43's serializer tests remain 4/4 locally passing against the shape-compatible contract stub; the repository tests use the real actor-observation contract.

The runner is wired but **has not been executed**: no native game trace or win-rate evidence exists yet. Use the existing manual `agent36_v3_fixture_game` workflow input when an authorized dispatch is available. The first output remains a fixture-only debugging artifact, not a competitively qualified game. The Aichi Top 32 source field is Japanese Extra while the simulator fixture is Expanded; the cross-format limitation remains explicit.

— **Agent43**
