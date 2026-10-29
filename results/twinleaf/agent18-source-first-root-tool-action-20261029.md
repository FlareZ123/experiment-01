# Source-original first-root Tool actions missing from restricted actor chooser

**Agent 18, 29 October 2026.** Mechanically confirmed two **first-turn native Pokémon Tool placements** from the player's actual original card hand in fully published Aichi original 60-card source games, while the detached owner-only first-return policy proposed **Pass**. This establishes a concrete **action-coverage deficiency**, with no competitive win-rate or optimal-play inference.

## Question, controls and evidence

The [six-source-rank original K0 report](agent18-aichi-six-rank-source-k0-survey-20261029.md) found native action class `PlayCardAction` for two original first-owner roots where the restricted actor-only chooser returned `pass` (rank2 Vileplume Control and rank10 Regidrago). The independent [all-29 follow-up](agent18-remaining23-aichi-original-source-k0-20261029.md) found nine such class mismatches, but proposed-action class alone cannot prove an alternative actually executes.

The [native first-dispatch registration](../../agents/agent18/20261029-native-first-root-dispatch-protocol.md) and narrower [physical-Tool-target preregistration](../../agents/agent18/20261029-native-first-root-tool-placement-protocol.md) tested those two source positions without changing the actual native policy. [`simulation/twinleaf/agent18-aichi-source-k0-native-root.cjs`](../../simulation/twinleaf/agent18-aichi-source-k0-native-root.cjs) records the actual native bot's **first returned action object** with a `WeakMap` at the real owner-root and intercepts the subsequent exact same `Store.dispatch(action)`. It records original owner hand printing by index and confirms the specific physical card object leaves that hand and enters a native Active/Bench `tools` array, preserving exact object identity and recording the target. It leaves native decisions and native state unchanged.

- Original exact **rank1 Shadow Rider** source 60 physical A versus the exact original **rank2 Vileplume Control** or **rank10 Regidrago** source 60 physical B, fixed seed `4246551499`, capped at 48 genuine Store actions, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Each arm runs unobserved and with the passive K0 owner observer, requiring the original source-game outcome digest fields match, the initial hidden deck/face-down Prize exchange leave actor-only proposal unchanged, and the objects be restored before the bot runs.
- The native decoder is called only once per actual decision. Both seat-1 printed-Tool actions and every other first-root action must be accepted by actual Store, with any native rejection treated as test failure. `Tools` are considered physically attached only if the **same original hand card object** appears in a Pokémon's attached Tool array after dispatch.

## Compiled native outcomes

| Exact source opponent | Owner first-root proposal | Original native bot first card | Actual native Store result |
| --- | --- | --- | --- |
| Rank 2, Vileplume Control | **Pass** | **Stealthy Hood UNB** | Original Tool card left hand and attached to the owner's **Active Pokémon** |
| Rank 10, Regidrago | **Pass** | **Muscle Band XY** | Original Tool card left hand and attached to the owner's **Benched Pokémon at index 3** |

[Manual CI run **40973899262**](https://github.com/FlareZ123/experiment-01/actions/runs/40973899262), artifact [12941936650](https://github.com/FlareZ123/experiment-01/actions/runs/40973899262/artifacts/12941936650), first established that **all twelve** native first-root action objects in the six fixed source pairings were actually submitted and accepted by Store, and the two Tool printings left their owner's hand.

[Manual full compiled CI **40974472428**](https://github.com/FlareZ123/experiment-01/actions/runs/40974472428), artifact [**12941329024**](https://github.com/FlareZ123/experiment-01/actions/runs/40974472428/artifacts/12941329024), then passed **all six** registered source matches with exact native Tool object targets. The source rank2 physical receipt specifies `{slot:'active',index:0,printing:'Stealthy Hood UNB'}`; rank10 specifies `{slot:'bench',index:3,printing:'Muscle Band XY'}`. This is substantially stronger than a class-only `PlayCardAction` record.

Other compiled first actions from the same six source matches were `Speed Lightning Energy RCL` in ranks6,24,29 (original native hand count increased from 7 to 8 after attachment/draw) and `Latias ex SSP` in rank11 (native occupied Bench count increased from 2 to 3). Across all six original champion physical-A first roots, original bot's first accepted card was `Psychic Energy MEE`, aligning with the actor-only basic Energy attachment kind. Native action class alone does not imply these exact physical transitions, so the object and zone evidence matters.

## Consequences for a stronger common decision system

The actor-only policy currently has specific paths for several Tool situations but **no sufficiently general, state-aware Pokémon Tool attachment affordance for these two authentic opening States**. A new owner-only candidate generator can use public printed card metadata, a legitimately known hand, the owner-visible free Tool slots, Tool-play locks, and actual native Store proof of target legality. It should compare Tool opportunity cost with Bench/Active development, Supporter use, search options and future high-value Tool commitment before ranking or executing candidates.

The rank2 Active Stealthy Hood placement is particularly informative to the shared lock-engine policy program because Tool protections can interact with Ability locks. This experiment has **not** measured whether the Hood altered a later lock state, whether the Tool target was optimal, or what alternative source setup line would outperform it. The rank10 Muscle Band likewise establishes legal physical attachment in one source opening, without determining if the native bot chose the strongest source action.

**Important limitations:** genuine original-source prefix, two exact printed-source states, one deterministic seed, 48-action cap, original bot not privacy/competence-certified. This proves **native action availability in two states**, with exact physical receiver, not their tactical superiority or any full-field performance. The full Aichi competitive benchmark remains **zero qualified games**, and original exact opponent lists 23,25,28 remain unavailable.
