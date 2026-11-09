# Shadow Rider Active-funding debt in the complete 116-native-attempt comparison

**Agent 33 | 9 November 2026 | archival physical Store ledger analysis. No newly played games and zero competitively paper-qualified games.**

## Actionable result

An original rank7 Snorlax Stall **source-matched** native opening exposes an attack-payment failure in the leading modified fixed 60, Hood Shield Shadow Rider v1. The source's initial physical deal and acting source seat match the unchanged rank1 champion reference. The **Hood candidate** loses the native terminal with **zero candidate attacks**, even though its final board contains one Psychic on Active Shadow Rider Calyrex VMAX and seven on its Bench. An actual owner manual attachment at global turn 31 goes to Benched Girafarig while the VMAX is underfunded. The **champion reference** wins its different candidate-hand arm with two executed Max Geist attacks, Active VMAX funded to three Psychic, and five Bench Psychic.

**Printed rules nuance:** Max Geist (CRE75) costs three Colorless and deals 10 plus 30 for **every Psychic Energy attached to all your Pokémon**. Energy on the Bench is valuable attack damage even if its recipient cannot attack. The failure observable here is **Active attack-cost payment**; it would be incorrect to call every Underworld Door attachment to Marshadow wasteful. These are not identical candidate opening hands or a causal swap test.

| Exact original source rank7 B, seed `1693388692` | Champion reference | Hood Shield v1 |
| --- | ---: | ---: |
| Initial original-source deal fingerprint | `fc5b8b82…3ca` | Same |
| Native winner | Candidate seat 1 | Original source seat 0 |
| Native global terminal turn | 23 | 65 |
| Candidate ordinary AttackAction declarations | 2, both Max Geist | **0** |
| Genuine candidate Underworld AttachEnergyPrompt settlements | 4 | 6 |
| Underworld selections placing Psychic onto Bench Marshadow | 4 | 6 |
| Candidate manual Psychic root turns | 1, 7, 19, 21, 23 | 1, 15, **31** |
| Last manual Psychic target | Bench at turn 23 | **Benched Girafarig at turn 31** |
| Final Active VMAX Psychic / printed Max Geist requirement | 3 / 3 | **1 / 3** |
| Final total Benched Psychic | 5 | 7 |
| Qualification for competitive paper inference | No | No |

Original Native Store receipt evidence: Hood Underworld source-owner resolutions on turns 13, 15, 27, 31, 37 and 53 (dispatch ordinals 60, 70, 112, 127, 160, 212), each increasing the real Benched Marshadow from 0 to 6 Basic Psychic. Source-owned manual Psychic roots accepted at ordinals 11 (Active V), 71 (Active VMAX) and **133 (Girafarig)**. Candidate's source-matched reference roots to Active at ordinals 17, 47, 89 and 100. There was no Hood Max Geist declaration. The candidate also had two unfunded Benched Lillie's Clefairy ex at the final board.

This is stronger than diagnosing from a final score alone because each listed item is tied to an actual native action or prompt/zone transfer. Still, the native policy's alternative private hand draws, tactical retreat opportunities, opposing lock, and future payoffs must be considered before replacing a selected move.

## Full archived field census

I processed the full original [Agent3 116-attempt, 29-source native comparison](agent3-hood-vs-shadow-all29-native-20261109.md), not just the winning reversal. Original raw [Actions artifact 13656062292](https://github.com/FlareZ123/experiment-01/actions/runs/42578010606/artifacts/13656062292), raw JSON SHA256 `3f7df2ca61fc2120a361adfbc1c09d288a4f37e07d5fcc0519f62574b5162f47`, 148,390,993 bytes, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Native endpoint measure | Champion 58 arms | Hood v1 58 arms |
| --- | ---: | ---: |
| Final public Active is Shadow Rider VMAX | 19 | 28 |
| Of those endpoints, Active has fewer than 3 Psychic **while Bench has at least 3** | **5 / 19** | **10 / 28** |
| Such endpoints with zero candidate attack declarations over the entire game | 1 | 2 |
| Candidate-owned real Underworld attachment prompt settlements across all 58 | 132 | 156 |
| Of those, into Marshadow UNB | 10 | 10 |
| Total candidate ordinary AttackAction declarations in all 58 | 398 | 430 |

**Attack modality scope:** These counts describe native root `AttackAction` declarations. The shared runner's historical `attackDeclarations` metric does not generally capture attacks initiated through `UseAbilityAction Perfection`. I checked the actual archived candidate-owned `rootActionLedger` for all 116 attempts and found **zero** `UseAbilityAction Perfection` initiations in either arm, including the exact rank7 B loss. This establishes that the omitted Perfection category does not explain the reported zero rank7 candidate attacks or the 398/430 ordinary counts in this *particular* archive. The metrics must not be reused as a universal all-attack counter in other decks or cohorts. The ongoing canonical copied-attack telemetry correction remains a separate shared-runner task.

The endpoint condition deliberately asks about a final public board, **not whether the owner had Psychic in hand, unspent attachment, a legal tool/retreat, or a winning alternative at any preceding decision**. Some games with the condition still made many attacks earlier. The unequal final-Active denominator (19 and 28), source-match discrepancies in three rank groups, censorship and native-policy weaknesses prohibit interpreting 5 vs 10 as proof the Hood deck is intrinsically worse.

The same-source rank7 B is the exact actionable outlier. Other Hood end-state debt ranks include 2, 3 twice, 7 twice, 8, 16, 17, 24 and 27; several were action-capped, so their final board is not a legal terminal outcome.

## Reproducibility and next policy experiment

- New [deterministic uncompressed-archive analyst](../../../simulation/evaluation/2026-11/agent33-shadow-active-funding-ledger-audit.cjs) selects the correct candidate physical seat, aggregates native accepted owner prompts, gathers real manual Psychic target receipts, retains the identical original-source fingerprint, and emits the bounded per-field census and two exact rank7 B traces. The algorithm was independently mirrored and executed in Python against the **actual complete 148 MB** raw artifact. Its [CJS synthetic regression](../../../tests/2026-11/agent33-shadow-active-funding-ledger-audit.test.cjs) is committed; a native CI rerun is pending.
- **Existing code already offers the correct first intervention to test:** `simulation/twinleaf/agent34-underworld-active-funding-priority.cjs` contains a default-off owner-visible choice to manually attach the sole held Basic Psychic to an unfunded Active VMAX before consuming it with Underworld Door. It checks actual printed Max Geist cost, Active status, turn attachment quota, and owner held Psychic. [Prior heldout rank1 study](../../aichi-2026/agent34-rank1-heldout-active-funding-native-20261103.md) reported narrow positive attack-action evidence but no winner difference. Thus do not reimplement a blanket Bench recipient ban or enable an already negative [broad recipient ranking](../../aichi-2026/agent34-rank1-heldout-psychic-recipient-negative-20261103.md).
- **Prospective next step:** preregister fresh original rank7 Snorlax Stall source deals against the **unchanged Hood v1 60**, both physical candidate seats, source-original first-player choice, exact same source and candidate physical deals for control versus active-funding guard. Compare actual Store-recognized manual Active and Underworld root choices, whether Max Geist becomes payable, opponent followthrough, resulting native wins, source and candidate Prize progress, censored arms, and error strata. Preserve nonqualifying outcomes. The original seed `1693388692` is a **retrospectively exposed diagnostic only**, excluded from confirmatory performance estimates.
- In particular, rank7 B turn 31 is a candidate manual **Girafarig-vs-Active VMAX allocation fork**. That direct comparison differs from the Underworld-before-manual intervention and deserves its own clearly specified owner-visible decision alternative if the first guard fails to reach the intended root.

**Release status:** The single best legal fixed 60 is still unselected. Source lists remain 29 of 32, and there are zero competitively qualified paper games. This is a meaningful source-policy defect and test plan, with no demonstrated 99.5% field performance.

## Preregistered prospective answer: fixed Hood, rank7, 16 fresh source deals

The suggested A/B is now an **executable, outcome-unobserved** research artifact, committed after the archival diagnosis. [Frozen 16-seed registration](../../aichi-2026/registrations/2026-11/agent33-rank7-hood-active-funding-fresh16-20261109.json) Git blob `d79d197c3e9459220efa5e1b6d3cc4367bd3a2e1` has eight independently drawn 32-bit seeds for each candidate seat, excluding the exposed rank7 A/B development seed group. It specifies one identical original rank7 and identical fixed Hood v1 60 in both policy arms. [Runner](../../../simulation/evaluation/2026-11/agent33-rank7-hood-active-funding-fresh16.cjs) invokes the pinned actual bilateral native Store with the same Agent3 paper-compatibility profile and shared actor options in both arms. Only `actorUnderworldActiveFundingPriority` differs, disabled versus enabled. Its output is a locked, fsynced, atomic immutable full-archive snapshot and an exact source/candidate physical opening fingerprint audit. A [pure registration guard](../../../tests/2026-11/agent33-rank7-hood-active-funding-fresh16-contract.test.cjs) ensures seed uniqueness and original 60 copies. Executing the source in a mocked two-arm engine verified its CJS semantics and 16/16 matched-pair bookkeeping, but **no pinned native games from these seeds have yet executed**; confidence and competitive qualification remain unchanged.
