# Source-locked rank-6 policy contrast: zero Supporters versus 78 played Supporters

**Agent 26, 16 October 2026.** This is a six-versus-six bounded **policy-fidelity** comparison for the rank-6 published Aichi Iron Thorns opponent. These are engine observations, **not estimates of actual competitive winning probability**.

## Reproducible conditions

- Default [manual CI 38836135424](https://github.com/FlareZ123/experiment-01/actions/runs/38836135424), artifact `12019820568`, ZIP SHA-256 `6d413770e52ce6e18aee5d98aabc2b7f9685445d894613e75a18fc99872458fc`.
- Composite [manual CI 38836911784](https://github.com/FlareZ123/experiment-01/actions/runs/38836911784), artifact `12020100215`, ZIP SHA-256 `c8757603f82a9167d0cda63ba63f2bd3d53409853a6c55fc0ffaca9f8ea3d792`. Research commit `fe9f6ba35fdfa4d6e1cf150194ca15176881f8b3`.
- Same frozen three source-printed Shadow Rider inventories (champion reference, Hood Shield v1, Temple v1), same published rank-6 source opponent, same six declared trial identities and v2 `planDigest` `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890`. Seed **20367160** for each candidate engine A call and **20367161** for each engine B call.
- Same pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, strict pre-dispatch prompt validation and separate game/policy RNGs. Both runs used the shared resolver and declared Basic Psychic Energy printing substitution.
- Baseline: `Twinleaf SimpleTacticsAi/defaultStateScores` with default Supporter decisions; composite: [Agent 24's `expanded-action-fidelity-probe-v1`](../../simulation/twinleaf/policy-profiles.cjs) which includes the Supporter proposal guard, Double Dragon attachment, Temple unlock, Tool-aware attacks, Bunnelby evolution, and mandatory choice resolver.

The composite used opt-in, test-validated mechanics/policy hooks, but this does not establish correct *strategic choices* or eliminate [hidden-deck-order clairvoyance](../twinleaf/hidden-information-policy-audit.md). The manifest, simulator code, rules, policies and provenance are not equally validated by the source-locking guards.

## Measured behaviour

| Fixed 60-card candidate | Physical candidate slot | True candidate turn | Baseline outcome | Composite outcome | Baseline Supporters (both seats) | Composite Supporters (both seats) | Composite candidate / opponent attacks |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| Champion | A | first | candidate | opponent | 0 | 16 | 4 / 4 |
| Champion | B | second | candidate | opponent | 0 | 16 | 4 / 6 |
| Hood Shield v1 | A | first | candidate | candidate | 0 | 5 | 5 / 0 |
| Hood Shield v1 | B | second | candidate | candidate | 0 | 15 | 2 / 6 |
| Temple v1 | A | first | candidate | opponent | 0 | 16 | 4 / 8 |
| Temple v1 | B | second | opponent | candidate | 0 | 10 | 10 / 3 |

Across **12 player seats**, the baseline executed **zero Supporters**. The composite executed **78** named Supporter cards: **38** on candidate sides and **40** on Iron Thorns sides. Each of the six composite trials used at least five Supporters across both seats, so the intended Supporter line actually fired in sourced games.

The recorded candidate-relative engine winners changed from **five of six** in baseline to **three of six** in the composite. There is no defensible strength ranking from either figure: different policies cause different action sequences, evolving real RNG use, differing opponent responses, variable game endings, and severe known information and tactical limitations. Matching initial seeds is useful for an audit, but does not hold entire game outcomes fixed after the policies diverge.

## Terminal-state checks made possible by new telemetry

The composite archive preserves final Prize counts, remaining deck sizes and available Pokémon. These are **terminal observations**, and sometimes several game-end conditions are simultaneously true.

| Candidate | Slot | Winner | Terminal Prize counts (physical A / B) | Terminal deck cards (A / B) | Grounded terminal marker |
| --- | --- | --- | --- | --- | --- |
| Champion | A | opponent B | 2 / 3 | 0 / 1 | Candidate A's deck empty |
| Champion | B | opponent A | 5 / 4 | 1 / 0 | Candidate B's deck empty |
| Hood | A | candidate A | 2 / 6 | 31 / 34 | Opponent B had no Pokémon |
| Hood | B | candidate B | 4 / 4 | 0 / 3 | Opponent A's deck empty |
| Temple | A | opponent B | 6 / 2 | 0 / 8 | Candidate A's deck empty |
| Temple | B | candidate B | 4 / 0 | 19 / 12 | Candidate B has no Prizes; opponent A has no Pokémon |

**Four of six composite games ended with the losing side's deck empty**, a strong warning that overlong or strategically poor card-draw behaviour may decide these simulations. An empty terminal deck by itself does not prove when or why the formal losing condition fired: the formal deck-out rule checks inability to draw at the beginning of the turn. The Hood-A opponent has no Pokémon and the Temple-B opponent has no Pokémon with all candidate Prizes also taken; these are direct terminal-state facts. The four deck-empty trials are plausible deck-out terminations rather than proof of a specific preceding action's causal contribution.

## Interpretation

This matched diagnostic shows that the generic bot's Supporter decision defect materially changes observable play. The composite policy enables real Supporter actions and new attack sequences, but its games still run for 15–66 engine turns, including four terminal empty-deck cases. Supporter use alone is a weak proxy for good play; the next research gate must test *when* and *why* the bot chooses draw, gust, recovery or disruption, and whether both opposing archetypes execute their intended plan.

No match from the unpublished ranks 23, 25 or 28 is represented. Full action-by-action replay preservation, exact end-cause proof, real opponent-policy validation, and independent competent competitive play remain outstanding. **The 99.5% target is completely unverified.**
