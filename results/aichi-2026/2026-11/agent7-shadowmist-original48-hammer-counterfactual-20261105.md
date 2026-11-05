# Agent 7: same-deal original eight-arm Shadow Mist → Crushing Hammer after-Pass counterfactual

**5 November 2026. Development-only pinned native Store A/B, first successful run 42073888681, frozen 48-root cap, no qualified paper-game outcome.**

## Registered source and treatment

The historical [Agent36 steward-selected v4 eight-arm profile](../../../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs) is used without modifying any printed original Aichi source deck or candidate printed 60. Original eight IDs, source physical seat and initial physical game-state deal, frozen random seeds, original policy wrappers, and the 48-root cap are identical between same-trial control/treatment. Only the existing **two-seat generic `agent29-both-seat-hammer-after-pass-v1` root** is selected in the treatment. This is the already-existing [Agent29 owner-visible Hammer adapter](../../../simulation/twinleaf/agent29-actor-hammer-after-pass.cjs), which offers a source-held Hammer when the otherwise selected native root action is `PassTurnAction`, the public opponent has attached Energy and native card eligibility is positive. The original control remains fully identical to the previously published v4.

This after-Pass change is intentionally **not a strong adversarial opponent policy**. It does not weigh conserving a Hammer, extending a soft lock, selecting a future target strategically or competing with a prior non-Pass root.

The execution [runner](../../../simulation/evaluation/agent7-shadowmist-original48-hammer-aba.cjs) toggles only the documented experimental `AGENT29_HAMMER_AFTER_PASS_DEV` flag around the same v4 executor, restores its prior value even on failure, and checks every original game ID, source-deal fingerprint, complete physical-deal fingerprint, and actual original first-player seat. It compares original native accepted Store roots to find the first divergent root for each trial. Read-only controls verify the same-deal invariant and failure behavior.

## Reproducible successful native observation

[Manual CI run 42073888681](https://github.com/FlareZ123/experiment-01/actions/runs/42073888681) completed **successfully** from code HEAD `4240ade2aeb2ace786d5d5f35658b7ae8b3132c3`; pinned engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its `abort-custody` job log's `AGENT7_SHADOWMIST_HAMMER_ORIGINAL_AB` marker is a complete structured independent run receipt.

The specific prior-source opportunity was demonstrated in [Agent7's native owner-held Hammer Pass audit](agent7-shadowmist-crushing-hammer-native-pass-20261105.md): trial `6:100:A:champion-reference`, original Iron Thorns source physical seat1, source deal SHA256 `700f0f6e1fa884906c79cf2275741f036d212428fae01c8f2c132dc9ada086b2`. In the original 48-root control, the candidate declared **Shadow Mist** on global turn6 and the source then `PassTurnAction` on turn7, root ordinal **36**. An authentic source-owner observation established that at the Pass, the source held one **Crushing Hammer POR**, opponent had one attached Energy, native card `canPlay` was true, and Item lock was absent.

The counterfactual A/B found the **first different public Store root at exactly ordinal 36**, original source seat1, global turn7:

| Exact same original physical game before decision | Control | After-Pass Hammer treatment |
| --- | --- | --- |
| Source selected action at root 36 | `PassTurnAction` | **`PlayCardAction`** |
| Source card | None | **Crushing Hammer** |
| Source position | seat1, turn7 | seat1, turn7 |
| Authentic source starting deal | identical | identical |
| Original maximum accepted roots | 48 | 48 |
| Final native status | `returned-unqualified`, capped | `returned-unqualified`, capped |
| Native paper-qualified game result | None | None |

The other seven historical trial pairs retained their *entire* native public root action sequence through original cap or original engine failure; none changed. Of the eight matched originals, six attempts per branch reached 48 roots without terminal status and two rank11 source trials produced the same prior engine errors at 25 and 14 roots. No member of this retrospective comparison is admitted as a competitively qualified game.

The **native Store-accepted Hammer root** is stronger than a mere `card.canPlay` positive: the actor submitted an actual physical `PlayCardAction` in the original game, and execution continued afterward. This initial receipt does not yet quantify the coin result, effect settlement, attached Energy movement, or an opposing paid attack. For those, separately inspect original subsequent prompt ownership and attached-Energy card identities; the native root can be accepted while a coin toss fails. Native success on a historical one-deal branch also cannot establish that selecting the Hammer is optimal.

## Release significance

The source's original **Pass at turn7 was a playable decision-policy omission** under the physical Store's actual available card/action options. The simulator's existing owner-visible policy can fill that gap without modifying the original first 36 Store actions, source deck or deal. This is a concrete reason to **reject repeated passive Shadow Mist lock Passes as evidence of competitive opponent strength**. The unchanged rank1 reference deck's performance must eventually be measured against stronger source responses and a legal 25-minute full-game policy.

The result is research-development evidence. Opponent ranking, 32-field win probability, causal efficacy of Hammer and the extreme 99.5% deck objective remain **unproven**. Original three missing Aichi ranked 60s (23, 25, 28) remain unresolved.
