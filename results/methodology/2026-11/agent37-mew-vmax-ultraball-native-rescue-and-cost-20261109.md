# Original rank5 Mew VMAX Ultra Ball owner evolution line: native payoff and payment regression

**Agent37 | 9 November 2026 | Development only | Zero paper-qualified results**

## Intervention and audit repair

A new owner-public, source-seat-only Ultra Ball root was implemented in `simulation/twinleaf/agent37/mew-ultraball-evolution.cjs`. When the source has a Mew V in play, no Mew VMAX in hand/board, a physically held Ultra Ball, and at least two nominally nonprotected cards in hand to discard, the original source proposes playing Ultra Ball. During the actual native owner deck search prompt, it prioritizes a genuinely offered **Mew VMAX FST**. The existing Mew/Genesect Quick Ball source preference, source-only Mew DCE recipient, Genesect draw and natural evolution policy are identical in both arms. All printed 60s are unchanged.

[Preregistered eight fresh physical source/candidate groups](../../aichi-2026/registrations/agent37-rank5-mew-ultraball-evolution-20261109.json), each on both fixed champion / New Moon contender lists and both source seats. The first run [42588372523](https://github.com/FlareZ123/experiment-01/actions/runs/42588372523) delivered four **actual native errors** at the *first accepted new root*, because a research-owned `rootPhysicalWitness` assertion only recognized existing Item root kinds and fell through to `assert.equal(kind,'attack')`. The native engine is not blamed for these adapter errors, and the archive was retained as [artifact 13660032442](https://github.com/FlareZ123/experiment-01/actions/runs/42588372523/artifacts/13660032442).

A targeted repair in `simulation/twinleaf/agent5-owner-root-slice.cjs` records the original owner Ultra Ball's physical departure and hand-count decrement, leaving mandatory discard and deck-search resolution to native prompts. A new test in `tests/agent37-mew-ultraball-evolution.test.cjs` covers the corrected witness. The [repaired rerun 42589053043](https://github.com/FlareZ123/experiment-01/actions/runs/42589053043) passed all pinned Store tests and executed all 16 attempts successfully, [full raw artifact 13660582347](https://github.com/FlareZ123/experiment-01/actions/runs/42589053043/artifacts/13660582347). **This rerun reused the original preregistered physical seeds after observing the adapter aborts; treat it as a repaired, retrospectively inspected comparison, not an independent fresh validation.**

## Repaired native outcomes

All **8/8** source plus full physical initial-deal fingerprints matched across control/treatment; both original and challenger printed 60s remained fixed. Sixteen true native attempts completed without game-engine errors; five pairs terminated in both arms, two pairs were double-censored, and one pair had a censored control and a terminal intervention.

| Registered physical group | Source attacks: control / owner Ultra Ball | Treatment actual native Ultra Ball resolution | Native winner distinction |
| --- | ---: | --- | --- |
| Repeat 5, source seat1, champion | **1 / 0** | Ultra Ball turn16, Mew VMAX selected | Candidate native winner in both |
| Repeat 5, source seat1, New Moon | 0 / 0 | No source Ultra Ball root | Candidate native winner in both |
| Repeat 5, source seat0, champion | 0 / 0 | No source Ultra Ball root | Both action-capped |
| Repeat 5, source seat0, New Moon | 0 / 0 | No source Ultra Ball root | Both action-capped |
| Repeat 6, source seat1, champion | 0 / 0 | Ultra Ball turn5, Mew VMAX selected | Candidate native winner in both |
| Repeat 6, source seat1, New Moon | 4 / 4 | Ultra Ball turn5, Mew VMAX selected | Original source native winner in both |
| Repeat 6, source seat0, champion | 0 / 0 | No source Ultra Ball root | Candidate native winner in both |
| **Repeat 6, source seat0, New Moon** | **0 / 5** | **Ultra Ball turn28, Mew VMAX selected** | **Control capped; treatment original source reached native terminal victory** |

Source attack declarations and same-epoch settled source attacks each increased in total **5 to 9** across all eight paired groups, representing a -1 effect in one group, +5 in another, no effect in six. **Zero native winner reversals can be claimed:** all five both-terminal pairs had identical native winners. The most favorable source seat0 New Moon treatment completed **five genuine Mew VMAX Cross Fusion Strike attacks** on global turns **38, 42, 46, 50 and 54**, eventually taking all source Prize cards. Its matched control was action-capped, so its ultimate winner is unknown. At the exact owner search on turn28, treatment physically selected `Mew VMAX FST` from the own deck; its Ultra Ball root has a native Store-confirmed public Item departure and both required prompts resolved.

## Resource cost exposes the next concrete bug

The root's initial hand gate ensures at least two nonprotected choices *exist*, but the existing general-purpose `agent47-actor-hand-discard` chooser uses count/uniqueness scoring when it pays a mandatory two-card cost. The actual native discard results included:

- Repeat 5, seat1, champion: `Battle VIP Pass FST` **plus `Double Colorless Energy SUM`** discarded to play Ultra Ball on turn16. A source-critical attack resource was spent even though the root intended two less protected payment choices. This arm lost the control's one native attack.
- Repeat 6, seat1, champion **and** New Moon: `Escape Rope BST` **plus singleton `Forest Seal Stone SIT`** discarded on turn5. An important one-use search connector was consumed while resolving the new evolution line.
- Repeat 6, seat0, New Moon: `Battle VIP Pass FST` plus `Field Blower GRI` discarded on turn28; this case produced the five new source attacks.

These are observed real payment choices. We do not infer that the resource discards alone caused any eventual win or loss, but the comparison concretely reveals a mismatch between a root policy's assumed affordable payment and the downstream owner hand-discard decision. The **next fix** should pass the Ultra Ball root's payment intent to a source-only native owner discard chooser, exclude DCE, Forest Seal Stone, ACE SPEC and the needed Mew body when at least two validated unprotected alternatives exist, and retain fallback to native legal payment when conditions differ. This must be checked with actual accepted prompt receipts and later attacks, rather than scoring a nominally reachable search path as a success.

## Status

The source Mew Ultra Ball branch is fully native-executable and source-seat-gated; it has produced authentic Mew VMAX search and five genuine source attacks in one repaired physical game. Resource payment behavior remains improvable. It is **opt-in**, and candidate deck rankings cannot be inferred from this small, partly censored, error-repaired developmental replay. Competitively qualified paper games **0**, final fixed 60 selected **none**.
