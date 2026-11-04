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
- Manual workflow dispatch [41879002047](https://github.com/FlareZ123/experiment-01/actions/runs/41879002047), submitted against HEAD `796042d0`. **Completed successfully, 4 November 2026 at 17:45 UTC, against pre-v3 commit 796042d0.** This success covers the earlier Tool Jammer v2 and other included regression suites; it cannot certify the subsequent public-cost v3 tests.


## Additional public retreat-cost correction (same owner helper, 4 November)

A second issue emerged while reviewing Rulebook **D-11, D-12, D-13**: printed zero Retreat Cost is not sufficient by itself when an applicable publicly visible effect adds a retreat requirement. This matters even though the main 29-list original field does not include the three extra cards tested below. The owner-specific pure selector now treats these precise printed sources as positive modifiers:

- **Galar Mine RCL**: the Stadium increases both Active Pokémon's Retreat Costs by two Colorless.
- **Spidops ex SVI, Trap Territory**: the opponent's Active has an additional Colorless Retreat Cost while this Ability is effective.
- **Ariados TWM, Big Net**: the opponent's Active Evolution Pokémon has an additional Colorless Retreat Cost while this Ability is effective.

The added `knownRetreatIncrease(view,catalog)` predicate reads the public Stadium, opposing face-up Pokémon printing/Abilities, and the current owner's printed Stage. If any known modifier applies, printed zero no longer certifies a natural free retreat. The selector offers a held Float Stone where otherwise permissible and accepts an already-attached unsuppressed Float Stone, whose explicit *no Retreat Cost* wording prevails under Rulebook D-13. Where opposing Ability lock might disable these modifiers, the conservative predicate may decline an actually payable natural retreat. This is a deliberately bounded negative gate and **not** a general effective-Retreat-Cost solver.

[Source revision ab814024](https://github.com/FlareZ123/experiment-01/commit/ab8140241361611c3d2f13b39f7ee6d50eefe869) and [new pure tests 340c650b](https://github.com/FlareZ123/experiment-01/commit/340c650b4fca569b6d837c8a01adedd6c8ab2a70), with an isolated stage-enum fixture correction [3ffc950f](https://github.com/FlareZ123/experiment-01/commit/3ffc950f1e423cc4261d5d08117df99f2cdcf088). The second [manual workflow run 41880307745](https://github.com/FlareZ123/experiment-01/actions/runs/41880307745), on checkout **b3d09b617a830d99a4a96836f081e98c2a1b1794**, completed **SUCCESS**. Independently inspected job log 126750721799 confirms **19/19** mobility and Skyliner pure tests passed, including all newly added Galar Mine, Spidops ex and Ariados cases; the prior source roster and Prize-collapse suites passed **9/9** tests. This workflow intentionally does not compile Twinleaf or run a native match. Zero additional competitively qualified games.

## Original-field exposure, inventory only

A direct count over the repository's 29 authenticated original card-name/count sixties (`results/aichi-2026/full-decklists.json`) gives **24 Float Stone copies across 12 original decks** (ranks 1, 3, 5, 8, 9, 11, 15, 16, 19, 22, 26, 30) and **five Tool Jammer copies across five** (ranks 3, 6, 7, 24, 29). There are **59 directed different-deck rank pairs** where the first original source contains any Float Stone and its opposing source contains any Tool Jammer: 12×5 minus the rank-3 self-pair = 59 of 29×28 possible ordered distinct-source pairs, or **7.2660%** of such pairings under *uniform ordered-pair weighting*. This number only measures **inventory co-presence across opponents**, never draw/access probability, Tool attachment, board position, effect activation, chance of paper-invalid action, or game impact.

The same 29 original decks contain **zero Galar Mine, zero Spidops ex and zero Ariados copies** by exact card name. The v3 extra-modifier guard therefore addresses possible candidate lists, other paper Expanded matchups or the three unknown originals; it is not represented as a demonstrated additional observed Top29 matchup defect. Authentic source deck totals remain 29/32.

## Integration boundaries

This is a narrow downstream planner fix against a preexisting independently demonstrated paper-negative control. It does **not** mean the selected Issue #25 v0/v1/v2/v3 policy executes this mobility helper, nor does it establish any whole-policy symmetry, hidden-information noninterference, source-game competence, legal payment, match clock, terminal accuracy or qualified win rate. Integrators should explicitly select and hash the helper before treating the guard as part of an executing release.

The field still has 29 authenticated original 60-card name/count inventories, three missing ranks 23/25/28, zero competitively qualified games, and no justified 99.5% claim.
