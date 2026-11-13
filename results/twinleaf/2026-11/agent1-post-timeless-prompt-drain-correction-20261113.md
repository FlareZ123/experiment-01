# Agent1: Post-Timeless prompt-drain failure correction

**Date:** 13 November 2026  
**Scope:** Correct the staged native Store test harness after workflow run [43401024755](https://github.com/FlareZ123/experiment-01/actions/runs/43401024755). This is not competitive-game evidence.

## Observed failure

The run compiled the pinned Twinleaf engine and passed steps 7–15, including the native 280-HP Fairy Zone Copycat KO / Prize characterization. Step 16, the matched post-Timeless Max Geist versus second-Copycat Power Beam comparison, failed with:

`AssertionError: Native prompt chain exceeded 1 resolutions`

The failed run's exact head commit was `84c7927963b2c398e3ea57ea33cc4b8641a24f89` (event `push`; the temporary push trigger has since been removed). I fetched the runner source at that exact commit, blob `9dad686c87a7d92fbef08ca7b189b39f06d40ec9`, and confirmed both explicit one-prompt caps were present at lines 161 and 202. The failed-job stack points to `resolvePending` line 52 called from `runSeat` line 161. That call was:

```js
const more=resolvePending(x,{opponentDialga,ownerDialga},1);
```

This is the first Copycat → Timeless-GX KO chain, not the later Power Beam branch. After the attack, the native Store can expose multiple sequential Wait / Prize / Promotion prompts. The helper's one-resolution cap caused it to throw before the outer loop could resume and inspect the remaining prompts.

## Correction

Two unnecessary explicit one-prompt caps were removed:

- [78f4c3e](https://github.com/FlareZ123/experiment-01/commit/78f4c3ef4b4c3726e2333e92ce9fd327885fcfa0) removed the separate explicit cap from the later Power Beam branch. The failed run did not reach that branch; this is a defensive cleanup, not a separately observed failure.
- [0acff0e](https://github.com/FlareZ123/experiment-01/commit/0acff0e319af6c9713db22ed50b0833fb2f5f77c) removed the actual failing cap from the initial Timeless-GX prompt drain.

All call sites now use the helper's existing bounded default of `limit=40`. The current source blob is `83475c41e50a7e86ed769a2c2444fda16e7a0af8`. A source scan confirmed no remaining `resolvePending(...,1)` call sites.

## Validation status and limits

- The current main branch contains both code corrections.
- The failed run's preceding native steps 7–15 remain useful passed evidence.
- **The workflow has not been rerun on the corrected source.** It is manual-only, and this environment has no workflow-dispatch action. Do not describe the correction as a passing test.
- The failure was a prompt-draining assertion, not an observed damage or Prize assertion failure.
- Even after a successful rerun, the four-row staged Store comparison (both physical seats × Max Geist / second Copycat Power Beam) remains a mechanics diagnostic. It is not a natural game, candidate-policy selection result, Aichi matchup, paper-qualified game, or win-rate estimate.

## Next action

An authorized owner can dispatch the existing workflow on current main with its optional inputs left at their defaults:

```sh
gh workflow run mimikyu-copycat-regression.yml --repo FlareZ123/experiment-01 --ref main
```

Then retrieve the successful `copycat` job logs and preserve the step-16 JSON stdout; this unconditional step has no dedicated artifact-upload step. Inspect all four matched rows. Only after that run passes should the comparison report be updated with measured damage / Prize outcomes.
