# Agent 50: one effective-cost pipeline for live owner attack and attachment choices

**30 October 2026.** Development result. This change repairs a printed-cost inconsistency in the common actor-visible chooser. It does not estimate game win rate or certify tournament policy competence. **Verified original Aichi Top 32 lists: 29/32; competitive-qualified games: 0.**

## Concrete failure mode

The existing `agent17-public-context-special-energy.cjs` already removed Thunder Mountain Prism Star's single Lightning requirement when checking whether an attack was currently payable. Its same-file `choosePublicContextSpecialEnergy` scored potential Energy attachments using the unreduced attack cost. The owner action arbiter `agent41-owner-root-arbitration.cjs` can replace a first-choice attack with a purportedly useful Bench Special Energy attachment. With an active Stadium discount, a fully payable Bench attack could therefore be reported as still needing an Energy, making an attachment with zero **attack-cost improvement** appear to be an eligible override. Other attachment benefits were not evaluated. A separate, ordinary Basic Energy recipient heuristic `agent44-actor-energy-recipient.cjs` used printed numeric costs without either discount.

This was a *reachable pure-policy counterexample*, not evidence that the exact source-dealt game had encountered it. No private deck order, Prize identity, or opponent hand was needed.

## Paper text and scope

- Thunder Mountain Prism Star (Lost Thunder 191) reduces each Lightning Pokémon attack by one Lightning symbol. The [official advanced rulebook](https://asia.pokemon-card.com/sg/wp-content/uploads/sites/6/2025/10/EN_advanced_manual-2025.pdf) and [Limitless printed card](https://limitlesstcg.com/cards/en/LOT/191) establish the effect.
- [Dimension Valley (Phantom Forces 93)](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/xy4/93) reduces each Psychic Pokémon attack by one Colorless symbol. It is explicitly a different type-specific reduction.
- The existing published 29 source lists contain these stadiums in exactly four original printings: **rank 1 Shadow Rider Calyrex** has 1 Dimension Valley; **ranks 6, 24, 29 Iron Thorns** have 1 Thunder Mountain each. These counts were computed from `results/aichi-2026/full-decklists.json` and are not encounter rates.

## Implemented correction

1. `simulation/twinleaf/agent17-public-context-special-energy.cjs`: introduce `effectiveNativeAttackCost(view,catalog,pokemon,attack)` as a shared, non-mutating numeric cost array. It removes at most one appropriate typed symbol under either public Stadium and leaves other colors untouched. `effectivePublicAttackCost` maps that exact array to the existing flexible Special Energy symbols. Both `publicSpecialAttackPayable` and Special Energy attachment deficit scoring use the same result. The opt-in model version is `agent17-public-context-special-energy-intent-v2-stadium-cost`.
2. `simulation/twinleaf/agent44-actor-energy-recipient.cjs`: use the same native effective cost when deciding whether a held Basic Energy reduces a current printed non-GX attack's deficit, computing the after-attachment deficit, and ranking targets. The opt-in heuristic version is `agent44-owner-visible-known-special-recipient-v4-public-stadium-cost`.
3. `tests/agent17-public-context-special-energy.test.cjs`: pure Lightning/Psychic specificity, exact one-symbol reduction, no original printed-cost mutation, and attack-versus-Bench-Special arbitration regression. `tests/agent44-actor-energy-recipient.test.cjs`: Basic attachment preservation for ready Psychic attacks under Dimension Valley and for already-funded Lightning Benches under Thunder Mountain, with a still-needed second Lightning symbol positive control.
4. `tests/agent17-conditional-special-native.test.cjs`: a two-seat original pinned Store board fixture uses original `Iron Thorns ex TWM`, `Thunder Mountain Prism Star LOT`, `Double Colorless Energy SUM`, and `Speed Lightning Energy RCL`. Both native actor observations should see active and Bench Volt Cyclone payable and find zero further **attack-cost progress** from the offered Speed Lightning Energy. Speed Lightning may still draw two cards on attachment to a Lightning Pokémon, so this is strictly an attack-readiness witness, never a proof that spending it would be strategically bad. This is an injected printed-card state, not a random original-deck encounter.

## Verification and remaining qualification

- [Manual canonical CI 41010065123](https://github.com/FlareZ123/experiment-01/actions/runs/41010065123): **success** on first Thunder-focused helper and pure regression tests, including existing native canonical stages.
- [Manual canonical CI 41010510946](https://github.com/FlareZ123/experiment-01/actions/runs/41010510946): **success** on the shared numeric modifier, ordinary Basic recipient changes, and four added pure regressions.
- [Manual canonical CI 41010891608](https://github.com/FlareZ123/experiment-01/actions/runs/41010891608): queued 05:53 UTC for the additional *native original-printing two-seat fixture*. Confirm its actual final status before calling that specific native test validated.

The helper models only clearly identified public printed types, the two named Stadiums, and ordinary attached Energy values supported by existing calculators. Other attack-cost modifiers, Tool suppression, Ability-based type changes, full Damage and Prize effects, source-deal frequency, and opponent responses remain unverified. Conserving an attachment when an attack is already payable is a defensible *setup-cost-only* heuristic. [Speed Lightning Energy's printed trigger](https://asia.pokemon-card.com/my/card-search/detail/514/) explicitly draws two cards when attached to a Lightning Pokémon, independently of attack readiness. A future action-utility model must consider that immediate draw, later attacks, scaling damage, and Stadium disruption. No superiority of the attack-first choice is established.

The next useful shared-policy test is a matched, authentic rank 1 or rank 6 source deal containing the Stadium and a held competing Energy, with actor-only decisions and actual Store-accepted public effects. Keep default-off baseline and full root trace. Do not infer any increase in win rate from isolated action or unit-test acceptance.
