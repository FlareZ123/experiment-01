# Preregistered source-rank-2 Tool-aware opponent pilot

**Agent 23, 18 October 2026.** This registration predates inspecting the run results.

The existing manually dispatched `aichi-first-game.yml` was requested with rank `2`, `tool_attack_awareness=true`, `tool_attack_opponent_only=true`, `bunnelby_source_k0=true`, fixed-core policy, and existing decorrelated-slot-v3 seeds. The campaign schedule includes four frozen candidate inventories in two physical engine seats, eight diagnostic source-dealt trials total (one repeat), bounded by the workflow's default 600 actions. The opponent is the printed Aichi rank-2 Vileplume Control source 60, with two Technical Machine: Evolution.

**Predeclared check:** Confirm the code and returned trial summaries represent the same pinned engine, printed opponent deck identity, seed protocol, physical seat, and `ToolAttackEnumerate-v1@seatN` label on the opponent only. Determine if any genuine opponent Tool-attack `Evolution` declarations occur, resolving available prompt/turn context if possible. Count every scheduled trial including engine exceptions, unfinished games, no opportunity, and missing records. Do not infer the number of opportunities merely from absence of attack declarations. Source card availability, Tool attachment and attack costs require additional state examination.

Prior generic-bot source-ranked outcomes are diagnostic history; they may differ in engine and policy flags and cannot silently serve as a controlled baseline. If the rank-2 run succeeds, compare identical seeds, source prints and other flags with a true same-head control in a later explicit experiment. No terminal winner here can establish competitive performance, and no 99.5% field claim follows.

## Pilot observation and prospective control criterion (recorded before control dispatch)

[Manual CI 39148318858](https://github.com/FlareZ123/experiment-01/actions/runs/39148318858) **passed** with all eight scheduled rank-2 trials reported as `completed-engine-game`. The original archived artifact `aichi-campaign-diagnostic` retains trial hashes, policy flags, action ledger and attack declarations. Exactly **one of eight** had a logged source-opponent attack named `Evolution`: `pilot:2:0:hood-shield-v1:B`, opponent physical seat 0, global turn 15, root action ordinal 100. Other trials had zero observed declarations of that name. The run does not establish that no such attack was available on the other seven trajectories. In addition, the independent Bunnelby K0 tactic was active in all games and takes precedence over the new generic Tool enumerator, so the observed `Evolution` attack **cannot yet be causally attributed to the new seat-specific flag**.

A matched baseline is therefore warranted. Before dispatching it, the comparison criterion is: hold rank, fixed candidate list, seed/seat schedule v3, source print mappings, Bunnelby K0, gameplay fidelity flags and action budget constant; disable only the Tool-aware opponent policy. Compare all eight scheduled trial identifiers (shared-seed candidate arms are correlated), engine-reported deck hashes, actual starting orders, action counts, `Evolution` declarations and first differing chosen action if a replayable ledger permits. Specifically check whether the Hood-B Evolution event persists. Record unchanged branches and no observed Tool-use branches as negative evidence. Different GitHub documentation-only commits must be disclosed but cannot be presumed to affect gameplay. Neither branch is qualified competitive performance.

## Matched-control result

**Observed after preregistration:** Control [CI 39148689719](https://github.com/FlareZ123/experiment-01/actions/runs/39148689719) **passed**, with archived diagnostic artifact 12144980112. Tool-enabled [CI 39148318858](https://github.com/FlareZ123/experiment-01/actions/runs/39148318858) artifact 12144785413 also passed. ZIP SHA256: enabled `cd4f0733c82acfb7901f8affdf25b7b8bf646710eac33f073eb8b543488e8078`, control `f40f21fdc25c577aab5d811e20050d64b8b3916847a8baef3c9fc392db2fcfa9`.

Both archives have eight `completed-engine-game` statuses, exactly the same planDigest, seed protocol `decorrelated-slots-v3`, ordered printed deck hashes, actual starting order, and engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Every matched pair has equal full `rootActionLedgerSha256`, `chronologicalActionTraceSha256`, complete attack-declaration arrays, final board summaries, action counts and recorded engine winner. All eight ledgers claim complete Store-dispatch coverage. Across the eight correlated scheduled trials there were 2,441 root actions and 1,076 recorded meaningful actions per arm. Exactly one source-opponent `Evolution` declaration appeared **in both arms**, at the same rank-2 Hood-B root action 100, immediately after attaching the TM at root 99.

| Candidate | Physical candidate seat | Actual candidate start | Root actions per arm | Source `Evolution` declarations per arm |
| --- | --- | --- | ---: | ---: |
| Champion reference | A | First | 250 | 0 |
| Champion reference | B | Second | 269 | 0 |
| Hood Shield | A | First | 274 | 0 |
| Hood Shield | B | Second | 314 | 1 |
| Temple | A | First | 393 | 0 |
| Temple | B | Second | 450 | 0 |
| New Moon | A | First | 42 | 0 |
| New Moon | B | Second | 449 | 0 |

**Result:** enabling the generic opponent-only Tool enumerator adds no observed action or outcome change to these eight source rank-2 diagnostic games when the existing Bunnelby source-K0 tactic already runs. This is a narrow **negative differential**, not evidence that the Tool adapter has no value against rank 26 or without the Bunnelby-specialized policy. The one TM declaration's prompt chain includes ChoosePokemon, two ChooseCards, ShuffleDeck, Wait and Confirm; effects and paper legality are not independently certified.

The two CI runs used different full research commit SHAs (`6a774c94` vs `2a77abd0`). A GitHub compare of those commits found no changes to headless runner, Tool adapter, campaign executor, field manifests, or candidate lists. Among documentation/identity changes it found removal of an unrelated unused `stone-owner-search-target.cjs` helper. Do not conceal this environment qualification. Since all recorded root action logs match, this paired test is a reproducible **no-action-difference** observation, not a competitive-strength statistic.
