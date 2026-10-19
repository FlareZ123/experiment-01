# Native-attack and delegated Perfection hidden-state forecast control

Agent 10, 19 October 2026. Evidence type: a **compiled pinned-engine staged conditional game-state diagnostic**, not a source-dealt game.

## Reproduction

The exact 60-card [published rank-11 Mega Absol/Garbodor opponent](../aichi-2026/full-decklists.json) was conserved while four unseen Darkness Energy and four unseen Battle VIP Pass exchanged positions between hand and deck. Both worlds exposed the same observations to the acting player. The owner held a synthetic 60-card inventory: one Mewtwo & Mew-GX UNM71 Active with two Basic Psychic Energy, one Gengar & Mimikyu-GX TEU53 in discard as the Perfection payload, plus Basic Psychic Energy elsewhere. GX allowance was spent, isolating ordinary Poltergeist.

[Staged executable](../../simulation/twinleaf/perfection-hidden-pool-ability-audit.cjs), [regression](../../tests/perfection-hidden-pool-ability-audit.test.cjs), and [opt-in reversible correction](../../simulation/twinleaf/opponent-hidden-pool-attack-sampling.cjs). Native-attack pairing was expanded independently to all six Active-damage conditions crossed with GX available/spent: [report](rank11-hidden-choice-grid-followup.md).

Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research build and manual-only workflow: [compiled CI 39318686082](https://github.com/FlareZ123/experiment-01/actions/runs/39318686082) **passed** its tests after the initial incomplete synthetic owner-60 fixture was corrected. The earlier red diagnostic [39318242189](https://github.com/FlareZ123/experiment-01/actions/runs/39318242189) failed at a 21-vs-60 fixture assertion before evaluating the ability, and is not a competing gameplay result.

## Score result

| Identical actor observation, different hidden rank-11 partition | Opponent hand with Darkness Energy | Opponent hand with Battle VIP Pass |
| --- | ---: | ---: |
| Raw pinned UseAbilityAction('Perfection') simulated score | 161 | 421 |
| With the older AttackAction-only sampler installed | 161 | 421 |
| With newly opt-in Perfection sampling (24 deterministic hidden-pool permutations) | 323.5 | 323.5 |

The old helper patches `SimpleTactic.prototype.evaluateAction` only for `AttackAction`. Printed attacks use that class, whereas Perfection uses `UseAbilityAction` with a subsequent `ChooseAttackPrompt`. The new `includePerfectionAbility:true` option reconstructs this action inside each copied, independently shuffled opponent-hidden world before scoring. The original prototype is restored afterward; the default option remains false. Owner and source are complete artificial/staged physical inventories; owner-observation equality is asserted. This is an actual action-score information leak with a successful bounded opt-in parity correction, not yet an observed different **Perfection decision**.

## Limits and next integration gate

The staged owner 60 is overwhelmingly Psychic Energy and is not a legitimate competitive candidate. The example's complete known opponent source 60, hidden-pool identities and absence of observed hand/deck positions are externally asserted premises. Unknown opponent lists, revealed/private-view histories, dynamic hidden information, other tactics, prompt-selection scoring, policy competence and whole-game outcomes are outside this test. Sampling 24 worlds gives a deterministic local heuristic rather than an optimal Bayesian policy; parity does not prove strategic correctness. Perfection selected attack choice may still have independent tactical defects.

Integrators must version the `includePerfectionAbility` option separately and verify observation filtering in the *complete* candidate/source runner before any fresh bilateral comparison. The earlier frozen tests must not be retrospectively rescored or used as winning evidence. Exact field sources remain **29/32** (ranks 23/25/28 missing). **Zero** games meet competitive qualification and no 99.5% claim is supported.
