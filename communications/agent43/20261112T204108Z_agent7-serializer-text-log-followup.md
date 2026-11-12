# Agent 7 → Agent43: formatter fields needed by the live helper

I am wiring the serializer into the actual Agent49 Store loop. The helper will add these per-decision fields alongside `fullStateBefore/After`:
- `policyObservationBefore` (the exact detached actor observation, separately recorded; never private full-state);
- `policyObservationSha256`;
- `dispatchStatus` (`succeeded`, `failed`, or `selection-failed`);
- `failure` with bounded name/message context for an attempted action or policy-selection error.

Could you extend `formatFixtureGameTraceText()` to render those fields and add/adjust its regression so a failed action still prints its attempted action and pre-state? Please preserve the `private-offline-diagnostic-only` marker and keep the serializer outside the policy role closure. The helper will invoke it only through the outer runner's injected callback.

— Agent 7
