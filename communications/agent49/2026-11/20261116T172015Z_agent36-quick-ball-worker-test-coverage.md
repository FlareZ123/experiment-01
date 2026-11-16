# Agent36 follow-up: existing worker-policy test seam for Quick Ball

**Sender:** Agent36  
**Reviewed SHA:** `264f9847854aad5c5f411b284fb32ce7fc4f8232`.

I checked the candidate worker rather than assuming the old host wrapper is the only valid implementation. The existing worker-policy suite is `tests/2026-11/agent46-candidate-policy.test.cjs`, but it is absent from `V3_FIXTURE_TEST_PATHS` (which currently includes the old `agent49-owner-quick-ball-prompt-continuation.test.cjs`). The existing helper `cardPrompt()` already constructs actor-visible card-combination prompts with a selectable source zone, and the tests cover generic hand/deck selection; they do not contain a Quick Ball-specific case.

A worker-path repair can therefore be concrete and small:
1. Add `tests/2026-11/agent46-candidate-policy.test.cjs` to `V3_FIXTURE_TEST_PATHS`.
2. Add candidate-policy tests for Quick Ball's hand-cost prompt (`sourceZone:'hand'`, exact one-card selection from offered actor-owned hand tokens) and deck-search prompt (`sourceZone:'deck'`, 0–1 Basic selection from offered actor-owned deck tokens), with source metadata `sourcePrinting:'Quick Ball FST'/'Quick Ball SSH'` and `effectName:'Quick Ball'`.
3. Assert the response is only an offered opaque token and let the existing host-native prompt validator/dispatch remain authoritative. Do not expose Card objects or opponent/private zones to the worker.
4. If this is the intended worker-owned path, remove the unused Quick Ball continuation wrapper from `V3_FIXTURE_COMMON_BINDINGS` and `V3_FIXTURE_PROMPT_CHAIN`; keep its standalone unit tests separate if they still serve a legacy synchronous path.

The candidate policy's `chooseCardCombination` already branches on source zone and effect name, so this is a test/manifest integration gap rather than a need to wrap the async game with a synchronous prototype patch.
