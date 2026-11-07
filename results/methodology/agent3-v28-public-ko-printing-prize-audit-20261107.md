# Agent 3: independent printed KO and Prize audit of v28 public victims (7 November 2026)

**Status:** Eight native knockout victim snapshots from the original eight selected-v8 retrospective trials match independent printed card HP and printed Prize-rule counts. **Zero paper-qualified full games, zero confirmed competitive wins, and no field win-rate estimate.** This is an independent card-data cross-check of a narrow native observation, not a legal game certification.

## Provenance and method

The pinned native v28 CI [42337690663](https://github.com/FlareZ123/experiment-01/actions/runs/42337690663) at commit f809632bb67e3bba5f002dddc60a13f9ad886d6b emitted all eight AGENT3_V28_PUBLIC_KO_VICTIMS rows before failing at receipt serialization with a variable-name ReferenceError. The current main source was later corrected, but this report does not claim a green rerun of v28. Native source observations were read-only, captured before KnockOutEffect reduction and linked to accepted physical Prize roots by the earlier v25/v26/v27 work.

The exact eight public printing/HP/damage/Prize observations have been separately preserved as [native console-derived fixture](data/agent3-v28-public-ko-eight-observed-events.json). A reproducible [pure audit](../../simulation/evaluation/agent3-native-ko-printed-prize-audit.cjs) reads the repository's original resources/cards/en JSON pool and checks unique set-specific card IDs, printed name, HP, KO damage threshold and printed rule for number of Prizes. Its [three tests](../../tests/agent3-native-ko-printed-prize-audit.test.cjs) include incorrect HP, Prize count, insufficient damage, nonexistent printing and cross-set negative controls. The audit was tested locally with Node 22.16.0 and the supplied card-list archive, **3/3 passing**. It fails closed on unknown special card rules. This test has not yet been run in repository CI.

## Exact cross-check

| Original native KO victim | Resource printing | Native observed damage / printed HP | Printed Prizes | Native Prizes |
|---|---|---:|---:|---:|
| Girafarig LOT 94 | sm8-94 | 140 / 90 | 1 | 1 |
| Duskull VIV 69 | swsh4-69 | 140 / 60 | 1 | 1 |
| Dialga-GX UPR 100 | sm5-100 | 180 / 180 | 2 | 2 |
| Duskull VIV 69 | swsh4-69 | 130 / 60 | 1 | 1 |
| Mewtwo & Mew-GX UNM 71 | sm11-71 | 360 / 270 | 3 | 3 |
| Marshadow UNB 81 | sm10-81 | 200 / 80 | 1 | 1 |
| Tapu Lele-GX GRI 60 | sm2-60 | 200 / 170 | 2 | 2 |
| Trevenant & Dusknoir-GX SMP 217 | smp-SM217 | 400 / 270 | 3 | 3 |

All eight independently printed prize values sum to 14, the same count as the eight accepted native physical Prize exits. The SMP native number 217 maps to the database promo number SM217 explicitly. The card database lists no special Prize award rule for the three ordinary Basic printings and lists the two-Prize GX and three-Prize TAG TEAM rules for the others.

## Limits and decision impact

This verifies the *printing identity, damage threshold and award count* for precisely these eight original native KO victim observations. It does not establish that the attack's damage amount was calculated correctly, that Energy or Trainer payments were paper-legal, that opponent responses were strategically competent, or that the official Aichi event clock was satisfied. The previously recorded native terminal is still unqualified, and ranks 23, 25 and 28 of the original 32 opposing source lists remain absent. Do not promote the selected v8 baseline or any fixed 60 based on these eight row-level agreements.

**Next:** Run current v28 under its existing manual-only CI dispatch, archive the successful complete JSON if green, join this independent checker to the artifact, and investigate independent damage/attack payment witnesses plus genuine opponent continuation. Preserve zero competitive admission until those gates are met.
