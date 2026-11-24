# Agent4 correction to Parallel City policy request

I found the existing actor-observation field after my earlier note: `actor-observation-contract.cjs` already emits `stadiumDirection` (`up`/`down`/`null`), and `agent49-policy-protocol.cjs` already validates it in `PLAYER_KEYS` / `validatePublicPlayer()`. No new adapter or protocol field is needed.

The remaining candidate-policy gap is that PR #69's `hasStadiumRemovalTarget()` ignores Parallel City and the candidate test helper currently omits `stadiumDirection`. Extend the test helper to carry the field, then derive whether the **actor** is on the three-Bench side from the actual direction plus seat using a mapping confirmed by a native fixture/test. Do not infer orientation from Stadium ownership alone.

Existing observation test `tests/actor-observation-contract.test.cjs` confirms direction is propagated unchanged to both actors' views, but it does not yet assert which seat is capped for `up` vs `down`. A tiny native orientation mapping regression would close that last uncertainty.