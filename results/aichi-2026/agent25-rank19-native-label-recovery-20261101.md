# Agent25: rank19 exact physical label repair recovers all four native terminal receipts

**1 November 2026.** A strictly read-only original Store receipt/linkage correction, with independently archived baseline and retrospective same-seed native replay. **Zero paper-qualified competitive games.**

## Discovered defect in the new nine-archetype source cohort

The precommitted 36-arm [cross-archetype run 41341992444](https://github.com/FlareZ123/experiment-01/actions/runs/41341992444) returned **four fail-closed errors** for original published Aichi **rank19 Raging Bolt**, while its complete accepted-target sidecars exposed a common **one-label mismatch** per game. These are verifiable **postgame root-to-physical-label attribution failures**, not evidence that the native Store was unable to play either source deck:

- Source rank19, physical candidate seat **A**, both unchanged candidate 60s: archival root label `Ho-Oh-EX`, actual accepted Store printing `Ho-Oh EX DRX`.
- Source rank19, candidate seat **B**, both candidate 60s: root label `Arceus & Dialga & Palkia-GX`, actual physical printing `Arceus & Dialga & Palkia GX CEC`.
- In all four one-card mismatches, Store/root **action type, player seat, global turn and target-bearing action counts agreed**. The full sidecars contained 18, 12, 28 and 26 genuinely accepted target-dispatch records respectively.

A narrow exact-name-only mapping was added to `simulation/twinleaf/native-accepted-target-store-observer.cjs`, retaining existing prior strict aliases and disallowing nearby or different physical printings. New pure negative and positive regressions were appended to `tests/native-accepted-target-store-observer.test.cjs` and passed in compiled manually triggered CI.

## Same-four-registered-seed retrospective replay

- [Manual compiled CI 41342671915](https://github.com/FlareZ123/experiment-01/actions/runs/41342671915), head `ddc1f50b75e8b61b9a1beac00d5f1a3b33da795a`; [artifact 13097448929](https://github.com/FlareZ123/experiment-01/actions/runs/41342671915/artifacts/13097448929). Archive ZIP SHA256 `10f8df3938840c7f2c5cf3bb14c27f630179a58faf642635cba140bcea74268f`, full uncompressed JSON SHA256 `0f9b89e3c762455a1b9cebe73810775a1ce32e778613fba029b208be08eaaeb6`.
- Source group seeds, original rank19 printed 60, both candidate printed 60s, physical candidate seats and pinned vendor Store remained unchanged. The **only treatment change** was the two exact public display-name aliases in the postgame read-only target witness.
- Four of four replayed Store games returned **native engine terminals**, **physical-zone integrity passed**, and **strict root/native target ordinals linked**. The new outcome rows are *retrospective* and must never be silently substituted for the four original archived fail-closed rows in a prospective evaluation.

| Original registered trial | Original target-bearing records | Replay records | Original→replay physical records, ignoring only re-established root ordinal | Replay source AttackAction names | Replay native terminal owner |
| --- | ---: | ---: | --- | --- | --- |
| 19:0:A:champion-reference | 18 | 18 | Exactly identical | 2 Motivate | Candidate |
| 19:0:A:new-moon-lockbreaker-v1 | 12 | 12 | Exactly identical | 3 Motivate | Candidate |
| 19:0:B:champion-reference | 28 | 28 | Exactly identical | **0 source attacks** | Source |
| 19:0:B:new-moon-lockbreaker-v1 | 26 | 26 | Exactly identical | 7 Rainbow Burn | Source |
| **Totals** | **84** | **84** | **84/84 physical target receipts unchanged** | 12 source AttackActions | 2 candidate, 2 source |

The **84/84** identity is an independently computed strict JSON equality of each archived original accepted-target event against the corresponding replay event, excluding only `rootActionOrdinal`: baseline sets it to null because postgame linkage failed, replay attaches actual authenticated ordinals. It includes physical printed-card identity, public affected-board changes, accepted target, Store dispatch ordinal, seat and turn. This supports **read-only witness noninterference on target-bearing actions**, while the original engine-error rows cannot provide a full paired final-root-ledger checksum. A same integer seed alone would not establish entire physical sequence equivalence.

The source's main Raging Bolt `Bellowing Thunder` attack **never appeared** in any of these four original-source replays, even though source-policy `Motivate` and `Rainbow Burn` were used. The candidate/native terminal tally is therefore not a trustworthy measure of strength against an adequately piloted Raging Bolt source.

## Research significance

This closes a **mechanical coverage** blocker for an eighth/ninth source archetype without falsely relaxing target identity to mere turn/action matches. The exact previous four errors are retrospectively explained by a deterministic name-label mismatch, and all original physical card-target events survive the repair unchanged. It creates a reusable blueprint for requiring native physical attestation before granting an apparent simulator game result.

The common research field still needs a competent Raging Bolt source actor, paper-legal prompts, full original 32 exact lists, balanced starts and Aichi real clock rules. **No competitive win-rate, 99.5% achievement or definitive deck ranking is established.**
