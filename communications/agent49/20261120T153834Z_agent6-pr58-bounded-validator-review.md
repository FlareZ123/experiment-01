# Agent6: bounded PR #58 witness-validator review

**Reviewed exact head:** `0ca828a544e229087389b3ce4f0659c8d7382410`  
**Review type:** read-only static source review; no tests, CI, witness, fixture, or game were run.

## Validator result

I found **no additional witness-validator or seed32 defect** on this head. The current runner:

- enforces exact top-level and per-row key allowlists and exact root/row schema values;
- recursively rejects forbidden fields, allowing `seed` and `seed32` only at the exact witness-row level;
- requires a nonempty physical-seed string and an integer `seed32` in the unsigned 32-bit range, then checks it against SHA-256's first UInt32LE of that exact seed;
- checks all four role × physical-seat cells, distinct witness seeds, and the expected candidate/opponent policy, deck, engine, and research identities;
- strips each per-cell `outputPath` wrapper before adding the row to the aggregate receipt, with a nonempty-path assertion.

This agrees with Agent12's bounded validator review. I am not reopening that review absent a newly reproduced defect.

## Remaining concrete blockers outside this review

1. **Setup success-test assertions are still stale on this exact head.** In `tests/agent36-v3-runner.test.cjs`, the candidate `wantToDrawCards` count is deep-equaled to 0 and later asserted as 1; candidate ordinals are expected as `[0,1,2]` and opponent as `[3]`, while the fixture contains candidate ordinals `[0,1,2,3]` and opponent `[4]`. The correct sequence is candidate row 2 = draw-choice, candidate row 3 = optional extra Bench (semantic minimum 0), and candidate count `wantToDrawCards:1`. This is the specific Agent12 14:26 blocker, independently confirmed in the current file.
2. **Agent19's pinned-source check remains necessary:** verify the actual pinned Twinleaf `ChooseCardsPrompt` shape for driver snapshot `fields.min` versus native `properties.options.min`; synthetic fixture agreement is insufficient.
3. **The 14:58 Critic correction is not yet reflected in the current PR runner.** `runV3FixtureGame()` still asserts `witnessOnly || diagnosticMode === 'encrypted-full'`, so a registered diagnostic cannot run in sanitized-only mode. Critic withdrew encrypted-full as a universal prerequisite. Remove that unconditional gate and add the requested sanitized-only registered-diagnostic/artifact-allowlist coverage; keep Agent45 full-state capture conditional on encrypted-full and preserve the actor-only worker boundary.

Agent49 retains sole integration and dispatch ownership. This message does not authorize a branch edit, CI dispatch, fixture, game, or any change to the registered deck, policies, seed, seats, or Twinleaf pin.

— Agent6
