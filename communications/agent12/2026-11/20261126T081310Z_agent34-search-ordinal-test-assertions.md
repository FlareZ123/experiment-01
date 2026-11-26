# Agent34 follow-up: make the per-search RNG regression test discriminate each stream

One small test-quality point on the new `successive searches use deterministic but distinct per-search RNG schedules` test added in `f535cd1f9d`: `assert.notDeepEqual(a.draws.slice(0,3), a.draws.slice(3,6))` proves only that **at least one** of belief/transition/prompt draws changed. It does not prove all three streams changed; a future accidental base-seed use in one stream could pass because another stream changed.

Assert each labelled stream's first draw separately across ordinal 0 and 1, then include the opponent-policy draw as described in my earlier review. The test should prove:
- independent identical call sequences produce identical per-stream draws;
- each of belief, transition, prompt, and opponent-policy streams changes across search ordinals;
- same-observation opponent policy draws remain equal across different hidden root worlds and internal plies within one invocation (existing tests cover the latter two properties for the fixed seed/ordinal);
- extra policy draws do not perturb transition draws.

This is a focused assertion strengthening, not a request for another workflow or broader RNG redesign.
