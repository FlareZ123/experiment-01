# Rank5 Quick Ball payment repair: native prompts improve resource retention, attacks remain absent

**Agent 9 | 2 November 2026 | preregistered source-only Quick Ball cost-continuation contrast**

## Native experiment

[Registration](registrations/agent9-rank5-quickball-payment-pair-20261102.json) was committed before treatment execution. [Runner](../../simulation/evaluation/agent9-rank5-quickball-payment-pair.cjs) and [fixture test](../../tests/agent9-rank5-quickball-payment-pair.test.cjs) compare two identical source-only Quick Ball policies. The treatment enables `agent47-actor-hand-discard.cjs` for mandatory hand-owned discard prompts on **both physical seats**. The control retains original generic native payment prompts. Other actor and source deck policies are identical. Retain actual competing prompts; do not infer any unobserved hand state.

[Successful native GitHub Actions run **41425978216**](https://github.com/FlareZ123/experiment-01/actions/runs/41425978216), archived artifact **13132252054**, ZIP SHA256 `2bcea81693cf8d567fb0907f1607534606beee3e185d99c849e1b8770c1fffe0`, original uncompressed JSON 35,508,731 bytes, SHA256 `1cf389c08d7f2df3b86361a395174a1355c9ed64b09796383710c7899dc1947c`. Twinleaf pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source original printed60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. Eight of eight full physical pair fingerprints match. Two integrated policy modes gave identical root and outcome summaries; **only four distinct physical deals**.

## Native outcomes, one of the identical policy modes

| Unique original deal | Payment policy | Source accepted QB | Actor47 accepted hand payments (source/candidate) | Source DCE attachments | Source Mew VMAX evolutions | Source attacks | Native end |
| --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| A / reference | Native fallback | 3 | 0 / 0 | 0 | 2 | 0 | candidate engine winner, turn 43 |
| A / reference | Actor47 | 3 | 3 / 0 | 0 | 2 | 0 | candidate engine winner, turn 43 |
| A / New Moon | Native fallback | 3 | 0 / 0 | **1** | 1 | 0 | candidate engine winner, turn 51 |
| A / New Moon | Actor47 | 3 | 3 / 0 | **3** | 1 | 0 | **action cap, no winner**, turn 63 |
| B / reference | Native fallback | 1 | 0 / 0 | 2 | 0 | 0 | candidate engine winner, turn 23 |
| B / reference | Actor47 | 1 | 1 / 0 | 2 | 0 | 0 | candidate engine winner, turn 23 |
| B / New Moon | Native fallback | 2 | 0 / 0 | 2 | 0 | 0 | candidate engine winner, turn 33 |
| B / New Moon | Actor47 | 2 | 2 / 0 | 2 | 0 | 0 | candidate engine winner, turn 33 |

The registered treatment was *allowed* on either actor. Its original Store audit confirms **all nine accepted Actor47 hand payments per mode were source-owned**, with zero on candidate. All native source Quick Ball roots continued successfully, and source payment counts were unchanged. Treatment had zero native prompt rejects. This is a tested source-side payment intervention on these **particular** decks and deals.

## Actual payment alterations

| Trial | Native fallback source QB payment sequence | Actor47 source QB payment sequence | Source Basic searches |
| --- | --- | --- | --- |
| A / reference | Muscle Band, Guzma, Karen | Guzma, Karen, Ultra Ball | Dedenne-GX, Genesect V, Genesect V |
| A / New Moon | Muscle Band, Guzma, Karen | Guzma, VS Seeker, Karen | Dedenne-GX, Genesect V, Genesect V |
| B / reference | Double Colorless Energy | Double Colorless Energy | Crobat V |
| B / New Moon | Double Colorless Energy, **Secret Box** | Double Colorless Energy, **Guzma** | Crobat V, Dedenne-GX |

Each listing is the physically accepted `ChooseCardsPrompt` selection after a source-owned `Quick Ball FST` root and before that actor's next non-prompt action. In B/New Moon, the original source's singleton ACE SPEC **Secret Box TWM163** was spared in the actor prompt treatment. The same duplicate-preserving heuristic nonetheless discarded **Double Colorless Energy SUM** at the first B-seat Quick Ball. Therefore nominal duplicate retention does not reliably preserve attack funding.

## Critical new bottleneck: real source board positioned behind a paid Retreat

In A/New Moon with Actor47 payment, the native target sidecar independently shows three accepted Double Colorless Energy attachments:

1. Source global turn **10**: DCE to **Active Crobat V**.
2. Source global turn **52**: DCE to **Benched Mew VMAX**.
3. Source global turn **56**: DCE to **Benched Dedenne-GX**.

At opponent's **Night Watch** attack on global turn **61**, original Store `candidateAttackSettlement.attacks[].publicBoardBefore` showed source **Active Crobat V with DCE**, source **Benched Mew VMAX with DCE**, and a separate Benched Genesect V donor. The source did not announce any attack, played no `RetreatAction`, and passed each turn through global turn 62. The original DAA104 Crobat V has **one Colorless Retreat Cost**, verified from supplied `cards/en/swsh3.json`. Double Colorless Energy ordinarily pays one Colorless retreat unit, and the opposing Trevenant & Dusknoir-GX's Night Watch does not itself impose a retreat lock. Any remaining effects or turn restrictions must still be checked in the actual Store before asserting legal executable retreat.

The existing `agent37-dce-mew-paid-retreat.cjs` recognizes a funded DCE Mew VMAX when the source Active is **Genesect V FST** with a specific two-Colorless cost. It has **no Crobat V Active branch**. This concrete position is therefore outside that specialized policy, despite the repaired payment policy funding a Mew VMAX on the Bench. This is a new measurable **active-position bottleneck** and stronger follow-up than merely counting source Quick Ball or DCE plays.

## Conclusions and qualification

Actor47's owner-private prompt behavior is physically accepted and protects the singleton Secret Box in one matched deal. In A/New Moon it changes an opponent engine win into action-limit censoring while increasing Energy attachments. No source AttackAction was restored in any of the four unique deals. A proposed next intervention is a **default-off owner-public Crobat V to DCE-funded Mew VMAX paid-retreat root**, requiring a positive native Store action/attack receipt and rigorous lock/condition gating.

There are **zero competitive-qualified games**, and no paper-field win-rate conclusion. Missing 60s remain ranks 23, 25 and 28; the fixed 99.5% objective remains unestablished.
