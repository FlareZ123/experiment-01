# Rank-15 native BUS Vileplume Active-position failure: insufficient Bunnelby retreat payment

**Agent 36, 20 October 2026.** This is a **single, retrospectively selected, mechanically bounded native replay**, not a competitive matchup, a legal whole-turn policy, or an estimate of game strength. The failed proposal is preserved as a negative observation.

## Why this test was run

[Agent 30's independently checked two-Evolution replay](agent30-rank15-native-omega-barrage-confirmation-yes.md) showed genuine `Vileplume BUS` and `Vileplume AOR` in play on the source's global turn 16, yet BUS was never Active before the 260-root censor. The stronger locking configuration requires both AOR in play and BUS Active. Testing the earliest subsequent owner-visible promotion is a direct probe of this missing sequencing component.

## Exact reproducible conditions

- Genuine published Aichi rank-15 Ryotaro Nozawa Lopunny/Vileplume source **60 unchanged** against unchanged New Moon Lockbreaker printed-mechanics candidate 60; source physical seat B, candidate A and actual candidate-first opening.
- Original retrospectively selected seed **3050400820**; physical pre-policy zone hashes, starting Prize assessments and deck hashes asserted equal across both arms.
- Pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**; up to 260 root actions per arm; source and candidate generic bots unqualified.
- The source-only setup layer in both arms performs the already-established native Poffin to two Oddish, first Tool Evolution to two Gloom, and actor-confirmed second Ω Barrage attack, yielding BUS+AOR on turn 16. The intervention adds a **single** native owner-visible `RetreatAction` proposal to BUS on the earliest source turn with Bunnelby Active and both Vileplume in play. No hidden deck, Prize or opponent-hand contents are used in the proposal.
- Implementation: [selector](../../simulation/twinleaf/rank15-bus-native-retreat-policy.cjs), [two-arm original deal runner](../../simulation/twinleaf/rank15-bus-native-retreat-fork.cjs), [three tests](../../tests/rank15-bus-native-retreat-policy.test.cjs). Registered under the pre-existing manual-only [Aichi New Moon source workflow](../../.github/workflows/aichi-newmoon-source-coverage.yml).

## Compiled native result: genuine proposal rejected

The [20 October **successful CI 39460588948**](https://github.com/FlareZ123/experiment-01/actions/runs/39460588948), head `35c106b6e56cb1fe2fcaed3d1ac18383c378a304`, passed all three newly authored owner-only selector tests, all preceding original rank-15 regressions, and the two-arm native replay. It uploaded [artifact **12281939223**](https://github.com/FlareZ123/experiment-01/actions/runs/39460588948/artifacts/12281939223), runner-recorded ZIP SHA-256 `868cdd4a48301ddce09da709dbfabc36b0879b94f83ca01001e6ba92426df6fa`. The job log's complete compact experiment summary provides the findings below; the ZIP hash is a CI upload log digest, **not** a separately locally recomputed audit.

At the first authentic prospective source proposal, **global turn 18**, the source's root native acting-player position was:

| Owner-visible field | Actual value |
| --- | --- |
| Active | `Bunnelby PRC` |
| Active attached Energy | exactly one `Grass Energy MEE` |
| Current retreat already used | no, `retreatedTurn:0` |
| Benched index 2 | `Vileplume BUS` |
| Benched index 3 | `Vileplume AOR` |
| Remaining Bench positions | `Budew ASC`, `Eldegoss V RCL`, `Budew ASC` (three further engine slots empty) |
| Proposed action | `RetreatAction(sourceActorId,2)` |
| Native `SimpleTacticsAi.isValidAction` outcome | **false** |

No `RetreatAction` was accepted in the real root Store ledger, no BUS Active or combined BUS+AOR position was recorded before cap, and no root response to a retreat occurred. The old and proposed arms both ended at their bounded censor. The runner never converted the failed validator proposal into a native action.

**Printed-card explanation, independently checkable:** The supplied card database, `cards/en/xy5.json`, contains `Bunnelby` with identifier `xy5-121` / PRC 121, `retreatCost: ['Colorless','Colorless']` and `convertedRetreatCost:2`. The actual on-board Bunnelby had **only one Grass Energy card**, providing one Energy absent other modifiers. This is consistent with the Advanced Player's Rulebook's requirement that retreat costs be paid by discarding sufficient attached Energy. The printed insufficient payment is a direct supported explanation for the rejected retreat, although the current artifact does not separately log the simulator's thrown `GameError` or calculate effective retreat modifiers. The observation should not be mislabelled a Vileplume ability-lock success or a native engine bug.

## Open bounded follow-up

The source list has **two Jet Energy PAL** and **two Guzma BUS**. Either may enable an Active promotion under the proper owner-hand, Stadium, Supporter and legal prompt conditions; access is not guaranteed. Capture the **actual source owner's held hand, Energy attachment use, Supporter use and public Stadium** at the turn-18 owner decision, then test a genuinely legal line if available. This read-only owner-inventory extension has been implemented in the same source policy after the first compiled result; its separate compiled outcome must be checked before making any claim about source resources. A failed retreat must remain in the control.

This specific retrospective deal has **zero competitively qualified games**. Neither arm establishes game-win or 99.5% claims; the canonical cross-archetype common-policy and paper-clock gates remain unresolved.
