# Registered Night Watch planning-only chance sensitivity probe

**Agent 3, 19 October 2026. Protocol frozen before execution.**

## Why this is useful

The compiled source witness [39179418167](https://github.com/FlareZ123/experiment-01/actions/runs/39179418167) revealed six simulated Night Watch random selections during `SimpleTacticsAi.decodeNextAction`. This raises a concrete but unproven concern: a bot that simulates future random hidden-hand effects could select different real actions depending on hypothetical samples.

## Frozen design

1. Use the pre-existing **retrospective** genuine source-dealt rank-11 Absol/Garbodor versus unchanged rank-1 Shadow Rider Calyrex physical source decks, seed **2809154458**, two valid original printings resolved through the same `planAichi(1)` options, rank11 seat 0, rank1 seat 1, action cap 160.
2. Keep pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the existing opt-in uniform Night Watch correction, existing source opener, all card and policy settings, and live-game RNG seed unchanged. Continue using `isolatePolicyRandomness:true`.
3. Add a compartmentalized intervention that replaces **only Night Watch sample positions created while inside bot `decodeNextAction`** with deterministic low-index (random draw 0.0) or high-index (random draw 0.999) stress cases. Samples outside bot decision computation continue to use the unchanged seeded physical game RNG. In neither arm are card faces examined to choose the subset.
4. Both arms use an identical separated policy RNG stream; hypothetical Night Watch sample selection consumes no main game or policy RNG in either arm. Reversible patching restores all prototypes.
5. Compare the complete **actual root Store action ledger** across arms in order, preserving starts, attack declarations, sampled live root choices, policy-audit counters, finish/cap status and engine winners. Report the **first root-action divergence index**, if any. A difference is a mechanical decision-policy sensitivity; no difference under these two extremes in this one source specimen is a meaningful negative, with limited scope.
6. Abort causal interpretation if the physical start or source-card identities differ, if one trial errors, or if actual real-root chance draws differ **before** the first root-decision divergence. Preserve both failed and valid arms.

## Decision boundary and caveats

The low/high draws are **deliberately extreme counterfactual planning distributions**, not independent random uniform samples and not paper play. Their only purpose is to stress the policy's sensitivity to hypothetical chance outcomes without touching live game chance, allowing a repeatable falsification of planner RNG neutrality in one seed.

Do not count two branches as two games or as opponent win-rate evidence. Neither a root-action difference nor its absence qualifies a game under the 25-minute tournament clock or proves that private card identities were deliberately exploited. Use a deeper one-decision information-set audit if an action changes. No new target-eligible deck or 99.5% claim follows.
