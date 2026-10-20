# Agent 50 preregistration: first actual finite-scored candidate root in historical rank6/rank11 arms

**Written 20 October 2026, before dispatching any first-finite-root compiled job.**

## Scientific question

The four authentic global-turn-3 candidate roots in the [previous compiled diagnostic](agent50-bilateral-fourarm-compiled-hidden-order.md) were insensitive to swapping unseen deck order, but **none called the generic tactic evaluator in either cloned world**. That negative result is non-discriminating about the known speculative-score information leak. This registration fixes a more causal selection rule before seeing any new action or scoring result:

> For each frozen real game, select the **first owner native `decodeNextAction` root at or after global turn 3** that actually completes at least one **finite-valued `evaluateAction`** call in the unchanged live common-policy bot. On that very root, compare two independent, detached reconstructed-prompt worlds differing solely by reversed order of the candidate's physically unseen deck, with the same independent policy RNG schedule. Preserve no-such-root as an observed outcome.

This is an exploratory hidden-order sensitivity test; **legitimate owner-known top order is not yet independently certified**. It cannot establish cheating solely from a reversal.

## Frozen game input and executable

- Four complete historical v1 developer-inspected arms, no new conditional source-success selection: `6:0:A:champion-reference`, `6:0:A:new-moon-lockbreaker-v1`, `11:2:B:champion-reference`, `11:2:B:new-moon-lockbreaker-v1`, their existing actual first turns, seeds, source deck printings and unchanged candidate 60s.
- Exactly one uninstrumented actual Store match plus one observational match per arm, same canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs` and `agent41-bilateral-common-policy.cjs`. Retain the previously observed rank6 New Moon 260-root zero-attack censor.
- Pinned Twinleaf upstream `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research-owned first-score observer `simulation/evaluation/agent50-bilateral-postgame-root-observer.cjs`, audit wrapper `simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs`, selection toggle `AGENT50_FIRST_FINITE_ROOT=true`.
- Manually dispatch **existing** `.github/workflows/twinleaf-hidden-information.yml` with `agent50_first_finite_root:true`. No per-commit workflow. The source-policy and Frozen 60s remain identical, the root-selection changes only the read-only observation timing.

## Acceptance, falsification and complete archive

The actual live bot's individual tactic `evaluateAction` methods are temporarily wrapped with a transparent `apply` call, original `this`, arguments and return value, and exact own-property descriptor restoration; no additional speculative scoring runs inside the live Store match. At the first call in each eligible candidate owner root, clone the actual pre-score complete State and bot options for after-game evaluation; retain this snapshot only if the original real scorer returns at least one finite numerical value. The original `decodeNextAction` action is always delivered unchanged to the Store. Only after completion, compare source order and reversed-hidden-order detached hypotheticals.

For each of all four arms archive: original source-deal fingerprint, actual starting player, exact Store root-action SHA, final public board, Prize/attack settlement and results for control and observed replays, the chosen genuine global turn, actual live scored-option attempts and finite count, fresh reconstructed action versus original actual action, two hypothetical generic tactic score summaries, and any capture/evaluation failure. Fail closed on a game mismatch, absent root, fresh-bot action mismatch, no finite cloned-world scores, or legal-knowledge ambiguity. Specific possible outcomes: genuine action reversal, unequal generic scores but same action, no scoring-sensitive difference at an actually scored root, no scored candidate root, or observer/control failure.

This **will not** certify competitive game wins, opponent competence, cross-matchup fairness, head-to-head superiority, paper Expanded legality, or a 25-minute tournament clock. It also cannot certify K0/K1 information sets without independent search/known-top-order history; I asked Agent21 to bridge that knowledge witness. Agent41 is owner of the canonical complete-game prospective gate and received a summary of the first four vacuous sampled roots.

Research objective status at registration: **29/32 exact field source lists, zero competitively qualified games, 99.5% not demonstrated.**
