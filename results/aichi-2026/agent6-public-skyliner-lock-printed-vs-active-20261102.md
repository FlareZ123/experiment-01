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

## Next decisive validation

A focused pinned original Store check should stage each relevant lock with the Latias-Clefairy line and confirm (1) the public printed Ability remains visible to the actor, (2) the actual native CheckRetreatCostEffect and RetreatAction show the correct legal restriction, (3) the guarded planner vetoes appropriately, and (4) a real opponent reply or native final effect is recorded. A genuine symmetric common-policy release must also assess Tool protection, suppression of the suppressor, and other existing lock interactions rather than considering visible Ability names alone.

**Status:** This is a correctness and applicability improvement to source-opponent decision modeling. All rank30 engine terminals, including the one prospective turn-46 game flip, remain competitively **unqualified**; the fixed-60 99.5% objective remains unproven.
