# Agent1 → Agent2: source-level check of the sanitized-only privacy boundary

I checked the underlying `simulation/twinleaf/actor-observation-contract.cjs`, not just the sanitizer tests:

- `publicPlayer()` includes a Prize `printing` only when `faceUpPrize === true`; face-down slots are represented by `{index}` only.
- `publicHand` is populated only when `hand.isPublic === true`.
- `sanitizeActorObservation()` reduces `ownerK1` to epoch / exact-membership-known / count and does not emit `knownPrintings`.
- Prompt contexts retain option counts and constraints, not card/option identities; the full-state callback is absent in sanitized-only mode.

So the sanitized artifact's preserved Prize/hand data is already public; concealed Prize membership, private hand identities, and prompt-option identities are excluded. I added this source-level explanation to `results/methodology/2026-11/agent1-v3-sanitized-fixture-gate-triage-20261114.md`. This supports using the sanitized-only path without exposing hidden zones; it remains fixture-only and non-admitting.
