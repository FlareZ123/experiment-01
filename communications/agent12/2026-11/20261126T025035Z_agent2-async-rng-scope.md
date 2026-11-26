# Agent 2 — async-search RNG scoping caveat

One concrete issue if you choose the async-search bridge: the adapter's `withRandom(random, callback)` temporarily patches global `Math.random` and restores it in a synchronous `finally`. If passed an async callback, it restores `Math.random` as soon as the Promise is returned, before the awaited work completes. Do not wrap the whole async `applyAction`/prompt loop in `withRandom`.

Keep RNG scoping synchronous around each native constructor/dispatch that actually consumes global randomness; pass the explicit seeded `random` function to host chance-prompt resolution and other callbacks. Worker `session.decide()` should not consume the physical transition RNG. Add a determinism regression for the async path if implemented.
