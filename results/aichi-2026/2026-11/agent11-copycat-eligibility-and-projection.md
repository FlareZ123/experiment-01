# Rank 1 Mimikyu Copycat: history gate and prompt support

## Finding

Mimikyu GRI 58's Copycat condition is temporal: it can use an opponent Pokémon's attack only when that Pokémon used a non-GX attack during the opponent's previous turn. The Rank 1 policy previously treated an attack currently printed on the opponent's Active as evidence of eligibility. That is not sufficient: the Active may have changed, and a currently available attack may not have been used last turn.

This was a policy correctness defect, not a demonstrated matchup result.

## Existing reusable history machinery

The repository already has the needed research-side history components:

- `simulation/twinleaf/copycat-multiattack-history.cjs` records attack actions and exposes previous-turn snapshots and Copycat choice sets.
- `simulation/twinleaf/agent7-copycat-history-root.cjs` attaches the previous-turn attack history, `opponentCopycatChoices`, and `mimikyuCopycatCompatible` to a public event receipt.
- `simulation/twinleaf/copycat-compat.cjs` contains a separate compatibility hook for copied-attack payloads that Twinleaf does not otherwise execute correctly.

The companion integration branch now connects this machinery in `simulation/evaluation/2026-11/agent36-v3-runner.cjs`: it installs `installCopycatMultiAttackHistory(store)` after the prompt-provenance hook, passes `attachPreviousOpponentTurnReceipt(view, state, actorSeat, tracker)` into the worker receipt provider, and restores both dispatch wrappers in reverse installation order. The tracker now records history only when the global turn counter advances; the receipt adapter also ignores snapshots that are invalid or not older than the acting state. This prevents setup-time active-player changes from being misrepresented as completed opponent turns.

## Changes on the Agent 11 research branch

Branch: `agent11/copycat-eligibility-and-prompt-v1-20261123`

- `agent6-rank1-shadow-rider-opponent-policy.cjs`: Copycat is enabled only by a turn-matched, tracker-certified `opponentCopycatChoices` set. The policy requires a non-GX, non-Mimikyu-Copycat attack and filters exact Trevenant & Dusknoir-GX Night Watch until its host-only effect path is supported.
- `agent49-policy-protocol.cjs`: public receipt validation distinguishes GX attacks and Mimikyu's own Copycat from other attacks marked `copycatAttack`. The latter flag is also used by distinct copied-attack effects; it is not, by itself, a paper-rule prohibition. Copycat prompt validation now requires a Mimikyu GRI source and public opponent-owned attack choices with explicit GX/copied-payload flags.
- `agent36-prompt-projection.cjs`: exact Mimikyu GRI Copycat prompts are projected only from actor-visible opponent cards. GX attacks, cloned copied-attack payloads, and the exact host-only Night Watch effect are excluded from the current worker choice set. The prompt fails closed if no supported attack remains.
- Regression tests cover the previous-turn condition, a changed opponent Active, absent history, Night Watch, unsupported cloned payloads, Mimikyu's own Copycat, public prompt choices, and dispatch decoding.

## Validation

Initial policy/protocol branch:
- Contract-only workflow run: [45276878443](https://github.com/FlareZ123/experiment-01/actions/runs/45276878443)
- Tested head: `8593fd1beeab48d052ddaf9e62f19aeb7bd7ebaf`
- Outcome: **success**.

V3 history-integration branch:
- Contract-only workflow run: [45279769272](https://github.com/FlareZ123/experiment-01/actions/runs/45279769272)
- Native no-game witness: [45279930384](https://github.com/FlareZ123/experiment-01/actions/runs/45279930384)
- Tested head for both: `2dfa873af139586e733edf8af726bc73db49fee3`
- Outcome: **both passed**.
- The no-game witness covered all four candidate/opponent physical-seat cells, created native stores, validated selected actions, observed no worker failures, restored the prompt-provenance hook and runtime pin guard, and left all original store states unchanged.
- The witness explicitly reports `gameExecuted: false` and `liveActionsDispatched: false`. It validates startup, receipt plumbing, and cleanup only; it does not prove that a Copycat attack was executed or measure any matchup.
- Reproducibility tuple from the no-game artifact: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; candidate printed-60 SHA-256 `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`; opponent printed-60 SHA-256 `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`; candidate policy SHA-256 `a4acf984f859f5fc216e92ccf307bdf6f8a52de61694ae83c643d6907c62a4a3`; opponent policy SHA-256 `240b204d2ff940a223fbdd9428225d8bf43a24bd548d9df946b25677bcf13644`. Coverage was `0:0`, `0:1`, `1:0`, and `1:1`.
- The first no-game witness attempt failed on a setup-transition snapshot (`snapshotTurn === state.turn`). The tracker/receipt guard described above fixed that failure; the successful rerun is the evidence for the fix.
- Agent49's accepted Stage-A branch was not modified. No registered fixture game was run from this branch.

## Required follow-through

1. Respect Agent 6's single-owner stopline: do not dispatch further V3 workflows or fixtures from this non-registered branch while the registered Stage-A trace is being resolved.
2. After the registered Stage-A root cause and ownership gate are resolved, have Agent49/Agent6 review and selectively integrate this branch. Rebase/cherry-pick carefully because the branch predates the current Underworld clone-validator work.
3. The remaining game-level test is a native sequence in which an opponent uses a non-GX attack, the Active changes, and Mimikyu's Copycat prompt is resolved from the recorded previous-opponent-turn source. Confirm the worker chooses only a receipt-certified, actor-visible prompt choice.
4. Keep copied-attack payloads and Night Watch disabled until their respective Twinleaf compatibility/host paths are actually installed and tested. Do not interpret those runtime filters as paper-rule restrictions.

No deck, opponent list, registered seed, seat assignment, or competitive claim changes as a result of this work.
