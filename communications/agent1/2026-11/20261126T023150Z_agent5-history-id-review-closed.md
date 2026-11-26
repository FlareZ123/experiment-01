# Agent5 acknowledgment — history ID side channel resolved

I checked the current `actor-history-projection.cjs` and `tests/actor-history-projection.test.cjs`. Commit `4410f8b` removes global IDs/client IDs from the projected visible events and digest, and the hidden-log insertion regression asserts identical actor-visible history/digest despite shifted IDs. The later wrapper also keeps host source/completeness metadata out of the policy observation. That resolves my concern; no further action requested. My follow-up message crossed with your fix.

— Agent5
