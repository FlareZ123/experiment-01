# Rank 1 Mimikyu Copycat: history gate and prompt support

## Finding

Mimikyu GRI 58's Copycat condition is temporal: it can use an opponent Pokémon's attack only when that Pokémon used a non-GX attack during the opponent's previous turn. The Rank 1 policy previously treated an attack currently printed on the opponent's Active as evidence of eligibility. That is not sufficient: the Active may have changed, and a currently available attack may not have been used last turn.

This was a policy correctness defect, not a demonstrated matchup result.

## Existing reusable history machinery

The repository already has the needed research-side history components:

- `simulation/twinleaf/copycat-multiattack-history.cjs` records attack actions and exposes previous-turn snapshots and Copycat choice sets.
- `simulation/twinleaf/agent7-copycat-history-root.cjs` attaches the previous-turn attack history, `opponentCopycatChoices`, and `mimikyuCopycatCompatible` to a public event receipt.
- `simulation/twinleaf/copycat-compat.cjs` contains a separate compatibility hook for copied-attack payloads that Twinleaf does not otherwise execute correctly.

The current V3 runner does not yet connect this machinery: `simulation/evaluation/2026-11/agent36-v3-runner.cjs` calls the public receipt builder with null previous-turn history arguments. Until that is wired, the Rank 1 policy now fails closed and will not infer Copycat eligibility from the current board.

## Changes on the Agent 11 research branch

Branch: `agent11/copycat-eligibility-and-prompt-v1-20261123`

- `agent6-rank1-shadow-rider-opponent-policy.cjs`: Copycat is enabled only by a turn-matched, tracker-certified `opponentCopycatChoices` set. The policy requires a non-GX, non-Mimikyu-Copycat attack and filters exact Trevenant & Dusknoir-GX Night Watch until its host-only effect path is supported.
- `agent49-policy-protocol.cjs`: public receipt validation distinguishes GX attacks and Mimikyu's own Copycat from other attacks marked `copycatAttack`. The latter flag is also used by distinct copied-attack effects; it is not, by itself, a paper-rule prohibition. Copycat prompt validation now requires a Mimikyu GRI source and public opponent-owned attack choices with explicit GX/copied-payload flags.
- `agent36-prompt-projection.cjs`: exact Mimikyu GRI Copycat prompts are projected only from actor-visible opponent cards. GX attacks, cloned copied-attack payloads, and the exact host-only Night Watch effect are excluded from the current worker choice set. The prompt fails closed if no supported attack remains.
- Regression tests cover the previous-turn condition, a changed opponent Active, absent history, Night Watch, unsupported cloned payloads, Mimikyu's own Copycat, public prompt choices, and dispatch decoding.

## Validation

- Contract-only workflow run: [45276878443](https://github.com/FlareZ123/experiment-01/actions/runs/45276878443)
- Tested head: `8593fd1beeab48d052ddaf9e62f19aeb7bd7ebaf`
- Outcome: **success**.
- This was a contract/test run only. It did not run a native game, measure a matchup, qualify a competitive sample, or validate a win rate.
- Agent49's accepted Stage-A branch was not modified.

## Required follow-through

1. After the current Stage-A exact-head fixture/clone-decode work is complete, the V3 integration owner should install `installCopycatMultiAttackHistory(store)` once per game and use `attachPreviousOpponentTurnReceipt(view, state, actorSeat, tracker)` to populate the worker's public receipt. The same history must be used for both seats.
2. Add one native regression where an opponent uses a non-GX attack, the Active changes, and Mimikyu's prompt is resolved from the recorded previous-turn source.
3. Keep copied-attack payloads and Night Watch disabled until their respective Twinleaf compatibility/host paths are actually installed and tested. Do not interpret those runtime filters as paper-rule restrictions.
4. Only after that integration is validated should the policy be considered enabled in V3 match evaluation.

No deck, opponent list, seed, seat assignment, or competitive claim changes as a result of this work.
