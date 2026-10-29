# Rank-6 Iron Thorns: genuine Plumeria owner-opportunity and source-policy gap

**Agent:** 4, 2026-10-29. **Scope:** paper Expanded Aichi 2026 original rank-6 Iron Thorns source, independent of candidate deck identity. **Status:** reproducible native decision-policy diagnosis, not a win-rate estimate. **Twinleaf engine pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` under `vendor/twinleaf`.

## Why this matters

The published rank-6 source deck includes **four Plumeria BUS**. Plumeria can discard one Energy from an opponent's Pokémon after its player discards two hand cards. A simulation policy that never selects this live disruption axis can systematically underrepresent this opponent's strength. The strategic discard cost is important: an accessible card need not be desirable, particularly if the two own cards are protected strategic singletons. Neither native `canPlay` nor this observer decides that question.

## Pinned native rule/legality gate

The pinned engine's original `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts` requires a free Supporter quota, at least two other cards in hand, and at least one opposing Pokémon with attached Energy. When played it resolves three native prompts: two own hand discards, select an opposing Energy-bearing Pokémon, select and discard one physical Energy. The genuine Store regression in `tests/agent4-plumeria-pinned-native.test.cjs` tests both physical seats and verifies the two owner cards and opponent Energy physically enter the correct discard piles. Passed GitHub Actions [40961112893](https://github.com/FlareZ123/experiment-01/actions/runs/40961112893).

## Retrospective source-first games, read-only control

A reversible native Store and AI observer identifies authentic owner-root decisions, native Plumeria printings, held hand count, public opposing attached Energies, native `canPlay`, paper first-player restriction, accepted Pass, and any physical prompt/energy-loss outcomes. The observer never changes the underlying bot's choice and does not inspect concealed opposing cards.

The headless test `tests/agent4-plumeria-headless-native.test.cjs` executes the same four **previously selected** source-first development arms twice: observer off and observer on. Two are rank 6 and two rank 11. Exact `gameplayProjection` and opponent source-deal fingerprints match across off/on. Passed GitHub Actions [40961613247](https://github.com/FlareZ123/experiment-01/actions/runs/40961613247).

| Source rank | Actual owner roots | Held Plumeria roots | Native-positive Plumeria roots | Accepted Pass while playable | Plumeria plays | Plumeria Energy discards |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 | 90 | 28 | 26 | **24** | 0 | 0 |
| 11 | 95 | 0 | 0 | 0 | 0 | 0 |

These are **repeated owner decisions in two rank-6 games**, not 26 independent matches. The 24 native-positive accepted Pass roots establish an exposed action-coverage failure under these selected source deals. They do not establish the correct tactical value of Plumeria on any given turn. Rank-11 has no Plumeria and acts as a scope check. No tested game qualifies for competitive inference.

## Reusable artifacts and reproducibility

- `simulation/twinleaf/agent4-plumeria-opportunity.cjs`: passive exact-printing owner-root and receipt audit, default off.
- `tests/agent4-plumeria-opportunity.test.cjs`: six fake-Store reversibility, Pass, native-offer, privacy, and stage-settlement cases.
- `tests/agent4-plumeria-pinned-native.test.cjs`: genuine original Store and full three-stage physical card transitions.
- `tests/agent4-plumeria-headless-native.test.cjs`: exact retro source-first native gameplay parity and counts.
- `simulation/evaluation/agent7-canonical-actor-composition.cjs`: independent opt-in `ownerPlumeriaOpportunity:true` or `AGENT4_PLUMERIA_OPPORTUNITY_DEV=true` in the existing shared composition.
- `simulation/twinleaf/agent4-plumeria-after-pass.cjs`: separate experimental last-resort owner-root intervention, still requiring native full-game validation. It is not a recommended policy or a new candidate deck.

**Next dependency:** measure whether an opt-in source-seat after-Pass native Plumeria decision can complete all three genuine prompts in original paired games while retaining legal owner-visible input boundaries and unchanged initial source deals. Compare intervention vs control; never interpret retrospective outcome differences as prospective wins. Follow with a DCI/Supporter-opportunity evaluation of whether the two spent hand cards are worth the opponent Energy denial, against all rank-6 tactical alternatives.
