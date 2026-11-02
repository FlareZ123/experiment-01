# Agent 37: rank-5 v3 native disposition classification is now evidence-preserving

**2 November 2026.** This repairs future machine-readable release summaries, without changing the actual Pokémon TCG simulator, either player's decision policy, the pinned v3/v3.1 experiment, candidate 60s, or any archived result.

## Failure mode

The original rank-5 source release wrapper in `simulation/evaluation/agent13-v3-rank5-original-release.cjs` used `status:row.status??'UNVERIFIED'` even when a completed native engine row supplied its real outcome only as `finished`, `endReason`, and `actionCount`. Agent 13 independently documented the same issue in [the immutable native v3.1 report](agent13-rank5-v31-corrected-root-native-16arm-20261102.md). A condensed `UNVERIFIED` label therefore did not mean that native Store execution had failed. It also did not certify a paper game win.

## Repair and evidence boundary

The shared main-branch wrapper now classifies raw `finished:true,endReason:'engine-game-end'` as `ENGINE_TERMINAL_UNQUALIFIED`, raw `finished:false,endReason:'action-limit'` as `CENSORED`, and rows with a native error as `NATIVE_ERROR`. Unknown native end reasons remain `UNVERIFIED` unless an explicit legacy `status` was actually provided. The output also retains the three primitive raw fields directly for audit. Existing legacy explicit status fixture behavior is preserved. The independent [regression test](../../tests/agent13-v3-rank5-release.test.cjs) covers all four dispositions, raw action count retention and permanent `competitiveGameQualified:false`.

**Compiled manual benchmark:** [CI 41403613354](https://github.com/FlareZ123/experiment-01/actions/runs/41403613354), head `479dca2fc1bb348bad9e087d47c711248778b9c2`, **success**. The existing manual-only benchmark workflow runs the new regression by name without invoking the historical unqualified full-game seeds or altering a frozen manifest. Implementation commit `ee4f182`, regression commit `2c36f97`, workflow commit `479dca2`.

The **previously archived v3.1 16 native rows and immutable source/profile SHA remain unchanged**. Their disposition was already independently reconciled in Agent 13's source report: frozen control 2 engine terminals / 6 action caps, integrated treatment 4 engine terminals / 4 action caps, zero native errors. This repair prevents a future wrapper derived from the original source witness from silently losing those distinctions; it does **not** retroactively change an immutable archive or claim that the v3.1 branch includes this main-branch repair.

## Competitive interpretation

This is an evidence-reporting correctness fix, not a source-policy or deck-strength improvement. Source field remains **29/32 authenticated printed opponent 60s**, with ranks 23, 25, 28 missing. **0 competitively qualified games, no defensible 99.5% field win rate and no selected best fixed 60.** The next high-leverage step is still a coherent selected two-seat source policy with native decisions, actual prompt/payment/damage/reply witnesses and original opponent game competence.
