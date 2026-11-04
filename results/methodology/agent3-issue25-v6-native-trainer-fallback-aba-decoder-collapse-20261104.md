# Issue #25 selected v6 generic native Trainer fallback: fail-closed 24-arm A/B/A reveals repeatable decoder collapse

**Agent3 | 4 November 2026 | executing native policy intervention, all competitive outcomes unqualified.**

## Why this study

[The eight-arm read-only A/A study](agent3-issue25-v6-a-a-trainer-frontier-and-passive-native-lock-20261104.md) had found **38 genuine source-owner decision snapshots in seven returned original rank6/rank11 attempts**, all with at least one held generically unblocked Trainer, but **zero original-source selected Trainers**, including **34 native-accepted Pass roots**. Iron Thorns ex `Initialization` was separately shown to block public printed opposing Powers natively. These observations motivated a small owner-policy intervention.

Agent50's older [standalone original rank5/rank11 native Trainer A/B/A](../aichi-2026/agent50-generic-native-trainer-aba-20261103.md) had accepted 12 native Trainer root actions, though it was not paper-certified or owner-information-set-safe. It did not test the whole-policy selected v6 composition. We therefore tested its **existing** `nativeOwnerTrainerFallback` option on both players under the actual v6 policy, rather than inferring compatibility.

## Precommitted 8 × 3 design

Before any v10 native runs, committed [registration](../aichi-2026/registrations/agent3-issue25-native-trainer-fallback-aba-v10-20261104.json) with the exact v6 eight source rank6/rank11 × source physical seat × frozen contender printed60 and seed identities: four rank/seat source conditions and two contender decks (champion-reference and New Moon). The three profiles for each ID are **control (`nativeOwnerTrainerFallback:false`), treatment (`true`), repeated control (`false`)**. Both owner Trainer opportunity and passive Ability read-only observers remain enabled in all 24 arms. The same v6 actual resource chooser and three printed attack handlers execute in each mode, with 48 accepted-root cap. Selected native Tactics delegated Trainer preference is development-only and may depend on hidden information. The experiment is a **policy A/B/A**, not an unbiased comparison of candidate 60s or a competitive win-rate experiment.

Runner: [v10 selected A/B/A](../../simulation/evaluation/agent3-issue25-native-trainer-aba-v10.cjs); tests: [adversarial pure](../../tests/agent3-issue25-native-trainer-aba-v10.test.cjs) and [actual pinned Store](../../tests/agent3-issue25-native-trainer-aba-v10.native.test.cjs). Executed through the **existing** Agent3 manually opted-in compiled CI, no extra scheduled workflows. Twinleaf source commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Actual evidence and negative outcome

First actual [compiled native run 41904983346](https://github.com/FlareZ123/experiment-01/actions/runs/41904983346), artifact **13358569955**, independently downloaded ZIP SHA256 `2fc70290d9b2883aca12bc2f5d91043794e71e3667e9ff7b7d2f80732445801c`, JSON SHA256 `e3570aba74985a48c49fea8b0ce14564df20b9a485335724cc931043dd412d2b` (80,226 bytes). Five pure registration/contrast tests pass; native trial intentionally failed its compatibility assertion after persisting the complete public diagnostic. Its recorded physical evidence is intact.

Second [compiled native run 41905585715](https://github.com/FlareZ123/experiment-01/actions/runs/41905585715) **passed with an error-preserving policy-failure verdict**, artifact **13360371267**, ZIP SHA256 `9f1bba3d9e2ad4686656654cd20e2d364da91bbcc1218ce7da1f15c95ee9770d`, JSON SHA256 `7d598a9b35b751708cca3304544e73351831703b90ce6f2ce9ed3e225321e0b2` (84,849 bytes), independently downloaded and hashed.

- **24/24 native attempts recorded**, across all eight registered ID trios. No trial was excluded because it errored.
- **8/8 same complete physical starting deals across A/B/A**, identical source-side initial deal, and identical actual first player.
- **8/8 original control roots and native dispositions reproduce original v6**; **8/8 repeated control roots and dispositions reproduce the first controls exactly**. This is strong native A/A custody evidence.
- **8/8 treatment arms terminated in `engine-error` at first ordinary postsetup decision**, zero fallback-accepted Trainer roots, zero treatment declared attacks.
- All eight treatment errors are labelled **`bot-decoder`** and share redacted error message SHA256 `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. The original rank11/champion baseline abort at root25 had **the same redacted decoder error digest**, a concrete signature of a reusable native decoder failure family.
- The first set of code incorrectly treated posterror **missing** source/candidate registered 60 fingerprints as a deck mismatch. This was corrected: **no observed printing contradiction**, eight treatment triple comparisons have `samePrintedSixties:null` (**UNRESOLVED**) because the treatment aborted before returning its postgame 60 hashes. The actual running registration and *all three initial full physical deals* are frozen and match.
- The original rank11/champion engine error at root25 persists in both controls. That original error is never omitted or counted as a loss.

| Native source rank / contender | Physical original source seat | Control | Native fallback treatment | Repeated control | Full initial deal A/B/A |
| --- | ---: | --- | --- | --- | --- |
| 6 / Champion, 100:A | 1 | 48-root cap | bot decoder error | same 48-root cap | identical |
| 6 / New Moon, 100:A | 1 | 48-root cap | bot decoder error | same 48-root cap | identical |
| 6 / Champion, 101:B | 0 | 48-root cap | bot decoder error | same 48-root cap | identical |
| 6 / New Moon, 101:B | 0 | 48-root cap | bot decoder error | same 48-root cap | identical |
| 11 / Champion, 102:A | 1 | root25 decoder error | decoder error | same root25 error | identical |
| 11 / New Moon, 102:A | 1 | 48-root cap | bot decoder error | same 48-root cap | identical |
| 11 / Champion, 103:B | 0 | 48-root cap | bot decoder error | same 48-root cap | identical |
| 11 / New Moon, 103:B | 0 | 48-root cap | bot decoder error | same 48-root cap | identical |

The first treatment action difference occurs where the baseline had a `PassTurnAction` (first public root index 7–21); no accepted replacement action followed. From this archive, the failure is **native decoder integration after opting in to delegate fallback**, irrespective of which original rank and physical seat we selected. The eight identical digest strings do not themselves prove identical internal stack frames, and the public error message is redacted to avoid disclosing hidden card contents. A future safe-frame-only reproduction is a better way to pin the failure location.

## How this constrains the objective

- The current selected joined v6 **cannot simply enable the generic native Trainer fallback and claim better source play**. It aborts all eight frozen interventions instead.
- The reproduced controls and initial deals isolate this failure to the policy-treatment execution surface under these fixed native states. It does **not** establish broad native fallback failure under every deck or invalidate Agent50's earlier standalone evidence.
- Returning native `SimpleTacticsAi` proposals is neither owner-information-set-certified nor paper-legality-certified, even if the exception were repaired. Source Trainer selection requires an affordable owner-visible action and its consequences, followed by an opponent response.
- A first truly useful next test would identify a **safe stack-frame path**, implement a bounded owner-only Trainer/root alternative or advisor-exception isolation, and confirm selected native Store acceptance with real payment/target and possible passive lock. Preserve the original matched controls and all negative records.

**Competitive qualification remains zero, with 29/32 authenticated Aichi original decklists, ranks23/25/28 missing. No fixed best 60 or demonstrated 99.5% win rate.**
