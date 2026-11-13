# Agent20 review: Hooded Snorlax Block owner-root policy

**Review checkpoint:** 13 November 2026, 04:58 UTC  
**Scope:** static review of draft PR #45 against the actual candidate board, card text, actor-observation contract, and existing native mechanics evidence. No deck changes or new games were made.

## Decision

The architecture in [PR #45](https://github.com/FlareZ123/experiment-01/pull/45) is the correct V3 direction: a default-off root intent driven by detached owner-visible observation, not a full-State `SimpleTacticsAi` tactic. The separate Agent20 [PR #43](https://github.com/FlareZ123/experiment-01/pull/43) has been explicitly marked standalone-only and not V3-compatible because it exposes full native `State` to the tactic/scorer and is bypassed by the V3 Agent34 actor-only root.

PR #45 is not ready to enable. Its current public guards veto the actual rank-7 counterline board for two irrelevant bench effects, and its attack-payability helper omits public cost restrictions. PR #45's own root test is stubbed; the separate native mechanics sequence has since been added in PR #41, but no test yet connects PR #45's real Agent34 chooser to that sequence.

## Exact public rank-7 board and counterline

The rank-7 Hood slot-A loss in the existing Agent46 58-game audit records this final public board:

- Candidate Active: Shadow Rider Calyrex VMAX, 2 Basic Psychic Energy, no Tool.
- Candidate Bench: Lillie's Clefairy ex with 7 Psychic Energy, plus Radiant Eternatus, Latias ex, a second Lillie's Clefairy ex, and Marshadow.
- Opponent Active: Snorlax PGO, 10 damage, no Tool.
- Opponent Bench: Electrike, two Wobbuffet, Mimikyu PAL, and Girafarig.
- Five Benched Pokémon on each side; no Stadium in play; no Tool Jammer on the opponent's Active.

The card-text arithmetic is direct:

- Snorlax PGO has 150 HP and 10 damage, so 140 HP remain.
- Full Moon Rondo costs Psychic + Colorless and does 20 more damage for each Benched Pokémon on both sides. Five benches each give (20 + 20(10) = 220).
- The Clefairy has seven Psychic Energy and remains fully funded after the Active VMAX pays its two-Colorless Retreat Cost with its two Psychic Energy.
- Agent3's separate pinned-Store regression establishes that Stealthy Hood on the current Active Shadow Rider VMAX permits the same two-Psychic RetreatAction against Snorlax PGO Block. Its seven-scenario/two-seat matrix passed 14/14 in run [43344192788](https://github.com/FlareZ123/experiment-01/actions/runs/43344192788).

This is a **public board-state counterline**, not proof that Hood was in hand, that no alternative mobility card was held, or that the complete sequence would win the game. The existing Agent46 report also states that exact hand access is not established.

## Concrete false vetoes in PR #45

### 1. Latias ex / Skyliner on the candidate Bench

PR #45's `hasUnexpectedRetreatAbility(view)` rejects any Ability text containing “retreat” anywhere on either board. The candidate's Bench includes Latias ex SSP, whose Skyliner gives the controller's Basic Pokémon no Retreat Cost.

The affected Active is Shadow Rider Calyrex VMAX, an evolved Pokémon. Skyliner does not modify its printed two-Energy Retreat Cost. Rejecting the line because Latias is on the Bench is a false negative. Agent42's existing `retreatAbilityGuard` has a stage-aware Skyliner branch that ignores it when the affected Active is not Basic; reuse/adapt that logic while retaining fail-closed behavior for genuinely relevant unknown effects.

### 2. Mimikyu PAL / Safeguard on the opponent Bench

PR #45 reuses `opponentHasUnmodeledDamageOrPrizeText(view)`, which rejects the board when any opposing Ability text contains “damage” or “prize.” The rank-7 opponent Bench includes Mimikyu PAL. Safeguard protects Mimikyu itself from attacks by Pokémon ex/V; it does not protect the Active Snorlax from Full Moon Rondo.

This is another target-scope false negative. Inspect the target Active's protection and known global modifiers, not every self-only defensive Ability on the opponent Bench. Unknown global effects should still fail closed.

These two findings were sent directly to Agent43; the Mimikyu guard finding was also sent to Agent42.

## Additional correctness requirements

1. **Public attack-cost restrictions:** `actor-observation-contract.cjs` exposes Pokémon-level `attackCostIncreaseNextTurn` and `attackCostIncreaseWhileActive`, plus player-level `attackMaxEnergy` and `attackMaxEnergyTurnsRemaining`. Agent17's `effectiveNativeAttackCost` / `publicSpecialAttackPayable` and Agent42's `attackBlocked` do not account for them. A Bench attacker may therefore be called payable when its post-promotion attack is publicly restricted. Fail closed on unmodeled nonzero modifiers or model them explicitly, including the post-retreat Active status.
2. **Damage-projection scope:** Agent42's `postRetreatPrintedDamage` can fall back to integer `attack.damage` for an attack with no `damageCalculation`; that is not a general proof that attack text has no damage-changing conditions. Whitelist modeled attacks/formulas or validate plain fixed damage.
3. **Post-attachment observation:** PR #45 rejects a live observation if `active.publicRestrictions.cannotRetreatWhileActive===true`. The synthetic test does not prove what the real actor observation reports after Hood attaches while Block remains listed. The native sequence must capture a fresh actor observation after attachment and prove the policy progresses to RetreatAction rather than abstaining.
4. **Native sequence:** Agent3's 14/14 regression validates direct RetreatAction mechanics only. PR #45's root mapping test uses fake Store/actions. Use the existing Agent31 manual workflow to test both seats through native Hood attachment, RetreatAction, actual two-Psychic discard, promotion, attack settlement, and Prize change. Include Tool Jammer/Jamming Tower negative controls without duplicating Agent3's full matrix.
5. **Tool Jammer / Arven:** The current no-Tool-Jammer scope is an acceptable first increment. Both known Snorlax lists contain Tool Jammer; do not claim coverage when it is on the opponent Active. Field Blower removal and Arven's paired Item/Tool search need their own owner-prompt and native sequence evidence.
7. **Repository layout:** README.md forbids new files directly under `simulation/twinleaf/` and `tests/`; use monthly/agent/topic namespaces. PR #45's new helper/test paths should be moved accordingly. Do not add a new workflow; reuse existing manual workflows.

## Evidence boundary and next actions

- Keep the PR #45 option default-off and candidate-role-only; Agent36 owns frozen V3 role identity/options/receipt integration. Do not contaminate the shared fixture.
- Fix the two rank-7 false vetoes and public cost-modifier gap; add focused regressions.
- Integrate PR #45's actual Agent34 root chooser with the existing PR #41 native staged sequence; do not recreate the already-passing mechanics fixture.
- Preserve the Agent3 14/14 Store report as mechanics evidence only.
- Do not change the fixed 60 or update `results/README.md` for this review. No deck is selected, no competitive game is qualified, and no 99.5% claim follows.

References:
- [Agent46 full 58-game Hood audit](agent46-hood-full58-attack-conversion-audit-20261112.md)
- [Agent3 Active Hood vs Snorlax Block native regression](https://github.com/FlareZ123/experiment-01/blob/agent3/hooded-bench-door-source-20261112/results/aichi-2026/2026-11/agent3-hood-snorlax-paid-retreat-native-20261113.md)
- [PR #45 actor-only root proposal](https://github.com/FlareZ123/experiment-01/pull/45)
- [PR #43 standalone tactic boundary](https://github.com/FlareZ123/experiment-01/pull/43)
- [Agent20 → Agent43 detailed PR review](../../../communications/agent43/20261113T043200Z_agent20-pr45-review.md)
- [Agent20 → Agent43 rank-7 public-board false vetoes](../../../communications/agent43/20261113T045100Z_agent20-rank7-public-board-false-vetoes.md)
- [Agent20 → Agent43 Alolan Muk Block-suppression review](../../../communications/agent43/20261113T050700Z_agent20-pr45-alolan-muk-suppressor.md)
- [Agent20 → Agent43 PR #41 native sequence update](../../../communications/agent43/20261113T051400Z_agent20-pr41-native-sequence-update.md)
