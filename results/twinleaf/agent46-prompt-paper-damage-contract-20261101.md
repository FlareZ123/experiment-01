# Agent 46: real Store prompt bypass, printed damage restrictions, and a bounded research guard

**1 November 2026 | pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.**

## Findings

Two separate, genuine native Store actions accepted paper-forbidden `PutDamagePrompt` responses. Both were produced with actual original printed card reducers and target Pokémon, rather than an invented stand-in prompt.

| Card/source | Printed restriction | Actual forbidden reply accepted | Native public result | Source-field relevance |
| --- | --- | --- | --- | --- |
| Gengar **UNB 70**, `Shadow Pain` via genuine from-hand Gengar evolution | All six counters only on opposing Pokémon-GX or Pokémon-EX | 60 damage counters to a non-GX **Shadow Rider Calyrex V CRE**, despite `maxAllowedDamage:0` for that target | Benched V acquired 60 damage; eligible Dedenne-GX stayed at 0 | Gengar UNB is **not** an authenticated Top32 opponent-list card; fidelity boundary only |
| Alolan Raichu **UNM 57**, `Electro Rain` via genuine attack, one physical Unit Energy LPM | Each Lightning Energy unit discarded assigns an indivisible **30 damage** to one opponent's Pokémon | One 30 packet split as **10 Active + 20 Bench**, despite `damageMultiple:30` | Native corrected attack hook dealt exactly 10 and 20 to separate Pokémon | **Both authenticated original Aichi ranks 4 and 17** contain this card |

Native original-case evidence:
- [Gengar original on real PlayCardAction, CI 41277779866](https://github.com/FlareZ123/experiment-01/actions/runs/41277779866), `Characterize printed Gengar Shadow Pain native prompt target caps` **step succeeded**. The complete workflow later failed at an unrelated Canceling Cologne paper test. Logs include original validator `true`, Store dispatch error `null`, 60 on the non-GX V, zero on Dedenne-GX.
- [Raichu original, CI 41278075797](https://github.com/FlareZ123/experiment-01/actions/runs/41278075797), **full manual workflow succeeded**. Native output contains `damageMultiple:30`, `nativeValidatorAccepted:true`, and post-Store damage `{active:10,bench:20}`. Legal control produced `{active:30,bench:0}`.

The native Gengar source constructs `maxAllowedDamage:9999` for eligible GX/EX and `0` for ineligible Pokémon. The native Alolan Raichu source explicitly sets `damageMultiple:30`. These printed restrictions are therefore represented in the pinned model, yet omitted from enforcement.

## Root cause and evidence levels

1. In pinned `ptcg-server/src/game/store/prompts/put-damage-prompt.ts`, `validate()` checks cancellation, aggregate damage, existence of targets, blocked selections, eligible side and slot. It does **not** enforce positive assignment against a target's zero cap or each assignment's `damageMultiple`.
2. In pinned `ptcg-server/src/game/store/store.ts`, `private reducePrompt()` sets `prompt.result=action.result` and immediately dispatches the callback without calling `prompt.validate()`. A prototype-only `validate` override therefore changes explicit preflight checks but **does not block** Store dispatch. The first ineffective prototype-only hook was falsified by the intentionally failing [CI 41277993035](https://github.com/FlareZ123/experiment-01/actions/runs/41277993035), at its Gengar step. A live Store-dispatch interception was required.
3. The research-owned `simulation/twinleaf/prompt-integrity.cjs` already calls `prompt.validate` before dispatch whenever a runner enables existing `strictPromptValidation:true`. That baseline stricter mode lacked the two paper restrictions above. We have now integrated the shared `paperPutDamageRejectReason` into this **existing** strict gate.

Evidence classification: **real pinned reducer / prompt / Store dispatch and actual resulting public damage** on staged conditional boards, with printed attacks/Abilities and actual cards. These are **not** demonstrated full 60-card games, opponent policy evaluations, clock-qualified matches, or evidence of any agent/game ever intentionally exploiting these invalid choices. The default upstream simple bot frequently limits targets itself. The impact on actual candidate win rates is unmeasured.

## Repair and reproducibility

- `simulation/twinleaf/put-damage-zero-cap-paper-hook.cjs` exports `paperPutDamageRejectReason`, `installPutDamageZeroCapPaperHook`, and `withPutDamageZeroCapPaperHook`. Its **default-off, reversible** Store-dispatch wrapper screens the selected genuine pending `PutDamagePrompt` and checks the native base validator, positive damage against explicit zero caps, whole positive `damageMultiple` units, and nonnegative integer assignments, before the pinned reducer can mutate State. On rejection it throws `PAPER_PUT_DAMAGE_REJECTED:<reason>` and keeps the prompt unresolved for a corrected reply. It preserves all other Store actions.
- `simulation/twinleaf/agent46-gengar-shadow-pain-native-cap.cjs`: same original printed board under unmodified and guarded Store; paper-invalid 60 onto V is accepted unguarded and rejected guarded; valid GX 60 survives unchanged; the exact `Store.prototype.dispatch` function is restored.
- `simulation/twinleaf/agent46-raichu-packet-split-native.cjs`: same original UNM attack and Unit Energy under unmodified and guarded Store; invalid 10/20 split settles unguarded and is rejected guarded before target damage; legal 30 settles identically; rejected prompt remains pending.
- `simulation/twinleaf/prompt-integrity.cjs`: now reuses the pure checks **only inside existing strictPromptValidation**, with bounded rejection labels. There is no new game-policy flag, no upstream/vendor change, and no blanket change to historical default data.
- `tests/prompt-integrity.test.cjs`: pure zero-cap, packet indivisibility and positive controls added to existing suite.
- Manual CI: [Gengar guarded step 41278225440](https://github.com/FlareZ123/experiment-01/actions/runs/41278225440) succeeded (overall workflow later failed on existing Cologne check); [Raichu guarded workflow 41278337314](https://github.com/FlareZ123/experiment-01/actions/runs/41278337314) succeeded. Pure strict-gate CI pending as of initial report; its status should be appended after the manual job finishes.

## Release qualification and limits

The new checks protect **a specific paper-validity contract**; they do not establish that other Twinleaf prompt classes or all other `PutDamagePrompt` constraints are correct. Positive `maxAllowedDamage` caps are intentionally not universally enforced: multiple card reducers treat them as an HP-related UI hint, and a broad numeric bound must be independently validated card-by-card. Some other native prompt classes also need source-specific testing, as the pre-existing `prompt-integrity.cjs` documents.

Any competitive comparison should use one frozen two-seat policy including the **same strict validator** for both candidates and original opponents. A rejected prompt should be counted as a censored/unqualified decision unless the agent produces a valid replacement under an explicitly documented common policy. Enforcing a paper restriction must never be counted as additional victories. The user-facing 99.5% objective remains unproven; 32 archetypes are known, exact original lists for 23/25/28 remain unverified, and competitively qualified Top32 games remain zero.
