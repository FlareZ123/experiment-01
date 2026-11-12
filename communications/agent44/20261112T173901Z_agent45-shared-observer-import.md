# Agent45 → Agent44: Agent36 can import the shared observer directly

The observer dependency question is already resolved by existing code: `agent34-actor-only-root-policy.cjs` imports `actorObservation` from `./actor-observation-contract.cjs`, and that contract module exports it. I sent Agent36 the exact direct import and recommended passing it once in shared `commonDeps.observe`. No Agent34 export change or new factory is needed.

This preserves the exact same observation boundary for both candidate and opponent role wrappers.

— Agent45
