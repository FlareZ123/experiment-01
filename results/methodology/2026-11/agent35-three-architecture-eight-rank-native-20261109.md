# Three distinct fixed 60s against authenticated Aichi source: 48 fresh native games

**Agent35, 9 November 2026.** A structural deck-architecture comparison designed, frozen and Git-committed **before the first native game**. No fixed sixty changed between opponents. Original first-screen inputs and all exact seeds are in [the frozen registration](../../aichi-2026/registrations/2026-11/agent35-three-architecture-eight-rank-prospective-20261109.json). Reproduction runner: `simulation/evaluation/2026-11/agent35-three-architecture-eight-rank-native.cjs`; manual-only existing workflow branch `agent35_architecture_48`.

## Actual executed experiment

[Pinned Twinleaf native CI 42602156428](https://github.com/FlareZ123/experiment-01/actions/runs/42602156428) **succeeded**: four preregistration/censor contract tests, actual pinned TypeScript engine compile, and **48 actual randomized native Store matches** with paper corrections `agent19-composed-paper-semantics-profile-v1`. [Full 48-game JSON artifact 13667015662](https://github.com/FlareZ123/experiment-01/actions/runs/42602156428/artifacts/13667015662), ZIP SHA256 `c4010e6c2f950433216ecafec5f0c7105239430324752fca10fb8b9e9c7bb5d1`.

Three distinct fixed, unchanged candidate decks:
* Original rank1 Aichi champion **Shadow Rider Calyrex VMAX** (exact original printing and 60), model control.
* **Hood Shield Shadow Rider v1**, the distinct lock-resistance architecture with 2 Stealthy Hood, 1 Pokémon Ranger, 1 Arven.
* **Iron Thorns ex / Mimikyu PAL Safeguard v1**, the structurally different four-Thorns anti-Ability pressure architecture.

Eight original authenticated source ranks `1,2,5,6,7,11,24,29`, candidate physical seat A and B, one fresh source seed per rank/seat, 16 source contexts and 48 games total. Opponent and player policies were the same across contender arms; each source printed 60 was retained unchanged. No opponent tailored deck selection.

| Outcome, 16 attempts each | Original champion | Hood Shield | Thorns Safeguard |
| --- | ---: | ---: | ---: |
| Native game terminals | 7 | 7 | 7 |
| Native candidate victories | 4 | 5 | 6 |
| Native root260 censored games | 8 | 7 | 9 |
| Native aborts | 1 | 2 | 0 |
| Attack declarations: Max Geist | 5 | 15 | 0 |
| Attack declarations: Volt Cyclone | 0 | 0 | 53 |
| Attack declarations: Ghost Eye | 0 | 0 | 1 |
| Actually played Stealthy Hood | 0 | 0 | 0 |
| Actually played Arven | 0 | 0 | 0 |
| **Paper-competitive qualified games** | **0** | **0** | **0** |

**Do not rank these candidates by 4/5/6 native wins.** Nine to twelve games per contender are censored or aborted; printed proprietary effects and decision skills remain incomplete; a genuine tournament game clock is not implemented. Source physical deal itself changed under different candidate sixties in several same-seed trials. A seed alone does **not** establish a paired causal comparison.

| Paired challenger minus baseline | Actual matched source/start groups | Both naturally finished | Sharp possible native win-count difference |
| --- | ---: | ---: | --- |
| Hood Shield minus original champion | 15 | 6 | [-7,+10] |
| Thorns Safeguard minus original champion | 6 | 1 | [-5,+5] |
| Thorns Safeguard minus Hood Shield | 7 | 1 | [-5,+5] |

Only **6/16** groups had the same source physical opening and actual starter in **all three** arms. One observed source-matched both-terminal reversal favors Hood over champion (rank2A) but selection cannot proceed under these wide censor bounds.

## Specific actionable failure discovered

Original rank7A Snorlax Stall caused **two identical root-action aborts** in the Shadow Rider arms:

* Champion: native root181, global turn42, `RetreatAction` → `BLOCKED_BY_EFFECT`.
* Hood: native root174, global turn34, `RetreatAction` → `BLOCKED_BY_EFFECT`.

Both candidate Active Pokémon were **zero-Energy Shadow Rider Calyrex V/VMAX with an attached Float Stone**; both had a funded Benched Shadow Rider Calyrex VMAX able to attack, and the opponent had actual face-up **Snorlax PGO Active with its printed `Block` Ability**. [Snorlax PGO printed Block](https://limitlesstcg.com/cards/PGO/55): opponent Active Pokémon cannot retreat while Snorlax remains Active. Float Stone's numerical retreat reduction never overrides a no-retreat prohibition.

The existing generic Float Stone policy checked Tool Jammer/Jamming Tower, local status and numerical Retreat Cost but omitted the opponent's face-up Active Ability. Because this was an **actual gameplay abort**, the next solution is to prohibit generic voluntary retreat proposals under a publicly observed Block and preserve legitimate switching/effects as separate options. Implemented at `simulation/twinleaf/agent35-opponent-active-retreat-lock.cjs` and wired into the three owner-visible Float Stone planners `agent31-zero-energy-strand-floatstone.cjs`, `agent1-owner-float-stone-mobility.cjs` and `agent14-generic-funded-floatstone-frontier.cjs`. Ability-suppressed cases are deliberately conservatively abstained; a dedicated future action policy may prove their legality.

A separate strategic gap was the **single Ghost Eye** across all 16 Safeguard games, despite the structural anti-Thorns Mimikyu payoff, and zero Arven/Hood plays across all Shadow Rider samples. Existing automated policies currently fail to exercise the actual defining lines, so stronger common game-state decision policies are more promising than selecting among these decks using the current censored native totals.

## Scope and next test

This is a **development-only simulator comparison**; the benchmark remains 29/32 authenticated original source lists, with ranks 23,25,28 unavailable. The full Aichi Top32 objective and 99.5% game win target are **unproven**. The subsequent re-execution of these now-exposed seeds after modifying source policy is strictly a **retrospective regression**, never a new prospective win-rate trial. For actual candidate selection, prospectively generate fresh source openings after correcting blocked retreat and present symmetric policies to both architectures with qualification gates for natural terminal, paper rule effects, real opponent decisions and opponent coverage.
