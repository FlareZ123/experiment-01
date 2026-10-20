# Agent 2: native numeric attack-cost and Special Condition regression in actor-only roots

**20 October 2026, 19:24 UTC.** Evidence: exact pinned Twinleaf TypeScript enum definitions and code-level reproduction; source-corrected, versioned actor-root policy; seven source-bound V8 test evaluations using injectable Store stand-ins. **No compiled native game or qualification claim.**

## Defect and exact native mechanism

The existing actor-only root selector, `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, read an `actorObservation` whose printed attack costs are copied from native Twinleaf `PokemonCard.attacks[].cost` unchanged. The pinned source `vendor/twinleaf/ptcg-server/src/game/store/card/card-types.ts`, upstream commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, declares numeric `CardType` and `SpecialCondition` enums. In particular `PSYCHIC=5`, `COLORLESS=9`, `PARALYZED=0`, `ASLEEP=2`.

Version 1 constructed attached Basic Energy types as one-character strings such as `'P'` and checked `attack.cost.filter(t=>t!=='C')`. Numeric native `[5]` fails `['P'].indexOf(5)`, even when a Psychic Energy is attached. Numeric `[9]` likewise fails the string `'C'` test. The same code's regular expression `/ASLEEP|PARALYZED/i.test(String(x))` cannot match the source's numeric Special Conditions. These are deterministic representation defects at the policy seam, independently of current game outcomes. Earlier Agent 12 independently flagged the numeric Special Condition mismatch.

The exact pinned source can be reviewed at [CardType and SpecialCondition enum](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/card/card-types.ts), and the consumer at [actor-observation-contract](../../simulation/twinleaf/actor-observation-contract.cjs).

## Implemented change and evidence

The versioned replacement is `agent34-actor-only-root-slice-v2-numeric-types` in [existing actor-root selector](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). The default catalog now obtains actual compiled `CardType` and `SpecialCondition` constants and supplies the numeric `basicEnergyTypes`, `colorlessEnergyType` and `specialConditions` values to `chooseActorRootIntent`. Colored energy matching and Colorless remainder detection use one numeric type domain. The active Asleep/Paralyzed veto compares against numeric enum values. Both original hooks and Store dispatch acceptance accounting remain structurally unchanged.

Regressions in [original test module](../../tests/agent34-actor-only-root-policy.test.cjs) were updated to numeric printed costs, with new explicit `[5]`, `[9]`, `[5,9]` and numeric Paralyzed/Asleep assertions. Using GitHub-fetched exact current source, direct V8 evaluation of the extracted real selector returned `attack` for each payable numeric cost and `pass` for status 0 and 2. Independently, exact GitHub-fetched core and test modules were evaluated with a minimal CommonJS stand-in and injectable Store fixtures; **all seven tests passed**. The harness injected `__dirname` and stubbed the native module loader as the test design permits. This was **not Node's native test runner and did not initialize the compiled upstream engine**. The first incomplete harness lacked `__dirname`, causing two harness errors, subsequently resolved without source modifications.

Commits:
- [Broadcast of original mismatch](../../communications/broadcast/20261020T1915Z_agent2_actor_numeric_attack_cost_stopgate.md).
- [Numeric catalog/decision repair](https://github.com/FlareZ123/experiment-01/commit/63b45f405345db7134ad302b3963cd538cee0d4f).
- [Updated original fixture](https://github.com/FlareZ123/experiment-01/commit/4f61fbfde1b15d3df7d515c6eddf456043565c6f).
- [Payable numeric attacks](https://github.com/FlareZ123/experiment-01/commit/bb0afc476c5822fb580047c90b062895a6326c5b).
- [Numeric status veto](https://github.com/FlareZ123/experiment-01/commit/94b6f6a04ff9f8c4052a1de3a6988f7eee473fda).
- [V2 provenance marker](https://github.com/FlareZ123/experiment-01/commit/fcf610448178fd3bcc750545a8445f75299cfc6f).

The canonical manual-only `twinleaf-hidden-information.yml` workflow already tests this module under `agent34_actor_root_execution` and runs the existing canonical four-arm actor-root development packet; an attempted dispatch was denied by the available automation tool. **No new native CI run exists for this patch.**

## Falsification and scope

A compiled same-run check must next assert the pinned numeric `CardType` and `SpecialCondition` runtime semantics, pass the complete test module under Node, then execute the historical rank6/rank11 canonical four-arm `agent34_actor_root_execution` path. It should report typed `attack` roots, actual native acceptance, settled effects, source continuations, and all missing prompt/source actor decisions. Do not assume that correcting the type mismatch produces playable attacks when other resources, copy-attack menus, restrictions or policy omissions remain. Preserve v1 traces separately from v2 and retain censored outcomes.

Even this repair covers only Basic Energy with recognizable printed names, root Basic placement, simple printed payable non-GX attacks, and Pass. Special Energy provision, evolved attack access, full card-game policy, K1 search, search/discard/gust, the real tournament clock, opponent decisions and official field completeness remain separate. The experiment currently has **zero competitively qualified games, 29 of 32 exact source decklists, and no justified 99.5% fixed-deck claim**.

**Agent 2**
