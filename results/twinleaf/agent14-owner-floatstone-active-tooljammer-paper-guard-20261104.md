# Agent 14: paper-visible Active Tool Jammer guard for generic emergency Float Stone mobility

**4 November 2026.** A narrow owner-information-only policy correction, with no qualified games or deck-strength claim.

## Why this matters

The printed **Float Stone** (BW9 99 / XY8 137) says the attached Pokémon has no Retreat Cost. The printed **Tool Jammer** (BST 136) explicitly makes opponent Active Pokémon Tools have no effect while its carrier is Active (other than Tool Jammer itself). **Jamming Tower** (TWM 153) makes attached Tools ineffective for both players. Printed-natural zero Retreat Cost remains independent of both Tool-suppression effects.

The prior generic `chooseOwnerFloatStoneMobility` in [Agent1's owner mobility module](../../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs) already declined emergency Float Stone attach/retreat under public Jamming Tower, but it lacked the *opposing Active Tool Jammer* check. Thus its own public-board predicate could propose a paper-invalid free-retreat line even though the earlier [Agent6 genuine pinned Store finding](../aichi-2026/agent6-tool-jammer-floatstone-native-fidelity-20261102.md) had established exactly this discrepancy in two physical seats. Native Store acceptance alone is not a legality certificate.

## Change and fixed contract

The now-versioned `agent1-owner-public-zero-energy-floatstone-mobility-v2-tool-jammer-guard` checks **only public opponent Active Tools** for a printing starting `Tool Jammer `, together with public Stadiums for `Jamming Tower `. If the owner's Active has printed nonzero retreat cost, either suppression makes a held Float Stone attachment or an attached Float Stone retreat unavailable to this selector. If the Active's **printed** retreat cost is zero, the natural retreat remains available. An opponent's *Benched* Tool Jammer has no such effect.

This correction does not inspect hidden decks, opposing hand, Prize identities, opponent archetype, seed or candidate rank. It does not change upstream Twinleaf, patch Store legality, or globally install a new policy hook. All decisions remain subject to native Store and independent paper validation. A positive original-source legal opportunity is not proved by this pure policy change.

### Reproducibility

- Updated source: `simulation/twinleaf/agent1-owner-float-stone-mobility.cjs`; first change commit [30400e25](https://github.com/FlareZ123/experiment-01/commit/30400e25ac461a6cc16cba669dc3b1d8e91dbf37).
- Pure regression: `tests/agent1-owner-float-stone-mobility.test.cjs`; [43c501db](https://github.com/FlareZ123/experiment-01/commit/43c501dbbad6c2726227562599cdb03f503c72c3).
- Existing **manually dispatched** four-minute workflow `.github/workflows/agent14-source-mobility-census.yml` now runs this policy's regression beside Agent6's existing Skyliner/Tool-Jammer suite; [796042d0](https://github.com/FlareZ123/experiment-01/commit/796042d0c7fa92885f8ee321c33d87d517fafaf2).
- Manual workflow dispatch [41879002047](https://github.com/FlareZ123/experiment-01/actions/runs/41879002047), submitted against HEAD `796042d0`. **Status at report composition: queued; independent compiled CI PASS is not yet claimed.**

## Integration boundaries

This is a narrow downstream planner fix against a preexisting independently demonstrated paper-negative control. It does **not** mean the selected Issue #25 v0/v1/v2/v3 policy executes this mobility helper, nor does it establish any whole-policy symmetry, hidden-information noninterference, source-game competence, legal payment, match clock, terminal accuracy or qualified win rate. Integrators should explicitly select and hash the helper before treating the guard as part of an executing release.

The field still has 29 authenticated original 60-card name/count inventories, three missing ranks 23/25/28, zero competitively qualified games, and no justified 99.5% claim.
