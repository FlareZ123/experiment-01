# Rank-5 Crobat→Mew paid Retreat: original physical DCE object transferred into source discard

**Agent 9 | 2 November 2026 | preregistered read-only physical custody audit of an already-exposed original source deal | 0 competitive games**

## Direct observed answer

In the previously published [matched Crobat paid-retreat source conversion](agent9-rank5-crobat-native-paid-retreat-three-attacks-20261102.md), the native Store had accepted Crobat V DAA to Mew VMAX FST paid Retreat on original rank-5 source turn 52, followed by three genuine settled copied attacks. The initial archive proved the visible board transition but lacked a specific physical payment-object custody receipt. This follow-up **closes that specific gap**.

The new **read-only actual native Store observer** captured the **original Crobat-attached physical Double Colorless Energy SUM object reference immediately before** each matching RetreatAction and followed that *identical object* after the Store settled. Both positive policy-mode invocations succeeded with all checks:

| Per actual Store retreat T52, source physical seat 1 | Mode 1 | Mode 2 |
| --- | --- | --- |
| Source exact Crobat-attached DCE original object in owner's physical discard | true | true |
| Separate original Mew VMAX object promoted to Active | true | true |
| Original Crobat V object now on Bench | true | true |
| Retreated DCE object absent from both Active and Bench physical cards | true | true |
| Retreated DCE object absent from all in-play Energy indexes | true | true |
| Native once-per-turn Retreat quota used | true | true |
| Any unresolved native prompt, missing payment or rejection | none | none |

Native results: **2/2 actual matched RetreatAction roots** had `EXACT_PHYSICAL_FEE_AND_PROMOTION` status; zero unverified/rejected/prompt-pending. These are **two observations of one already-known original physical situation** under two modes, not two independent stochastic game successes.

This is stronger than merely finding a same-print DCE in the discard pile: a deliberately different physical DCE copy of the same name already sitting in discard **does not** satisfy the observer. The unit negative control confirms the identity distinction.

## Frozen provenance and no-op behavior

- Original **pre-outcome** experiment [registration](registrations/agent9-rank5-crobat-dce-mew-retreat-pair-20261102.json) and [first archive](https://github.com/FlareZ123/experiment-01/actions/runs/41427913887) are unchanged.
- Read-only observer explicitly [registered before new execution](registrations/agent9-rank5-retreat-fee-physical-custody-20261102.json), committed `cf752b4f`; previously exposed 4 source physical deals and two candidate contexts were *reused for deterministic mechanism validation*, never described as prospective matchups.
- Reproducible actual pinned native manual [GitHub Actions run **41519629113**](https://github.com/FlareZ123/experiment-01/actions/runs/41519629113), head `ca324624fdfc1f2a5518886124fc8cd1e61ae16a`, **success**, upstream `vendor/twinleaf` pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Archived artifact ID **13177775960** (`agent9-rank5-crobat-dce-retreat-16arm`), ZIP SHA256 `3fde5d75fb372671d7ec71d2939ca02655846f20bdb4c6f4022d3f910bb21787`, uncompressed 36,192,780-byte JSON SHA256 `061752f461e8eb9d0b9ce496147744ac07fbf88290e215e5b713fd3c43b47d98`.
- Exact original rank-5 source printed60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`; all four historical physical situations retained in two modes, control and treatment, for **16** native attempts. **8/8** within-mode source/full initial physical-deal fingerprints matched.
- **Strong observer no-op proof:** an independent JSON reconstruction compared the complete original `rootActionLedger` streams across **all 16 historical arms** to the new observer-enabled re-execution, using SHA256 of canonical sorted-key JSON. **16/16 root-action ledgers are byte-equivalent after serialization**, all 16 original source/full physical fingerprints match, and the source attack count and native terminal/action-cap class match across every arm. The observer did **not** affect accepted native decision chronology.
- [Observer module](../../simulation/twinleaf/agent9-retreat-fee-custody.cjs), [unit tests](../../tests/agent9-retreat-fee-custody.test.cjs), optional opt-in [runner](../../simulation/evaluation/agent9-rank5-crobat-retreat-pair.cjs) and [manual native workflow](../../.github/workflows/agent9-rank5-quickball-same-revision-pair.yml). All **six** physical object custody unit cases plus the earlier source-role settlement regressions passed in the existing manual Aichi statistical workflow [run **41519288035**](https://github.com/FlareZ123/experiment-01/actions/runs/41519288035), step 39, alongside other tests. No automated per-push compute workload added.

### Confirmed actual timeline

- The exact Crobat DCE payment and physical Mew promotion occur on original source **turn 52** with one genuine accepted `RetreatAction`.
- The subsequent `Cross Fusion Strike` copies Benched Genesect V's `Techno Blast` via three genuine prompts and yields **three settled source attacks** T52/T56/T60, with original source Prizes **6→6→3→1** and three genuine opponent next-turn returns.
- Original source turns T54 and T58 pass, consistent with the copied Techno Blast restriction against attacking on the next turn without changing Active, per the supplied original printing and rules.
- Both positive scenarios remain **260-action-capped with no native winner**; identical old and new ledgers prevent claiming that the observer improved gameplay.

## What this proves, and what remains blocked

The **exact physical DCE card payment**, owner discard destination, original object-based Crobat/Mew promotion, and Store retreat quota are now directly evidenced for this one natural source-deal position. Thus the narrow *retreat-fee physical custody* question has an affirmative Store answer, whereas the rest of the original native replay is **not paper-certified**. Pinned native `ptcg-server/src/game/store/effects/game-effects.ts` initializes `RetreatEffect.moveRetreatCostTo` to `player.discard`, and `ptcg-server/src/game/store/effect-reducers/retreat-effect.ts` moves the selected card objects there with `moveCardsTo`, consistent with the actual recorded custody.

Remaining missing requirements: every printed effect and attack's legal resolution, all paper turn/Supporter/Energy rules, original-owner physical-card indexing from pregame, identity of all 32 exact opponent lists, opponent full-information-set policy competence, a verified 25-minute tournament clock, natural terminal and scoring, a symmetric policy, independent held-out physical deals. The paid Retreat was enabled only for the *source actor* as a causal-diagnostic toggle; this is not the unchanged symmetric competitive policy required for a genuine fixed-60 game.

**Competitive denominator: 0; original full-source denominator: 29/32; achieved fixed-60 win rate: unknown.** No additional source roster position or 99.5% win claim is licensed by this result.
