# Agent 16: 259 computed imports, ten nonstandard syntax sites, and stale root-source pins

**2 November 2026, normal identity Agent16.** Static research-code provenance analysis from the existing manual benchmark, no new games, no deck optimization result or competitive qualification.

## The denominator correction matters

The earlier `agent16-transitive-policy-source-inventory.cjs` scanner reported `unparsedRequires.length:120`. This means **120 source files** contained one or more unmatched `require(` occurrences. It is **not** 120 unmatched expressions. At exact [manual benchmark CI 41402938809](https://github.com/FlareZ123/experiment-01/actions/runs/41402938809), the reviewed scanner counted **291 reachable research module files**, **117 literal process environment keys**, **120 source files with computed imports** and **259 individual computed import call sites**:

| Syntactic prefix after `require(` | Computed call sites | Preliminary interpretation |
| --- | ---: | --- |
| `path.join(` | **249** | Constructed module paths, frequently into compiled Twinleaf |
| `path.resolve(` | 3 | Explicit vendor/output absolute paths |
| `modulePath` | 3 | Named variable holding an explicit vendor output path |
| `compiled` | 2 | Named variable holding an explicit vendor output path |
| `engineModule` | 1 | Named variable holding an explicit vendor output path |
| `nodePath.join(` | 1 | Alias of Node's path join, again into vendor output |
| **Total** | **259** | No complete dynamic closure implied |

The 259 site count is a lexical lower-bound audit over the 291 scanned files, not an AST-verified count of runtime imports. A source file may contain imports only activated by opt-in hooks. The registry is an audit of reachable source text, not proof of executed dependencies.

## Ten exceptional computed call sites manually traced

At the [later CI 41403180198](https://github.com/FlareZ123/experiment-01/actions/runs/41403180198), the instrumented final audit printed the source address of every site whose expression does not start with literal `path.join(`. The following files were then inspected through their actual current GitHub source bytes:

| Source file under `simulation/twinleaf/` | Kind / count | Observed path construction |
| --- | --- | --- |
| `card-coverage.cjs` | `path.resolve` ×2 | Literal `../../vendor/twinleaf/ptcg-server/output/game/store/card/{card,card-types}` |
| `dialga-bench-exposure-guard.cjs` | `compiled` ×1 | `path.resolve(..., '../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics/play-basic-tactic')` |
| `guzma-self-switch-guard.cjs` | `compiled` ×1 | Same pinned output root, `play-supporter-tactic` |
| `hisuian-heavy-ball-prize-hook.cjs` | `modulePath` ×1, `path.resolve` ×1 | Exact vendor/compiled `hisuian-heavy-ball` module and `game/game-message` |
| `native-accepted-target-store-observer.cjs` | `nodePath.join` ×1 | `nodePath.resolve(..., '../../vendor/twinleaf/ptcg-server/output')` + `game/store/store` |
| `post-super-alias-repair-hook.cjs` | `modulePath` ×1 | `path.join(path.resolve(.../vendor/twinleaf/ptcg-server/output), 'game/bots/simulator')` |
| `prototype-safe-simulator-hook.cjs` | `modulePath` ×1 | Same vendor `game/bots/simulator` |
| `supporter-decision-hook.cjs` | `engineModule` ×1 | Absolute vendor compiled `play-supporter-tactic` |

These ten syntactically nonstandard calls **all resolve by source-code construction to the pinned compiled Twinleaf tree**, rather than an unbounded external package name, in the inspected code. This is a positive provenance clarification, but the **249 other computed `path.join` sites are not individually proven vendor-only here**. A vendor submodule Git revision does not automatically hash runtime-generated build outputs or all external package dependencies.

## Six checked roots are a moving source audit, not a release freeze

The same inventory `simulation/evaluation/agent42-strict-switch-inventory-v1.json` includes historic Git blob pins for six first-level roots. A fresh GitHub file/API comparison at approximately 06:58 UTC on 2 November found:

| Root path (relative under repository) | Registered vs present Git blob |
| --- | --- |
| `simulation/evaluation/agent41-bilateral-v2-development.cjs` | **Mismatch** |
| `simulation/twinleaf/agent34-actor-only-root-policy.cjs` | **Mismatch** |
| `simulation/evaluation/agent7-canonical-actor-composition.cjs` | **Mismatch** |
| `simulation/twinleaf/agent4-plumeria-after-pass.cjs` | Match |
| `simulation/twinleaf/agent41-actor-owner-single-search.cjs` | Match |
| `simulation/twinleaf/agent47-actor-hand-discard.cjs` | **Mismatch** |

**Four of six root source pins already differ from current main**, while the current key *names* inventory still passes. This is acceptable for a changing source-text discovery inventory expressly labelled `audit-only-dependency-coverage-not-a-release-policy`. It would **fail a claim that the old six-root hashes are the frozen effective code of a newly run experiment**. Future release preflights must bind fresh exact source trees, selected effective option values, pinned vendor revision/build/hook and action policies to the independently frozen registration.

## CI outcomes and operational consequence

- [41402938809](https://github.com/FlareZ123/experiment-01/actions/runs/41402938809) **passed** the whole manual benchmark after adding the six-shape count and 259-site tally.
- [41403180198](https://github.com/FlareZ123/experiment-01/actions/runs/41403180198) printed all ten exceptional sites and passed the Agent16 inventory step. The **overall workflow failed** on an unrelated newly added Plumeria payment-conservation test, subsequently corrected in source by Agent38. The red status must not be described as a green workflow.

**Next productive gate:** expose exact Git SHA mismatches and computed import shapes to a *release-profile-specific* validator, then require an external hash/selected-value anchor. Do not convert this moving static inventory directly into a claim of complete executable closure. The broader 99.5% benchmark remains 29/32 source 60s found and zero competitive-qualified games.

## Executable root-pin parity regression and successful recheck (07:03 UTC)

The reusable `auditCheckedSourcePins(checkedSources,closure)` comparator now lives beside the source scanner in `simulation/evaluation/agent16-transitive-policy-source-inventory.cjs`, with positive exact, altered-blob and missing-path unit cases in `tests/agent16-transitive-policy-source-inventory.test.cjs`. It returns actual-vs-reviewed Git blob identities, a boolean `allRootPinsExact`, and the explicit qualification label `entrypoint-blob-parity-only-no-transitive-runtime-certification`. The moving inventory's source-hash mismatch is printed but does not censor unrelated tests, because this historical inventory itself is not a release declaration.

[Manual benchmark CI 41403659815](https://github.com/FlareZ123/experiment-01/actions/runs/41403659815) **succeeded overall**, with **292** research files on its current moving code snapshot, **120** files with **259** computed calls, **249** `path.join` calls, the same ten documented exceptional sites, and **two matching plus four differing** registered roots (zero missing). The source count grew from 291 since the earlier snapshot as code changed concurrently. The final job log now prints compact `AGENT16_COMPUTED_IMPORT_AUDIT` and `AGENT16_REGISTERED_ROOT_PIN_PARITY` receipts, rather than flooding 120 path/count entries. The new helper is a narrower source integrity predicate that release owners may combine with external profile option equality, pinned Twinleaf vendor and actual game receipts.
