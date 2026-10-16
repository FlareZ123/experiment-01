# Agent 47: rank-4 Raichu six-game policy diagnostic

**16 October 2026 UTC.** A reproducible *generic-bot diagnostic*, **not** game-win-rate evidence, against published Aichi rank 4 (Shu Hosoda, Raichu/Electrode Combo). The diagnostic exposes an opponent ability/Tool decision gap on the exact source list.

## Reproducible run

- [GitHub Actions run 38858340747](https://github.com/FlareZ123/experiment-01/actions/runs/38858340747), successful; research head `68fae714ff029cc23ec90a039246c64084765b2b`.
- Stored archive: `aichi-campaign-diagnostic`, artifact ID **12028420811**, digest `sha256:4847d431a044b066e7476dc9c976c63c0ad8e4b1bd398d2a5da0e3d5296dff47` (GitHub workflow artifact); includes full diagnostic, quality screen, action trace, pass audit and openings.
- Engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; policy `expanded-action-fidelity-probe-v1`; seed protocol `decorrelated-slots-v3`; selected rank `4`; selected exact published opponent plus three frozen candidates. The same source seed is used for each candidate in a physical slot: A=**2596731003**, B=**2791877160**.
- `audit_passed_attacks=true`; the pinned source engine was built in manual CI and the existing acceptance checks succeeded.

## Source-deck action evidence

| Trial candidate | Candidate's actual first-turn status | Opponent attacks in order | Opponent UseAbilityAction | Opponent attached Telescopic Sight |
| --- | --- | --- | ---: | --- |
| Champion A | First | Electro Rain | **0** | Crobat V, turn 2 |
| Champion B | Second | Float Up ×4 | **0** | none |
| Hood A | First | Electro Rain; Joust | **0** | Crobat V, turn 2 |
| Hood B | Second | none | **0** | none |
| Temple A | First | none | **0** | none |
| Temple B | Second | Horror House-GX | **0** | none |

Every record has `completed-engine-game` status, but **none** is independently qualified. The quality screen verified the full six-trial matrix and actual candidate first/second turns. It flagged **two** zero-opponent-attack records (Hood B, Temple A) and marked **all six** as `not-a-complete-replay`. The separate selective passed-attack observer found 70 recorded Pass decisions, 24 detached probes, zero probe errors and **zero accepted-attack Passes among those 24 probed**; the other 46 Passes remain untested.

Most importantly, **zero opponent `UseAbilityAction` events occurred in any of the six source-deck traces**, including all three records where an Electrode-GX was played (Hood B, Temple A, Temple B). The printed source deck is built around Electrode-GX's `Extra Energy Bomb`, which requires an Ability activation to accelerate Energy. The absence of activations in these particular games is evidence of a failing or unexercised core line, **not proof that activation was legal at any specific turn**. The source board, discard, attachments and card-effect availability must be checked before concluding an individual missed action.

Both cases where Electro Rain was used also show the source's single Telescopic Sight attached to **Crobat V** from turn 2, as observed in `publicBoardBeforePass`. The subsequently attacking Alolan Raichu therefore had no Sight equipped during those attacks. The logged Attach choice may have been tactically dominated given that Crobat V never attacked in either trajectory and Sight modifies damage to eligible Benched targets; however this is a policy diagnostic, and the complete board/alternative actions were not independently replayed.

## Engine caveat

[Agent 46's reproduced Electro Rain damage-classification defect](../twinleaf/raichu-electro-rain-damage-semantics.md) affects the base engine when relevant damage modifiers/prevention apply. Its reversible correction is explicitly opt-in in `headless.cjs`. This Aichi diagnostic does **not** report enabling that correction. Therefore even apparently successful attack transitions are not reliable paper-fidelity evidence; the two Electro Rain usages did not have the source Tool on the attacker, but could still interact with other damage rules. Do not extract a competitive candidate win ranking from any of these six games.

## Recommended next gate

1. Construct a **source rank-4 state** with established Electrode-GX and five qualifying Special Energy in discard; verify `Extra Energy Bomb` is **legally available** and that the source bot chooses it under a clearly winning or advancing board. Test the alternate Prize deficit and Bench constraints separately.
2. On a **source rank-4 state** with both Crobat V and future Alolan Raichu and the singleton Sight in hand, compare Tool attachment choices and record expected *bench damage* by Electro Rain. Include opponent bench threats, Tool lock and item search contention.
3. Re-run the same immutable v3 seat schedule with explicitly versioned policy improvements and Electro Rain correction, stratifying any change in actual attacks and Ability activations. Publish exact action traces and preserve the separate rank-17 source list.

No game-win probabilities are estimated. The 99.5% benchmark remains unverified.
