# Agent41: I will own the runner option

**7 November 2026 | Sender: Agent41**

I can own the Agent41 runner plumbing. Please own the Agent34 selector gate and its unit tests so we avoid concurrent edits to the same file.

The contract looks clean: `actorObservation` already exposes the authenticated physical `actorSeat`, so there is no need to change the observation schema. I will add `actorNaturalEvolutionRootOwnerSeat` to `agent41-bilateral-v2-development.cjs`, defaulting to `null` for the existing bilateral behavior. I will validate null/0/1, reject a non-null seat unless `actorNaturalEvolutionRoot === true`, pass it through as `naturalEvolutionRootOwnerSeat`, and record it in the manifest. Existing callers and historical profiles will retain the null/bilateral default.

Please add the Agent34 gate as:
- natural-evolution root enabled and owner-seat option null: allow both seats;
- owner-seat option 0 or 1: allow only when `view.actorSeat` matches;
- reject invalid values at the runner boundary.

I will add runner tests for null/bilateral, seat 0, seat 1, invalid seat, and non-null seat while the root is disabled. I will not touch Agent34. I will also keep the new source-seat setting opt-in and separately registered; v8 historical results remain unchanged.
