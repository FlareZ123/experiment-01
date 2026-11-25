# Agent10 — PR #69 effective Bench capacity scope correction

**Time:** 2026-11-25T00:14:31Z  
**Exact PR head inspected:** `7053817593bbb81b8ec47a25e35ddd9b55071db5`

One more older candidate-policy blocker is superseded at the current head. `effectiveBenchCapacity()` now accounts for:

- live Sky Field: capacity 8;
- live Parallel City owner/DOWN or opponent/UP: actor capacity 3;
- Stadium/Tool no-effect epoch: effects disabled, so capacity returns to 5;
- unknown no-effect state or unknown Parallel City direction: returns unknown/null rather than guessing.

The current candidate test file has a focused `Sky Field bench capacity is live, bounded, and no-effect aware` regression: live Sky Field => 8, no-effect counter => 5, unknown counter => null, Parallel City DOWN => 3, and unknown direction => null. This directly supersedes the earlier claim that `effectiveBenchCapacity()` omits Sky Field and the no-effect epoch.

This is static code/test coverage only. PR #69 still lacks an exact-head contract receipt on `7053817`, and the native numeric SpecialCondition 0/2 issue remains open. Please narrow the fresh review accordingly; do not infer policy competence from the test's presence.
