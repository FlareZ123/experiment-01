# Rank11 source-dealt K0 predecision screen and replay-equivalence gate

**Agent 2, 18 October 2026.** Evidence class: one **authentic-source, pinned-Twinleaf first-turn mechanical regression** plus 60 lightweight regression tests. This result is not an observed competitive win, an autonomous response qualification, or a statistical estimate of Garbotoxin frequency.

## Why this exists

The source rank11 `rank11-autonomous-boostshake-v1` opening requires a rare hand/Active-state predicate. [The frozen 64-arm prospective exposure study](../aichi-2026/rank11-prospective-exposure.md) observed no v1 opportunity in its first 16 arms. Its two candidate versions reuse seed/seat pairs, reducing effective independent exposure opportunities.

[Binomial design sensitivity and a two-frame proposal](../statistics/rank11-rare-v1-exposure-budget.md) suggest screening authentic first-turn Store states cheaply, before choosing which selected positions merit a much longer mechanical counterplay continuation. All attempted source seeds and selection failures must be retained. Conditional continuation winners must never be pooled into unconditional matchup win rates.

## Reversible source-State screen

[`simulation/twinleaf/rank11-first-turn-screen.cjs`](../../simulation/twinleaf/rank11-first-turn-screen.cjs) installs a temporary wrapper around the pinned `SimpleTacticsAi.prototype.decodeNextAction`. It captures the genuine `state.turn===1` and `GamePhase.PLAYER_TURN` decision boundary, provided no unresolved setup prompt remains.

- For a source-rank11 actual first player, it invokes the published `openingOpportunity` guard on the source's own hand and public board only. Records source starter, ordered source hand printings, opponent hand **size**, actual first player and K0 eligibility.
- For a candidate-first state, the guard does not inspect rank11's hidden hand; the source-hand capture is `null`. It records absence of v1 source-first opportunity instead of pretending the source had been independently screened.
- A unique private abort sentinel stops the game before the first ordinary bot decision. `finally` restores the previous prototype whether the screen succeeds or encounters a real engine exception.
- The captured Store is intentionally disposed of: **screening does not itself continue the game**. Every selected continuation must re-deal the frozen seed and independently verify its opening and real game-state equivalence.

The direct screen's firstness is a genuine Store turn-state observation, but first-draw-log confirmation is established in its [source adapter](../../simulation/twinleaf/rank11-first-turn-source-screen.cjs) through a separately replayed game, **not** claimed for every unseen future seed.

Four [pure mock regressions](../../tests/rank11-first-turn-screen.test.cjs) check source-first identity and printing capture, candidate-first hidden-hand exclusion, exception cleanup, and fail-closed no-decision.

## Genuine source test and CI

The [authentic source adapter](../../simulation/twinleaf/rank11-first-turn-source-screen.cjs) uses published rank11 Wataru Yano Absol/Garbodor **seat A** against published rank1 Shadow Rider **seat B**, full 60 printings via `planAichi(1)`, archived seed **1244180408**, and Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. It matches the previously [verified autonomous-rank11 positive-control seed](../aichi-2026/rank11-autonomous-opponent-policy.md).

It asserts a source-first opening with Active Oranguru V and eligible v1 K0 guard, restores the bot prototype, runs a second original `runMatch` with the **same complete decks and seed**, requires source-first player **0** and `verifiedByDrawLog===true`, and compares both exact ordered source-hand **physical printing identities** and public opponent-hand size with the first source-own-hand decision trace. No input shuffle, staged hand or manually selected prompt is used.

- [First manual CI 39096851804](https://github.com/FlareZ123/experiment-01/actions/runs/39096851804) compiled successfully and passed **60/60** tests plus the genuine predecision Store screen. The overall job subsequently failed because the new opt-in workflow route accidentally executed its unrelated campaign-envelope step without a campaign report. This was an orchestration condition, **not a screen or rules failure**.
- [Corrected manual CI 39097008121](https://github.com/FlareZ123/experiment-01/actions/runs/39097008121), head `fa677fb2c295becbd9a4317f1a1938509e6bda7c`, is **fully successful**. The workflow supports opt-in `rank11_first_screen:true` without running the six-game default campaign. Archived artifact [12125162045](https://github.com/FlareZ123/experiment-01/actions/runs/39097008121/artifacts/12125162045) contains the machine-readable source-screen report. This is an independently rerun compiled proof of the source-replay invariants above.

## Boundaries and next use

One known source-positive opener does not demonstrate representative frequency, competence of other opponent decisions, paper-rule equivalence across effects, hidden-zone policy safety in speculative cloning, candidate counterplay, complete Top32 field coverage, or a winning list. The source adapter provides a calibration fixture for a future **prospectively registered conditional seed screener**. Such a screener should record every attempted source deck seed, true first-player evidence, K0 qualification, completed K1 search, autonomous Garbodor witness, and candidate's legal response as separate denominators.

**Aichi field remains 29/32 sourced full 60s**, with ranks 23/25/28 unresolved, and **zero independently qualified competitive games**. No 99.5% performance claim follows.
