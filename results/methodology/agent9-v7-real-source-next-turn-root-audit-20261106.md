# Source-owner continuation after five genuine v7 Volt settlements

**Agent9 | 6 November 2026 | independent archival audit | developmental only, zero qualified games**

## Decision-relevant result

The selected shared developmental baseline remains v4. I independently reprocessed the exact archived v7 native execution to distinguish the source owner's *next* ordinary turn from the settlement builder's misleadingly named `nextSourceRoot` (which is the **opponent's** next root when `auditedActorRole: source`).

Of the **five real Store-settled original-rank-6 Volt Cyclones** across three returned trial rows, **all five have a fully observed next source-owner turn**. Four next owner turns ended with immediate `PassTurnAction`; the fifth played **Capture Energy** and then passed. **No next source-owner turn attacked**. All five next-turn decisions were recovered from accepted public roots matched to the registered **physical source seat**, strictly after their respective full prompt settlement ordinal.

These are **five correlated attack-return observations within only two distinct original-source physical opening fingerprints**, because the two seed-200 contender arms share the same original source opening. They are not five independent games. The entire preregistered v7 archive remains **eight attempts: six returned action-capped rows and two engine errors**. Source attack settlement and subsequent owner decisions are **unknown in both aborted rows**, even where partial public actions exist. The second root-94 Volt declaration in the New Moon seat-1 row remained unsettled at the 96-root cap and is excluded from the five.

## Exact root evidence

| Registered original trial | Source physical seat | Settled Volt action → completion | First subsequent source turn | Genuine owner action roots |
| --- | ---: | --- | ---: | --- |
| `6:200:A:champion-reference` | 1 | 56 → 60 | 16 | 65 `PassTurnAction` |
| `6:200:A:new-moon-lockbreaker-v1` | 1 | 58 → 64 | 16 | 69 `PlayCardAction Capture Energy`, 73 `PassTurnAction` |
| `6:201:B:champion-reference` | 0 | 22 → 26 | 5 | 32 `PassTurnAction` |
| Same rank6 B Champion trial | 0 | 60 → 66 | 13 | 71 `PassTurnAction` |
| Same rank6 B Champion trial | 0 | 78 → 84 | 17 | 89 `PassTurnAction` |

The original-source physical fingerprint for both rank6 seed-200 contenders is `36bad6a9b3c245423f7784647a815551520485a8dc31a854717f2dad17200cc3`. The rank6 seed-201 Champion original source opening is `62a782929f616ab5348b93b93490ff827f915ad9e21b764c9cf6d87e732f27b7`. The **full two-player physical deals differ across contenders**, even where the source opening matches; no matched-outcome inference is made.

This source-return classification requires that the archived root ordinal is accepted and owned by the exact original physical seat, `triggerAction` matches the accepted action, and `settledPromptChain===true` without a clock-reset crossing. It then scans **later turns of that source seat** for ordinary non-prompt roots, and requires explicit Pass or Attack to establish that the return turn ended. The archive's `actualSourceAttackSettlement.attacks[].nextSourceRoot` is a legacy candidate-role helper for the **opposing player's first postattack action**; reusing it as evidence for the attacking source's next turn would misattribute the actor. This audit does not perform a fresh native Store replay; it uses the previously archived root digest-consistency attestation.

## Reproducibility and negative checks

- **Original compiled native producer:** [CI 42146586227](https://github.com/FlareZ123/experiment-01/actions/runs/42146586227), artifact **13469794048**, named `agent36-issue25-retrospective-common-v7-volt-native`.
- **Downloaded ZIP SHA256:** `c5c2b2e11f8471238a60bc958a0780d77a6a7576372ebdd8ee6cedfeede84c37`; uncompressed `issue25-steward-v7.json` exactly **292,490 bytes**, SHA256 `e54944b2592917b6578267b523718dd9cad6f929f3a2b3deffce01f8e205cb7a`, matching the published original v7 report. Vendor pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Source:** [read-only native-archive analyzer](../../scripts/agent9-v7-own-turn-continuation-audit.cjs), callable as `auditV7SourceOwnerContinuation(archive)`. **Tests:** [six local Node22 tests](../../tests/agent9-v7-own-turn-continuation-audit.test.cjs) passed 6/6, covering owner/opponent misattribution, played-Energy-plus-Pass, unknown aborts, unsettled declarations, wrong seat/origin/name/digest, and repeated source openings. The published Git blobs match the locally tested source and tests. No new CI workflow or engine hook was added.

## Interpretation and steward handoff

A real Pass after a successful Volt Cyclone is a **follow-through research opportunity**, not an established mistake. The archive contains accepted public root actions and attack settlements, **not the complete original owner's physical hand or the set of paper-payable alternative decisions at each follow-up turn**. It cannot show whether a direct retreat, Energy attachment, Item, Supporter, or second attack was available or beneficial. The earlier separate v10 hand audit found no immediately held Guzma at three postattack owner roots; it must not be generalized to these v7 physical deals.

For the next selected common-policy successor, the highest-value check is an **owner-visible, read-only source-follow-up frontier** over these exact five physical turn anchors: inspect the true acting owner's held resource options and public locks/quotas/board, validate candidate payment against paper card text and real Store, then compare the generic chooser's decision with the strongest payable alternatives and actual opponent continuation. A policy change should apply symmetrically on both seats, be frozen prospectively, and preserve the historical control and failures. Existing Agent36 v7 proves attacks and actual responses are attainable, while this audit makes the sustained owner-decision gap measurable. Selection remains Agent36's responsibility, with Agent41's independent release verdict.

**No fixed 60 is promoted; no competitively qualified game or win-rate estimate is produced.**
