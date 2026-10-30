# Rank-20 24-pair forensic replay: mandatory Energy prompt aborts recovered under a narrow bot-only correction

**Agent 47 | 30 October 2026 | compiled pinned Store | retrospective diagnostic, no competitive qualification.**

## Original control and intervention boundary

The [original registered rank20 Apex-discard natural-deal experiment](agent47-source20-original-24pair-apex-opportunity-20261030.md)
attempted **24 control / 24 treatment Store executions** at exact source
rank 20 vs original ranks 1 and 11, source physical seats 0 and 1,
six seeds **1847000101 through 1847000106**, maximum 160 native
actions per execution. Its own results remain unmodified:
**22/24 intact pairs** and **two pairs aborted in both arms** because
the generic bot gave a one-card assignment to mandatory 2/3-Energy
`AttachEnergyPrompt`. The original 22 intact pairs had
zero opted-in Apex discard proposals and identical control/treatment
observable digests.

This *post-hoc separate replay* keeps those exact original source
60s, seeds, source seats, attack/prompt horizon and both Apex-discard
flags. The single new independent condition is an **identical, symmetric,
research-owned, opt-in correction of a bounded prompt resolver error
for both simulated players in both arms**. It does not train a policy,
use privileged hidden state in the actor chooser, or demonstrate any
competitive advantage. It also does not fix the separate Celestial
Roar paper-effect discrepancies reported
[here](agent47-celestial-roar-native-paper-fidelity-20261030.md).

- Code: [reversible native minimum-attacher](../../simulation/twinleaf/agent47-minimum-attach-energy-hook.cjs),
  [exact original 24-pair replay](../../simulation/twinleaf/agent47-rank20-minrepair-replay.cjs),
  [unit regressions](../../tests/agent47-minimum-attach-energy-hook.test.cjs).
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Successful manual native compiled [CI run 41132176247](https://github.com/FlareZ123/experiment-01/actions/runs/41132176247),
  head `2a5458a5d7679d44453d0230ba6c65a5ec6961bb`.
- Full raw [artifact 13014635335](https://github.com/FlareZ123/experiment-01/actions/runs/41132176247/artifacts/13014635335);
  ZIP SHA-256 `3023eff6bb45f3e50d21fb40576d15754f66dc356f579f7fcdd59bc3f3aee6e4`.

## Exact failure-inclusive comparison

| Observed execution property | Original native 48 runs | Corrected separate replay 48 runs |
| --- | ---: | ---: |
| Registered source-deal pairs | 24 | 24 |
| Pair-complete native return | 22 | **24** |
| Paired aborts | **2** | **0** |
| Executions returned without native exception | 44 | **48** |
| Engine-terminal pairs | 6 | **7** |
| 160-action-capped pairs | 16 | **17** |
| Same-deal source hashes verified | 22 | **24** |
| Identical control/treatment observable digests | 22 | **24** |
| Natural Apex-discard alternative proposals | 0 | **0** |
| Competitively qualified games | **0** | **0** |

Both originally aborted configurations now return for **both arms**:

- Original rank11, seed **1847000101**, rank20 seat **1**,
  originally prompt **38** `min=max=3`: new pair settles
  at **143 native actions** and reaches an engine terminal.
- Original rank11, seed **1847000105**, rank20 seat **1**,
  originally prompt **76** `min=max=2`: new pair returns
  at the **160-action cap**.

The new adapter logged **eight proposed corrections** and
**zero unsupported under-minimum repair proposals** across the 48-run
replay. This count includes possible speculative resolver invocations;
it **does not establish eight actual Store-accepted repaired actions**.
The definitive observation is that the four previously
abortive native game executions returned, and every paired
source-deal hash and observable digest matched.

## Pinned defect and intervention limits

In the pinned
[`AttachEnergyPromptResolver.getPromptResult`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts),
the native bot scores each attachment prefix length from 1 through
`max` but fails to exclude prefixes shorter than
`options.min`. In the
[native prompt validator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/attach-energy-prompt.ts),
those under-minimum selections are invalid.

The opt-in hook retains the native bot's original one-card selection and
its physical recipient. When the mandatory minimum is exactly two or
three, the recipient is physically owner-authenticated, and neither
distinct-target, distinct-type nor per-type-cap options demand a more
complex allocation, it appends additional **distinct eligible physical
Energy cards** to reach the minimum. It then requires pinned
`AttachEnergyPrompt.validate` and the independent owner-target
geometry check to pass. Otherwise it leaves the native result unchanged.
It restores the native resolver prototype after the synchronous trial.

The first compiled replay
[CI 41131068279](https://github.com/FlareZ123/experiment-01/actions/runs/41131068279)
succeeded but did **not** correct either abort because the research hook
mistakenly expected `prompt.filter` to be a function. In the pinned
Store it is an **object `FilterType`**, used by
`CardList.filter`. That first forensic replay recorded
`proposedCorrections:0, unsupported:8` and retained both abort
pairs. The hook was corrected to use `prompt.cardList.filter`,
a dedicated native-shaped filter-object test was committed, and the
separate final replay above genuinely completed all 24 pairs.
The earlier negative replay is preserved by
[CI and artifact 13013232914](https://github.com/FlareZ123/experiment-01/actions/runs/41131068279/artifacts/13013232914).

This is a legitimate native execution-coverage repair under a narrowly
scripted, weak two-seat bot. It does **not** qualify the bot for competitive
decisions, validate the game's full paper rules, demonstrate an improved
win rate, resolve three missing published opponent lists, or select
a final strongest fixed 60. The two actions in a previously
aborted configuration may still conceal different rules-fidelity errors.
In particular, source Regidrago V Celestial Roar can mis-handle Special
Energy and lose physical cards in the temporary source list. Those
need their own invariant checks before results are promoted.

**Benchmark remains 29/32 authenticated original sixties and
zero competitively qualified games.**
