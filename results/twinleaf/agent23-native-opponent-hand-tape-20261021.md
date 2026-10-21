# Parity-bound opponent hidden-hand contrast at four authentic historical owner roots

**Agent 23 | 21 October 2026 UTC | evidence: native Store development decisions, one conditional concealed-world exchange per trial.** This is a fail-closed decision-policy diagnostic. It is neither a prospective game sample nor a source-competent strength test.

## Question

Can the current full bilateral policy select a different action at one authentic, physically dealt owner decision if one card in the opponent's unobserved hand is exchanged with one in that opponent's unobserved deck, without changing the acting player's current public/owned observation or the opponent's complete hidden-card multiset?

The earlier Agent23 synthetic rank-11 full-bot experiment found 4/6 selected-action reversals under sharply different concealed four-card hands. Its staged policy worlds lacked authentic root, historical reveal and full native-tape parity. The archived genuine postgame comparison also failed to establish same-world native action parity. This test closes that particular prerequisite for the four selected historical owner roots, preserving negative outcomes. It does not adjudicate the prior staged 4/6 result.

## Exact intervention and provenance

- Pinned engine: Twinleaf submodule `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Research checkout: commit `5dfd23cac2ce4997262b86fbe842af8bc4208185` at manual workflow dispatch, using the existing frozen `simulation/evaluation/agent41-bilateral-v2-development.cjs` rank-6 / rank-11 four-arm schedule. These historical candidate-first trials were selected in earlier investigations.
- Runner: `simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs` with `AGENT23_NATIVE_OPPONENT_HAND_TAPE=true` and `AGENT50_NATIVE_TAPE_SAME_WORLD=true`. The other Agent50 hidden-deck and first-finite flags were false. No competitive-match run was initiated.
- Canonical hook: `simulation/evaluation/agent50-bilateral-postgame-root-observer.cjs`. It observes one chosen native owner action and its real RNG draws, then waits until **after** the live game to construct detached alternative worlds.
- New function: `simulation/twinleaf/native-tape-opponent-hidden-hand-contrast.cjs`; negative-control tests: `tests/native-tape-opponent-hidden-hand-contrast.test.cjs`. One deterministic distinct-printing hand/deck swap per authentic root reuses `chooseHiddenHandDeckSwap` from the prior Agent23 observer.
- [Manual compiled CI 39672423781](https://github.com/FlareZ123/experiment-01/actions/runs/39672423781), **success**. [Complete four-arm JSON artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39672423781/artifacts/12380098382), ZIP SHA-256 `c10f363c2dc7011c54963260c001514d43c1c3e104a5da5bcaabdea3118b4814`.

Each contrast requires a successful **same physical State and same RNG tape** replay of the selected original policy action before examining an altered concealed hand. It proves matching physical-root fingerprints, precise policy callback identity, RNG tape digest and consumption, selected action, original source-State nonmutation, hidden-card multiset preservation and current actor-observation equality. Alternative replay RNG exhaustion, lack of a distinct-printing swap, stale physical State and inconsistent callback are explicit vetoes.

## Compiled outcome: four tested roots, zero changes in selected actions

| Historical trial ID | Original full-game playback | Native same-world action parity | Alternate hidden-hand replay | Selected-action difference |
| --- | --- | --- | --- | --- |
| `6:0:A:champion-reference` | Same, authenticated | Passed | Executed, current actor view equal | **No** |
| `6:0:A:new-moon-lockbreaker-v1` | Same, authenticated | Passed | Executed, current actor view equal | **No** |
| `11:2:B:champion-reference` | Same, authenticated | Passed | Executed, current actor view equal | **No** |
| `11:2:B:new-moon-lockbreaker-v1` | Same, authenticated | Passed | Executed, current actor view equal | **No** |

The original independent gate printed `AUTHENTIC_NATIVE_CONTROLS {"authenticatedTrials":4,"competitiveGames":0}`. The six new fail-closed pure tests passed (**6/6**); the retained adjacent existing native policy test suite also passed (**152/152**). Each historical arm printed `conditional-tape-opponent-hidden-hand-no-action-change` with `samePlayback=true`, `noninterference=true`, `baseline=true`, `opponentHandContrastExecutable=true`, and `opponentHandFlip=false`. The tests were compiled and executed against the pinned vendor rather than merely syntax-checked.

## Interpretation and boundaries

This rejects one narrowly defined action-reversal hypothesis at each **retrospectively selected** physical decision root and under each specified conditional exchange. It does not show the raw bot is information-set-safe. In particular, the single first cross-category hand/deck exchange can be inconsequential to the chosen action, and no full search of counterfactual hidden partitions was run. The test only compares the **next selected native action**, not the quality of that action or a complete second game. Native early decisions may lack meaningful alternative attacks even if later roots are sensitive.

The owner K0/K1 search history, historical opponent hand reveals and any known upcoming deck cards were **not** independently authenticated. Present actor-observation equality is a necessary but weaker condition than historical information-set equality. All conditional classifications therefore retain `informationSetLeakQualified:false`. This experiment does not alter the real physical deal, real policy, source policy, policy clock, decks, first player, live decisions or outcomes. It reports **zero competitively qualified games**, no validated win-rate improvement and no evidence for the 99.5% target.

## Reproducibility and next discriminating test

To reproduce, manually dispatch existing `.github/workflows/twinleaf-hidden-information.yml` on the cited head with `agent23_native_opponent_hand_tape=true`. The job compiles the pinned server, runs existing native reconstruction tests and the six new unit tests, executes all four historical controls, checks original full-game noninterference, emits one row per trial, and archives complete JSON including explicit vetoes.

A higher-value next test would use one **authenticated first consequential finite-scored owner action** under the same full-policy parity gate, so alternative concealed identities can plausibly affect attack choice. Prefer the already shared Agent50 first-finite root observer rather than a new game campaign. Preserve failed parity and all unchanged arms. Ultimately the project needs owner-safe *both-player* policies, including sound prompt decisions and source recovery, before drawing matchup-strength conclusions.
