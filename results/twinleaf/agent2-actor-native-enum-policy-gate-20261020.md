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

## 20 October 19:38 UTC continuation: native live-State and physical effect integrity

A second, independent reviewer gate found that the root policy previously selected actor actions on any State with a matching seat, including hypothetical State clones evaluated by a generic bot. The existing [Agent 5 compiled owner-root implementation](../../simulation/twinleaf/agent5-owner-root-slice.cjs) explicitly excludes clones by checking `state === liveStore.state`. The shared Agent34 root now applies the same strict authentication, counts `nonLiveSpeculativeFallbacks`, and delegates non-live proposals without actor-only credit. It also requires the pinned numeric `GamePhase.PLAYER_TURN` for non-prompt owner-root decisions and counts `nonTurnPhaseFallbacks`. A speculative-State regression verifies delegation to the original fallback and one clone counter increment.

A separate substantive play-lock correction uses the native Basic's printed `PowerType.ABILITY` metadata. When the owner-visible `abilityPokemonPlayLocked` flag is true, the selector skips Ability-bearing Basic Pokémon while still allowing a Basic with no printed Ability. It avoids proposing a locked play that the genuine Store may reject. This is rooted in the existing [actor observation play-lock flags](../../simulation/twinleaf/actor-observation-contract.cjs) and independently existing [player-play-lock-veto](../../simulation/twinleaf/player-play-lock-veto.cjs).

An accepted `Store.dispatch` with no thrown exception previously counted as an accepted actor root without proving the proposed effect. The shared actor-root hook now captures a before/after **detached, public-only SHA-256 zone fingerprint** and turn/phase, and reuses Agent 5's exported native `rootPhysicalSnapshot/rootPhysicalWitness` to distinguish `confirmed-public-effect`, `no-confirmed-public-effect`, and `attack-needs-declaration`. It counts native physical outcomes separately from accepted Store submissions. The native fixture confirms one directly visible hand-to-Active Basic Energy mutation and an unchanged concealed-information fingerprint under opponent hand and own still-unseen deck/Prize substitutions. Source-only harness verification used the exact GitHub blob of the changed module and original test file, plus actual imported helper source from Agent5 and the observation contract, with injectable Store/crypto stand-ins; **10/10 tests passed**. The pure harness is not an actual compiled Twinleaf game.

Relevant commits: [public transition audit](https://github.com/FlareZ123/experiment-01/commit/fbe6d9ebdfb6e6886daf2a9340ba899603bffe24), [Agent5 physical witness reuse](https://github.com/FlareZ123/experiment-01/commit/6dfed46c8abe55edb020f07c75bc9e9f27b337d7), [native energy mutation test](https://github.com/FlareZ123/experiment-01/commit/bfdcd1328637cb1d427b1476d0fd3d3681a73c75), [visible Ability Pokémon-lock guard](https://github.com/FlareZ123/experiment-01/commit/14b6ab20147119a21358a1527c69a772e12a778d), [live State-only root gate](https://github.com/FlareZ123/experiment-01/commit/52280b6e7672827ea9283d384723581a70930dfd), [PLAYER_TURN phase gate](https://github.com/FlareZ123/experiment-01/commit/0e39062fe008ade9fbf1cbf66aa2eb7e1a5a894b), [exact fixture and clone regressions](https://github.com/FlareZ123/experiment-01/commit/d2418b5e9d3e0a7f3f8a136f2916e7965ef61c91).

The **same canonical native four-arm run remains essential** before claiming the chosen numeric/Ability/root actions work under a real pinned engine. No original-vs-fixed competitive causal test, completed actor-only full game, new qualified win, full 32-field registration, or evidence for 99.5% exists.
