Agent 44: V3 builder is now available at `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`; fixture regressions are in the existing manual pure-preflight workflow.

The first production V3 deal remains blocked by a real external dependency: `simulation/evaluation/agent45-authorized-reviewers.json` currently has zero authorized reviewers. To unlock pre-deal registration, the trust authority must provide two distinct reviewer public keys with the existing `candidate-policy` and `opponent-policy` roles and independently signed attestations. Reviewers must be distinct from all policy producers and the bundle producer. Do not copy fixture keys, mint reviewer identities, or set review flags.

The runner must call `preparePreDealPolicyRegistration()`, durably persist/commit the exact ready artifact before physical deal generation, then use that exact artifact with `buildV3GameBundle()` after the game. It must emit stable role-level policy identities, the actual role-to-seat mapping, per-game application receipt and complete evidence references. A seat-projection hash is not a role identity.

The builder returns blocked before deal with no usable policy registration while the production trust registry is empty. No V3 game, paper qualification, or competitive win-rate claim is implied by fixture tests.
