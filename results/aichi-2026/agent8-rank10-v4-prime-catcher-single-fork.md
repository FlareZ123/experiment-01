# Rank 10 current DDE-v4: one authentic turn-2 Prime Catcher counterfactual

**17 October 2026, Agent 8 invocation 202.** A compiled, source-dealt policy diagnostic comparing one action in otherwise identical current **DoubleDragonAttachTactic-v4** games. It establishes a real source-decision consequence for one seed and the same printed 60-card lists. This experiment **does not qualify any competitive games**.

## Reproducible evidence

- [Manual compiled Actions run 39045625881](https://github.com/FlareZ123/experiment-01/actions/runs/39045625881): **success**, source head **186eee76fd867a85a531d2c21890528292c5a76e**, manual workflow **aichi-dispatch-transcript.yml**. Existing pure regressions and targeted [one-action regression](../../tests/rank10-v4-turn2-prime-catcher-fork.test.cjs) passed; full workflow including legacy source replays passed.
- [Exact machine-readable source fork artifact 12105442619](https://github.com/FlareZ123/experiment-01/actions/runs/39045625881/artifacts/12105442619), artifact ZIP SHA-256 **0f183467dc8fde6f8f59c21cd4a39d4b332ccd324181bc66441d9e6bfcd9ff7a**. This is the observed output of the [source fork script](../../simulation/twinleaf/rank10-v4-turn2-prime-catcher-fork.cjs).
- Same fixed [published rank-10 Regidrago versus rank-1 Shadow Rider](full-decklists.json) printed 60s, frozen **decorrelated-slots-v3** seed **4246551499**, champion engine seat B, actually first to act (**firstTurnSlot: 1**), 350 root-action limit, isolated speculative policy RNG and listed research correction flags. Pinned simulator submodule **vendor/twinleaf** commit **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**.
- All three synchronous source games use **DDE-v4**: untouched control, a branch replacing only the first true bot-proposed Double Dragon Energy attachment by playing in-hand Prime Catcher, and untouched repeat. The wrapper restores its SimpleTacticsAi.decodeNextAction interception afterward.
- The repeat source action signature and final summary are **identical to the first control**. The branch's first changed real root dispatch is exactly **root step 15, turn 2**, the same physical pre-action source zones **44da22ce981bd7f6ec1ae08f202f0fb420a1007cb11c5fb2e9aa13c8f564bdd4**. Control root 15 plays **Double Dragon Energy ROS** from own hand index 0 to Active Regidrago V. Branch instead plays **Prime Catcher TEF** from index 2. After-action source zone digests differ; the branch returns to the ordinary DDE-v4 bot thereafter.

## Exact observed outcome

| Current-v4 source arm | First Regidrago Apex Dragon attack | Engine result | Global turns | Root actions | Remaining Prizes: Regidrago, champion |
| --- | --- | --- | ---: | ---: | --- |
| No override | Turn **14** | Regidrago wins | 16 | 169 | 0, 4 |
| Replace one turn-2 DDE action with Prime Catcher | Turn **8** | Regidrago wins | 16 | 170 | 0, 4 |

The override caused the opponent's attack transcript to include an additional **turn-8 Regidrago VSTAR Apex Dragon**. The branch's later recorded attacks include the same turn-12 Koraidon **Retribution Strike**, turn-14 **Apex Dragon**, and turn-16 **Apex Dragon** as the control. The champion's recorded attack names/turns in this source sample are unchanged: **Latias ex Eon Blade** on turns 7/9/11 and **Trevenant & Dusknoir-GX Night Watch** on turn 13. Both game results are completed and have the same winner, turn count and remaining Prize counts. This demonstrates that swapping one early action modifies tempo/attack opportunities without changing this particular completed engine result.

## Interpretation and limitations

The comparison is narrower than the earlier [DDE disabled versus DDE-v4 trajectory differential](agent8-rank10-dde-v4-trajectory-differential.md), where whole-policy suppression changed the 65-turn game to 16 turns. Here the **same v4 policy** governs both arms, and only one source-decision is replaced. Neither experiment is a fair random sample of possible decisions or a certified paper Expanded competitive game.

The artifact does **not** attest that the first substituted action is the optimal Prime Catcher target or that the opponent responds competently. The target enum itself is an input, not a validated strategic rationale. The source action prefix, live root zone identity and deterministic repeat are verified, while full game-State/closure graph fidelity, cloned simulator fairness, all paper card effects, hidden-information safe bot policy, both actual starting orders, new seeds and independent playing-policy review remain open. The result is diagnostic of one controlled action and one engine outcome only.

**Human-facing qualification:** **sourceReplayMechanicsVerified:false**, **qualifiedForCompetitiveInference:false**; the field's status stays **29/32 exact full lists, zero qualified competitive games, zero established 99.5% win-rate support**.

The strategic next step is to inspect the **first source-dependent follow-up** after Prime Catcher, including the player's own available alternative actions and the opponent's plausible response. A turn-8 Apex with the same terminal outcome is not proof that early Prime Catcher improves overall game-winning chances.
