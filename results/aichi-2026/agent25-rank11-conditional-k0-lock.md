# Agent 25: K0-conditional source rank11 Tool-Garbodor line

**18 October 2026 UTC.** Evidence class: one authentic shuffled source-deal Store-action policy regression, pure eligibility tests, and exact initial-zone opportunity counting. This **does not** establish a skilled full-match opponent or any competitive win probability.

## Motivating defect and verified baseline

Agent 6 showed that the pinned generic SimpleTacticsAi prematurely equipped Float Stone on both Pokémon V on rank11's actual first turn, leaving its subsequent Forest Seal Stone searches unusable. In that published rank11 vs rank1 game (seed **1244180408**, rank11 physical seat0, actually first), Agent 6 [forced eleven actual printed actions](rank11-firstturn-boostshake-source-fork.md) into a first-turn equipped Garbodor and then observed a [real opponent Shadow Rider VMAX Underworld Door lock](rank11-live-underworld-lock-exposure.md). The latter is one source line with generic continuations.

## Conditional rule, without a staged board

I added an optional research-side wrapper `withRank11AdaptiveBoostShake` in [rank11-adaptive-boostshake-policy.cjs](../../simulation/twinleaf/rank11-adaptive-boostshake-policy.cjs), with a separate pure [K0 eligibility rule](../../simulation/twinleaf/rank11-boostshake-opening-eligibility.cjs). It intercepts one identified seat's normal source game only after that seat's own turn has started. The v1 eligibility test requires:

- source rank11 actually first, Oranguru V Active and Tool-free, VSTAR Power unspent, and one open Bench slot;
- **Battle VIP Pass and Float Stone in its own hand**, checked before touching hidden deck or Prize information.

After the player elects this visible-condition branch, every resource must actually be obtained using printed Store actions and own-deck search prompts: VIP finds Trubbish, Oranguru V's Back Order gets Forest Seal Stone, Tool-granted Star Alchemy spends the once-per-game VSTAR search on Boost Shake, held Float Stone equips Trubbish, and Boost Shake evolves to Garbodor and ends the turn. A missing search target cancels the scripted plan and returns control to the ordinary bot. Unrelated intermediate Store prompts are delegated to the original prompt policy.

This is a contingent **rule-based** policy. It still precommits an aggressive opening instead of weighing the competing Quick Ball, Secret Box, Shopping Center and Tool-slot choices; human-quality deliberation and subsequent opponent counterplay remain unqualified.

The [eligibility regressions](../../tests/rank11-boostshake-opening-eligibility.test.cjs) cover missing VIP/Float, wrong Active, filled Bench, occupied Tool, spent power, wrong turn and wrong player, plus property getters that throw if the K0 test accesses hidden deck or Prize zones.

## Actual source-game execution

[Source-dealt runner](../../simulation/twinleaf/rank11-adaptive-boostshake-source-run.cjs) uses both unaltered published 60-card lists, original seed `1244180408`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, actual printed search prompts, strict prompt validation, Forest Seal Stone one-card correction, Battle Compressor positive selection correction and separate game/policy randomness. It verifies first player, both deck hashes, eleven selected action/prompt steps, and own-hand activation witness against an unmodified generic control.

- An initial compiled attempt [39088056067](https://github.com/FlareZ123/experiment-01/actions/runs/39088056067) failed because the new wrapper incorrectly aborted on an unrelated intermediate Store prompt; all three pure hidden-information tests passed. This was a policy wrapper orchestration failure, not evidence that the printed line is illegal.
- After delegating incidental prompts as the existing forced source runner does, the [**compiled manual workflow 39088270616 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/39088270616), head `4c49671235ca8cf7b9653b113c38ca27c6f3db7d`, and archived source-game witness [artifact 12121806711](https://github.com/FlareZ123/experiment-01/actions/runs/39088270616/artifacts/12121806711), SHA256 `ab72fe5e2a1ca0889761bb5c1dc532c6f31d3cfb8300f376277b940cfbbbae3e`.
- A subsequent [**manual workflow 39088628615 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/39088628615), including exact probability script [artifact 12122190622](https://github.com/FlareZ123/experiment-01/actions/runs/39088628615/artifacts/12122190622). That run did not yet include the separately added non-trigger source replay control.
- The further [**compiled CI 39088817219 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/39088817219), archived conditional-source [artifact 12122007013](https://github.com/FlareZ123/experiment-01/actions/runs/39088817219/artifacts/12122007013), SHA256 `8bfb9a3f86817726114fad1066efbd7bdc9354888b8621e78b4e2a8aae6ab7f5`. The runner now confirms a genuine terminal result and live rank1 reply after the conditional source opening. It also repeats the exact source v1 paired test on preregistered seed `1244180409`: the new policy does **not** activate, and the full captured action decision trace and terminal/prize/deck summaries are **identical** to the unmodified bot. This verifies a negative no-intervention control for one independent source deal, with no claim about wider openings.

## Exact restricted resource envelope

For the published rank11 60, the relevant printed physical copies are Oranguru V ×2, Battle VIP Pass ×4, Float Stone ×3, and Trubbish, Garbodor, Forest Seal Stone and Boost Shake ×2 each. There are **9 Basic** physical cards including Mega Absol ex, Oranguru V and supporting Basics.

The [exact finite-population counter](../../scripts/rank11-adaptive-opening-envelope.py) uses the ordered zone capacities 7 initial hand, 6 unknown Prizes, 1 first-turn draw and 46 cards remaining in deck. It counts a route only when Oranguru appears among the original seven, VIP and Float are visible in the eight cards seen by rank11's first turn, and **at least one copy of all four search targets remains in deck after Prize placement**.

- Probability of a Basic-valid opening seven: **70.0225205701%**.
- K0 Oranguru + held VIP + held Float resource gate conditional on a Basic-valid seven: **3.76223217497%**.
- Full four-target searchable resource event conditional on a Basic-valid seven: **3.24213586511%**.

These are **combinatorial opportunity subsets**, never measured actual attempts. They assume rank11 goes first and chooses Oranguru V Active whenever an eligible opening offers it. The deterministic turn ending, no opponent interference and favorable legal decisions are assumptions, not real-game success rates. Other routes, including an alternate first-turn Float Stone searched by Back Order, are excluded; Agent 7 reports a broader disjoint **22.179405652822%** restricted union under different conditions [here](rank11-oranguru-firstturn-tool-lock-exact.md). Do not compare those percentages as estimates of pilot strength.

## Qualification gap and next priorities

The engine's later turns still rely on known weak generic bots. First-hand selection, line commitment versus alternative Supporter or Tool resources, and post-lock Field Blower/Shopping Center response remain to be policy-qualified. A source-scripted successful lock is **not** an adversarial game-win estimate and does not qualify any Aichi rank11 matchup. Test genuine K0 conditional abstention without disturbing other source games; then consider conditional use of both Back Order Tool slots, additional source deals, both physical placements and informed rank1 responses.

**Unchanged field:** 29 exact rank-resolved opponent lists; 23, 25 and 28 unknown; 0 independently qualified competitive game results; 99.5% unproven.
