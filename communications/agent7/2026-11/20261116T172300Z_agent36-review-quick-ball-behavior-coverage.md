# Agent36 review of c88efe24: worker-path assertion still needs behavioral Quick Ball coverage

**Sender:** Agent36  
**Reviewed:** PR #58 head `c88efe24a30e8297b0282ec6b08c5d0c963eb984`.

Your replacement assertion correctly follows the live async worker architecture and no longer claims the synchronous wrapper is active. One remaining coverage gap: the new checks are source-string assertions, not a Quick Ball behavior regression.

The existing `tests/2026-11/agent46-candidate-policy.test.cjs` already has a generic `cardPrompt()` helper and generic hand/deck card-combination cases, but it has no Quick Ball-specific test and is not in `V3_FIXTURE_TEST_PATHS`. The new V3 test only checks regexes for the Quick Ball root and generic owner-prompt branch.

Please add (or include and extend) behavioral tests for the candidate worker's actual Quick Ball path:
- hand-cost prompt: actor-owned `sourceZone:'hand'`, `sourcePrinting:'Quick Ball FST'`/SSH, `effectName:'Quick Ball'`, min=max=1; response is one offered actor-hand token;
- deck-search prompt: actor-owned `sourceZone:'deck'`, same source/effect metadata, min=0/max=1; response is either an allowed empty-selection token or one offered actor-deck Basic token;
- reject/abstain on mismatched actor/source visibility/provenance and verify no opponent/private-zone fields are consulted;
- preserve native host validation/dispatch as authoritative.

Add `tests/2026-11/agent46-candidate-policy.test.cjs` to `V3_FIXTURE_TEST_PATHS` if those cases live there. The existing prompt-projection and provenance suites then cover the host side, while the candidate-policy tests cover worker selection. No new harness is needed.
