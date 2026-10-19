# Opening Horror House policy: exact copied-attack prompt validation

**Agent 1, 19 October 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, opt-in research policy. This is a local algorithm/Store regression, not source-dealt game outcomes or a demonstrated matchup improvement.

## Problem exposed

The candidate [Horror House opener tactic](../../simulation/twinleaf/new-moon-opening-horror-house-policy.cjs) originally returned an `AttackAction('Horror House-GX')` whenever printed Gengar was Active on global turn 2, or a `UseAbilityAction('Perfection')` when Mewtwo & Mew-GX was Active and Gengar was on the Bench or in the discard. Neither proposition verified effective Psychic Energy or whether the copied attack could actually be selected.

The first correction introduced a nonmutating speculative `SimpleTactic.simulateAction` preflight, mirroring pinned `AttackTactic`'s use of simulation for native attack viability. It correctly blocked an unpowered **native** Gengar but exposed a more subtle copied-attack false positive.

In compiled [CI 39248747842](https://github.com/FlareZ123/experiment-01/actions/runs/39248747842), the four genuinely staged `Store` cases yielded:

- Printed Gengar with no Psychic Energy: **refused**, as required.
- Printed Gengar with one Basic Psychic Energy: **accepted**.
- Mewtwo with benched Gengar and **no** Energy: **incorrectly accepted a `UseAbilityAction`**, failing the regression.
- Mewtwo with benched Gengar and one Basic Psychic Energy: accepted.

The reason is the pinned engine's `COPY_ATTACK_VIA_ABILITY` creates a `ChooseAttackPrompt` whose `options.blocked` records unpayable attacks. An outer `UseAbilityAction` can succeed or be cancelled without the intended copied Horror House ever becoming playable. Thus **simulation success of the Ability declaration is weaker than success of the intended attack**.

## Repair and validation

The [current research-only adapter](../../simulation/twinleaf/new-moon-opening-horror-house-policy.cjs) now uses two gates:

1. For both printed and copied channels, call the same speculative simulator legality boundary as pinned `AttackTactic` before committing the root action.
2. For the copied channel specifically, simulate the `Perfection` declaration in a detached `Simulator`, resolve only engine `WaitPrompt` animation prompts until the player's `ChooseAttackPrompt` appears, locate the printed Gengar `Horror House-GX`, and require `prompt.validate(attack)`. This respects the pinned engine's own dynamic `CheckProvidedEnergyEffect` and `CheckAttackCostEffect` blocking instead of approximating Energy provision from card names or raw `provides` arrays.

The choice gate uses a prompt intended for the acting player and its visible energy affordability status. It does not evaluate an opponent concealed-hand score to choose this forced action. The rest of the generic bot remains separately **unqualified for information-set-safe competitive inference**.

Two committed test files:

- [Root selection mock/idempotence regression](../../tests/new-moon-opening-horror-house-preflight.test.cjs): six cases after the repair; the initial five passed [CI 39248322870](https://github.com/FlareZ123/experiment-01/actions/runs/39248322870).
- [Actual pinned `Store` four-state Energy contrast](../../tests/new-moon-opening-horror-house-store-preflight.test.cjs): real registered Gengar and Mewtwo cards, owner Basic Psychic Energy, a visible Gengar donor, real Prizes and decks, no root state mutation from speculation.

**Final compiled [manual CI 39249559641](https://github.com/FlareZ123/experiment-01/actions/runs/39249559641) passed** all six pure tactical tests, four actual `Store` tests, and the existing full smoke workflow. Both native and copied channels reject zero Psychic Energy and accept one Basic Psychic Energy in their staged games.

## Limits and next evidence

- This verifies narrow legality and state-preservation with one true Psychic Energy and zero; it does **not** certify every dynamic Energy or Ability lock interaction, every delegated attack, or a real game win.
- The test uses engineered states with Gengar on Bench for the copied case. It is **not** a 60-card source-dealt opening frequency experiment.
- It has not been registered as a bilateral equal-policy candidate, so do not credit either deck with new historical wins.
- Before a bilateral v2 selection test, install any relevant opener policy symmetrically to both candidate agents, record the exact policy revision, and verify real source board, GX use, owner Energy, opponent reply and game clock. The generic bot's hidden-state valuation defect remains open.

**Evidence classification:** pinned-source inspection, staged compiled engine contradiction, repaired policy and four compiled Store regressions. **Competitive-qualified game count from this work: 0.**
