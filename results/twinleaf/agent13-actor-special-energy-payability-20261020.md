# Actor-visible Expanded Energy matching: partial printed-cost solver

**Agent 13 | 20 October 2026 | pure helper and manual CI regression**

## Research question

Can the nascent common actor-only decision policy determine whether printed attacks are payable using publicly attached **Special Energy**, without inspecting concealed game zones or presuming every Special Energy provides one generic unit?

## Concrete finding

The new actor-only root slice at `simulation/twinleaf/agent34-actor-only-root-policy.cjs` currently counts **only Basic Energy printings** when matching attack costs. Consequently, a legal printed Energy configuration with one Psychic plus one Double Colorless and a printed `[P,C,C]` attack is classified as not payable by that heuristic. This is a static, source-code counterexample to the policy's completeness, **not** an observed real Store action error.

The reusable `simulation/twinleaf/actor-energy-payability.cjs` accepts the acting owner's already-visible attached Energy printings and public conditions. It returns a conservative tri-state printed payability (`true`, `false`, `null` for insufficiently modeled printings) and exposes exact bipartite matching over individual Energy units. No concealed deck order, opponent hand or face-down Prize identity is read. Because this module is currently pure and not wired to a root action selector, no new action, attack or game is claimed.

Tested card families from the supplied card-list database: nine Basic Energy types; Double Colorless; Double Dragon (Dragon-only); Prism (Basic-only rainbow else Colorless); Aurora; Rainbow; Legacy; Reversal (behind in Prizes, Evolution without Rule Box); Ignition (three Colorless if Evolution); and the three named Unit Energy printings. Special Energy printings in the database are **not exhaustive for this helper**; unsupported printings deliberately return unknown where their contribution may matter.

## Validation

The module has six deterministic `node:test` regressions in `tests/actor-energy-payability.test.cjs`: colored versus Colorless, exact flexible matching with backtracking, Double Dragon and Prism conditions, Reversal and Ignition condition switches, unknown-printing treatment and one-unit rainbow limits. Independent local Node checks also passed. The existing manual-only `aichi-opening-audit.yml` workflow now includes this regression.

**Compiled manual GitHub CI:** [39474677790](https://github.com/FlareZ123/experiment-01/actions/runs/39474677790), **success**, head `0d2128fc11fbf8fc8e56d577ccf0004f7a0c78d6`. This is a **pure test run**, not a Twinleaf game or a successful native Store decision.

## Integration gate

To use the helper in Agent 34's actor-only policy, derive `isBasic`, `isEvolution`, `isDragon` and `hasRuleBox` only from printed public Pokémon attributes; `behindOnPrizes` only from public counts. Require a **native accepted attack announcement and effect** after the new selector makes an attack choice. The pinned live Store must resolve all attack-cost changes, locks, Tools, Energy suppression and other contextual effects. Continue reporting native prompt fallbacks and censored games. Do not infer ability to attack from this helper alone.

This is a small dependency for the common two-player policy; it establishes no competitive-quality game and provides no evidence for the 99.5% target. The field source coverage and qualification status are unchanged.
