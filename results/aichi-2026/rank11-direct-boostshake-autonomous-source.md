# Rank-11 direct Boost Shake: autonomous, authentic source-dealt Store line

**Agent 1, 18 October 2026.** Evidence class: pinned simulator mechanical capability under genuine source dealing and real selected actions. It does not establish optimal policy, a competent game, a win rate, or the 99.5% goal.

## Question and policy

The original `rank11-autonomous-boostshake-v1` exclusively follows Oranguru V / Battle VIP Pass / Back Order / Forest Seal Stone / Star Alchemy to locate Boost Shake, and explicitly excludes hands with held Boost Shake. Independent exact source-60 combinatorics in [the opening census](rank11-boostshake-opening-census.md) show material held-Shake opportunities, including the Tool-complete hand-access subset.

A new **separate opt-in** `withRank11DirectBoostShake` in [rank11-direct-boostshake.cjs](../../simulation/twinleaf/rank11-direct-boostshake.cjs) leaves v1 and every existing shared profile unchanged. [The pure predicate](../../simulation/twinleaf/rank11-direct-opportunity.cjs) inspects only the acting player's hand, turn/phase and public Bench. It recognizes a held Boost Shake, a held Tool chosen from Muscle Band, Float Stone or Forest Seal Stone, and Trubbish already untooled on Bench, held in hand with Bench space, or searchable through held Battle VIP Pass with Bench space.

For the VIP branch, the autonomous Bot selects exactly six ordinary Store actions:

1. Play held Battle VIP Pass.
2. Select a Trubbish through its actual owner-facing deck-search prompt.
3. Attach held Tool to the Benched Trubbish.
4. Play held Boost Shake.
5. Select Garbodor through the real owner-facing deck-search prompt.
6. Select equipped Trubbish for evolution, then observe Tool-equipped Garbodor at the next opponent decision.

The decision policy does not inspect hidden Prizes, unsearched deck contents or opponent hidden cards. When a search target is absent, the path aborts to the original policy; all abnormal prompt handling delegates to the pinned Bot. The separate implementation also provides held-Basic and already-Benched Trubbish plans, neither source-exercised in the first experiment.

## Compiled first experiment

**[Manual GitHub Actions run 39113437813](https://github.com/FlareZ123/experiment-01/actions/runs/39113437813)**, head `d331f9097895c7695162297720042b8a9022b287`, completed successfully. Submodule: `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Node 20.19; pinned `npm ci` and `npm run compile` passed. All five owner-visibility and route-selection unit tests passed.

Runner: [rank11-direct-source-probe.cjs](../../simulation/twinleaf/rank11-direct-source-probe.cjs); source rank11 Wataru Yano Absol Garbodor 60 in engine seat A, rank1 published Shadow Rider reference 60 in B; both resolved through `planAichi(1)`. Pinned source seeds 2026101800 through 2026101831, actual starting slots recorded, 48 root actions per attempt, all 32 trials retained. No injected hand, board, prompt, Pokémon or Prize arrangements. Corrections enabled: strict prompt validation, existing Forest Seal search and Battle Compressor selection corrections, isolated policy randomness.

The bounded CI log and [raw artifact 12131198105](https://github.com/FlareZ123/experiment-01/actions/runs/39113437813/artifacts/12131198105) show:

| Field | Source-dealt outcome |
| --- | --- |
| Trials retained | 32 |
| Owner-visible direct opportunities | 4 |
| Completed six-action chains | 4 |
| Aborted chains | 0 |
| Genuine rank11 first-turn opportunities among detected | 0 |
| Genuine rank11 second-turn opportunities among detected | 4 |
| Successful seeds | 2026101804, 2026101806, 2026101817, 2026101820 |
| Selected tools in order | Float Stone, Forest Seal Stone, Muscle Band, Float Stone |
| Next opponent decision | All four on global turn 3, Tool-equipped Garbodor still in play |
| Terminal game evidence | None; all four relevant 48-action bounded games were unfinished |

This is a **specific tested extension from the source-first v1 capability to a real second-start held-Shake route**. The observed 4/32 is a limited convenience-seed diagnostic sample, not a reliable opportunity probability, matchup estimate or evidence of a win. It cannot certify Item availability under early opponent Item lock, full rules correctness, subsequent counterplay or attack competence. The simple Bot's broader decision quality remains unqualified.

The first CI attempt [39113403935](https://github.com/FlareZ123/experiment-01/actions/runs/39113403935) failed *before testing* due setup-node npm cache preceding submodule checkout. The workflow now initializes the pinned submodule before cache setup. This environment repair is separate from game evidence.

## Next requirements

Collect prospective held-out source-first and source-second trials, including all no-opportunity denominators; validate the held-Basic / already-Benched branches; combine direct and original VSTAR routes under a versioned rank11 policy only after live Store validation. Most importantly, observe a frozen opposing candidate's legal, nontrivial lock response and consequential attack sequence with both actual starting orders. Delegated attacks require declaration-complete telemetry, and official paper timing is still unmodeled.

The complete Aichi opponent field remains **29/32** exact printed 60s, with ranks 23/25/28 unavailable. Competitively qualified games: **zero**.
