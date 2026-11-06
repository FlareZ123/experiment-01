# Agent42 paid-retreat v2 native regression repair

**Agent 42 · 6 November 2026**

## Decision

The root-bound two-Psychic paid-retreat selector/custody regression suite now passes **44/44 tests** against the repository's exact pinned Twinleaf revision, `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The v2 policy remains default-off. This validates a bounded decision proposal and a native RetreatAction/payment mechanism; it does not validate a full competitive game, a paper-legal deck strategy, or any matchup win rate.

## Failure diagnosis

Failed-job-only GitHub Actions logs from the prior paid-retreat CI run and the first focused regression run exposed several independent mismatches:

1. **Native Tool representation was wrong in the v2 custody hook.** At the pinned revision, `PokemonCardList.tools` is `Card[]`; only Energy is a `CardList` with a `.cards` array. The custody adapter read `source.tools.cards` and `target.tools.cards`, causing its native capture predicate to return null. Its pure test fixture repeated the same incorrect shape and therefore did not catch the defect.
2. **The positive prize-terminal fixture used a resistant Pokémon.** Lunatone OBF has printed Fighting Resistance. The v2 projection intentionally refuses to certify a target with Resistance. Combee OBF is the replacement positive fixture: 50 HP, no Resistance, no Ability, and no Rule Box.
3. **The Snorlax test asserted a different game-state flag.** Snorlax PGO's Block is enforced by its native RetreatEffect handler. It does not set `cannotRetreatWhileActive` on its own Active slot. The test now asserts the exact public Block printing/Ability and the actual Store rejection.
4. **The pinned card's engine fullName omits the collector number.** Upstream defines `fullName = 'Snorlax PGO'` and `setNumber = '55'`; the engine identity is not `Snorlax PGO 55`.
5. **Two stale action imports used a nonexistent module path.** The pinned upstream tree exports `RetreatAction` from `game/store/actions/game-actions`; there is no `game/store/actions/retreat-action` module.
6. **Callback-driven tests used the old custody observer.** They now use the root-bound v2 adapter and explicitly register the real Store and accepted root ordinal, seat, and turn.

## Changes

- `simulation/twinleaf/agent42-two-psychic-retreat-physical-custody-v2.cjs`: capture and compare native Tool arrays directly while retaining physical Energy-object custody and root-bound ordinal/seat/turn requirements.
- `tests/agent42-two-psychic-retreat-physical-custody-v2.test.cjs`: use the actual native `tools: []` shape so future schema drift is visible.
- `simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs`: classify the explicit active opposing Block text as a retreat veto without depending on a collector-number alias; keep unknown retreat text fail-closed.
- `tests/agent42-two-unit-paid-retreat-native.test.cjs`: use root-bound v2 custody, Combee OBF, the real `game-actions` import, and the actual Snorlax fullName.
- `tests/agent42-public-two-unit-paid-retreat-proposal-v2.test.cjs` and `tests/agent42-two-unit-retreat-v2-actor-integration.test.cjs`: align synthetic defender fixtures with Combee OBF's actual public profile and align the Snorlax printing identity.

The manual-only [Agent42 paid-retreat native regression workflow](../../../.github/workflows/agent42-paid-retreat-native-tests.yml) installs and compiles the pinned submodule, then runs the six relevant test files. It avoids replaying the registered 24-attempt A/B/A experiment just to validate a test/code correction.

## Verification

- [Focused CI run 42289037848](https://github.com/FlareZ123/experiment-01/actions/runs/42289037848): **success**.
- Pinned Twinleaf compile: success.
- Test result: **44 passed, 0 failed**, 3.75 seconds of Node test execution.
- Native positive controls: physical two-Basic-Psychic payment and promotion on both seats, with target Energy preserved and root Store/ordinal/seat/turn bound.
- Native negative controls: Skyliner free Retreat, Snorlax Block, Tool Jammer/tool lock, unused payable GX attack, nonlethal target, and default-off policy integration.
- The post-job cleanup emits a warning because the upstream submodule has a nested `vendor/pokemon-cards-css` entry without a matching URL in the outer `.gitmodules`. The test job itself succeeds; this report does not modify vendor code or its submodule metadata.

## Scope and next use

This suite supports the paid-retreat proposal's bounded public-information and native-action claims. It does not prove that the selector is strategically optimal, that its attack-damage/prize projection covers arbitrary card text, or that the candidate survives a meaningful opponent reply. The selector remains opt-in and no Aichi field experiment was run here.

The frozen v4 A/B/A artifact and its preregistration remain unchanged. Any future experiment must use a new registration and a corrected source-seat-aware summary/response join; the historical v4 helper hardcodes seat 1, turn 34, Max Geist, and opponent seat 0/turn 35. Do not infer candidate superiority from the one native terminal or from the test suite.

**Benchmark status remains:** 29/32 original Aichi Top 32 card-name/count inventories authenticated; zero competitively qualified games; no selected final 60-card deck; no demonstrated 99.5% field win rate.


### Explicit prize-projection scope

The v2 `projectedPrizeOutcome` is deliberately narrower than a complete prize-value model: it accepts only a non-Rule-Box, no-Resistance, no-visible-modifier target and returns exactly one Prize. It rejects **all** Rule-Box targets, including known GX/EX/VMAX/VSTAR/ex printings; it does not attempt to project their two- or three-Prize values. The Combee OBF fixture tests the positive one-Prize case. The Rule-Box/Resistance test title was corrected to describe this blanket veto. Any future multi-Prize extension needs an exhaustive exact-printing prize map plus tests for every supported class and failure on unknown printings.
