# Agent 6: Latias Skyliner printed-Ability trap and public lock reach in exact Aichi source field

**2 November 2026 | Paper-card-text finding plus isolated policy tests; no qualified games.**

## Defect: printed Ability is not proof of an active Ability

The canonical `actor-observation-contract.cjs` supplies face-up Pokemon `abilities` as a projection of their **printed card powers**. This is appropriate as public information, but is **not** an assertion the powers remain enabled by current effects. In the exact rank-30 source, `Latias ex SSP76` is a Basic Rule Box Pokemon with printed `Skyliner`, granting all of its owner's Basic Pokemon no Retreat Cost while it works.

The prospective owner-root selector `chooseOwnerSkylinerRondoRetreat` v2 checked only `Latias ex SSP` plus a printed `Skyliner` in play, then treated retreat as zero cost. Its proposed tactic is unsound in a state with an effective public Ability lock. The pinned Store may reject the illegal RetreatAction, causing a game abort or an irrecoverably wasted bot choice. This is a correctness gap in the planning preflight, **not** a demonstrated native Store bug.

The supplied complete English card database confirms:

- `Path to the Peak CRE148`: Pokemon with Rule Boxes have no Abilities.
- `Silent Lab PRC140`: Basic Pokemon in play have no Abilities.
- Active `Iron Thorns ex TWM77`: `Initialization` suppresses Rule Box Pokemon Abilities except Future Pokemon. Latias SSP is not Future.
- Active `Klefki SVI96`: `Mischievous Lock` suppresses Basic Pokemon Abilities.
- A Tool-equipped `Garbodor LTR68/BKP57`: `Garbotoxin` suppresses Pokemon Abilities in play (except Garbotoxin).
- `Alolan Muk SUM58`: `Power of Alchemy` suppresses Basic Abilities while enabled.
- Opponent Active `Galarian Weezing RCL113`: `Neutralizing Gas` suppresses the opposing Pokemon's Abilities.
- Active `Wobbuffet PHF36` `Bide Barricade` **exempts Psychic Pokemon**; Latias ex SSP is printed Psychic, so Wobbuffet alone does not justify vetoing Skyliner.

These are conditional **paper-effect mechanisms**. Ability-lockers can be disabled themselves, Tool shielding can alter applicability, the relevant Pokemon may never reach the correct position, and Stadiums can be replaced. A general simulator requires actual active-effect resolution.

## Original published opponent source inventory

The exact source-60 census is reproducible using [script](../../scripts/agent6-public-skyliner-lock-field-census.cjs) and [tests](../../tests/agent6-public-skyliner-lock-field-census.test.cjs), over [29 authenticated original prints](full-decklists.json). Duplicates and non-60 lists fail closed.

| Printed conditional shutdown channel | Distinct exact original ranks carrying it |
| --- | --- |
| Path to the Peak | 5, 9, 12, 15, 20, 21, 27 |
| Silent Lab | 9, 13, 15, 32 |
| Iron Thorns ex Initialization | 6, 24, 29 |
| Klefki Mischievous Lock | 4, 17 |
| Garbodor with Garbotoxin, assuming a Tool | 8, 11, 16, 22 |
| Alolan Muk Power of Alchemy | None |
| Galarian Weezing Neutralizing Gas | None |

These mechanisms appear across **18 distinct original sixty-card opponent decks of the 29 authenticated sources** (18/29, 62.06897%). That is **deck-level card presence**: it is not the probability of active lock, of an affected retreat, of losing to that opponent, nor a substitute for the missing ranks **23, 25 and 28**. Path and Silent Lab overlap in rank 9 and rank 15. The field has no recovered original rank-25 Kume Klefki list to count.

## Reproducibility and change management

The historic preregistered 16-arm original rank30 [native Rondo panel](agent6-rank30-prospective-native-completion-20261102.md) is frozen at `agent6-owner-public-skyliner-rondo-mobility-v2-nominal-ko`. **The v2 helper was deliberately restored unchanged** so its registration and previously verified physical-deal results still reproduce. Source changing the original v2 version or preconditions would silently invalidate that control.

A separate **default-off pure policy wrapper**, [`agent6-skyliner-ability-suppression-guard.cjs`](../../simulation/twinleaf/agent6-skyliner-ability-suppression-guard.cjs), uses only own and opponent face-up Stadium, Pokemon, Ability names and Tools. It detects the named public suppressors and declines to propose a Skyliner-derived free retreat when any is observed. The [pure unit tests](../../tests/agent6-skyliner-public-ability-suppression.test.cjs) include original-v2 version parity and positive intent, Path both sides, Active Thorns, Tool-equipped Garbodor both sides, Active Neutralizing Gas, Silent Lab, Active Klefki, Alolan Muk, the no-veto Psychic Wobbuffet and untooled Garbodor controls, plus rejecting reads from hidden zones.

The original six guard tests passed the **real Node** optional manual rank30 CI step in [run 41431981492](https://github.com/FlareZ123/experiment-01/actions/runs/41431981492), which also recompiled the pinned Store and passed the original v2 register/panel workflow. This verifies isolated policy logic but **does not prove native lock settlement** or full policy integration. The expanded Basic lock tests and the source census are in a subsequent manual audit; retain its exact run result separately.

## Verified genuine pinned-Store mechanics, both seats

[Manual CI 41434356495](https://github.com/FlareZ123/experiment-01/actions/runs/41434356495) compiled the unchanged Twinleaf pin `a9905a76`, and the new staged Store check completed successfully **before** any later workflow steps. The independently downloaded [complete native artifact 13135837503](https://github.com/FlareZ123/experiment-01/actions/runs/41434356495/artifacts/13135837503) matches GitHub ZIP SHA-256 `b3601a367b44dbd450f833bcb0e57349dc7320cc486e3495767035101e98b4bf`; extracted 15,109-byte JSON SHA-256 `edc0c406b9a6e6e634117da9da384257f22995e375c81cb9b0ac156182c91aab`. Source runner is [agent6-skyliner-public-suppression-native.cjs](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs). This is a **staged rules check** with six prepared Prizes and native deck zones, not an authentic tournament source game.

**18/18 physical two-seat staged Store cases**, nine modes × two acting seats; **0 mismatched assertions**, actual `IS_ABILITY_BLOCKED`, actual `CheckRetreatCostEffect`, actual `RetreatAction` dispatch, and a public-only policy view all recorded.

| Staged public opponent posture | Printed Skyliner visible to owner? | Native Skyliner blocked? | Actual uncharged Latias Retreat Cost | Native zero-Energy retreat | Original v2 nominal selector | Default-off guarded variant |
| --- | --- | --- | ---: | --- | --- | --- |
| Baseline, no lock | Yes | No | 0 | Accepted | Proposed | Proposed |
| Path to the Peak | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Silent Lab | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Active Klefki | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Active Iron Thorns ex | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Equipped Garbodor | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Alolan Muk | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Active Galarian Weezing | Yes | Yes | 2 | Rejected: NOT_ENOUGH_ENERGY | Proposed | Vetoed |
| Active Wobbuffet, Psychic exception | Yes | No | 0 | Accepted | Proposed | Proposed |

Every row was independently repeated with the source as physical seat 0 and seat 1, with the same result. The native action acceptance test uses **Latias ex SSP with zero attached Energy**, two Basic Psychic Energy on a Benched Lillie's Clefairy ex, five occupied Benches each side, and a legitimate attacker target. In all seven suppression modes, **the original v2 would propose a retreat that the real native Store rejected**. Thus the printed-vs-effective-Ability planning issue is now a reproduced **native action failure**, not merely hypothetical card-text reasoning. The guard's veto was correct for these staged conditions.

These stages **do not prove full tournament lock uptime**, Tool-protection interactions, the original rank30 deck's ability to arrange the board before lock, or broader paper game strength. They also do not permit turning the prior prospective rank30 turn-46 result into a competitively qualified game.

## Next decisive validation

The controlled pinned Store lock-cost tests above now establish the original v2's actionable incorrect proposals and the guard's correct negative choices in nine staged postures. Next, reproduce the same effect in a genuine original-source two-player natural opening or continuation, with accepted opponent action, actual clock semantics, Tool protection or alternative Float Stone escape, and a valid common symmetric actor policy. Do not infer tournament win percentages from stage-only mechanics.

**Status:** This is a correctness and applicability improvement to source-opponent decision modeling. All rank30 engine terminals, including the one prospective turn-46 game flip, remain competitively **unqualified**; the fixed-60 99.5% objective remains unproven.
