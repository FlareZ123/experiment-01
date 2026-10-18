# Rank-10 archived 216-root-action State projection gate

**Agent 22, 18 October 2026. Evidence type:** read-only source Store integration and historical source-artifact fingerprint reconciliation. Neither a competitive win nor a paper-rule qualification.

## Original archive and scope

The reference is the genuine, complete archived **Timeless-intervention** rank-10 game from [compiled CI 38995733010](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010), artifact ID **12087067955**, file `rank10-source-branch-live-dispatch.json`, branch `alternate.fullLiveDispatchTrace`. The frozen actual source trial is `pilot:10:0:champion-reference:B`, seed **4246551499**, rank10 Regidrago physical A, rank1 Shadow Rider physical B **actually first**; pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Branch enables archived Double Dragon v3 and the three `mimikyuApexTimelessPolicy` / seat / turn27 setup flags documented in [the parent arm-identity audit](agent22-rank10-root215-arm-lineage.md).

The archived alternate path has **235** live root Store dispatches (including two player registrations). Its first **216**, indexed `0..215`, lead through the historical candidate turn-28 `RetreatAction`. Per archived source recorder, control/alternate diverge at dispatch **183**, while the turn27 checkpoint is shared. This audit uses that *archived alternate arm* rather than conflating it with the v3 control or current v4 root15 trajectory.

## Fingerprint contract

For each genuine root dispatch `i`, independently calculate and append a JSON row followed by a newline:

```js
[
  i,
  actionConstructorName,
  zoneDigestBefore,
  continuityDigestBefore,
  effectDigestBefore,
  zoneDigestAfter,
  continuityDigestAfter,
  effectDigestAfter
]
```

Hash the consecutive serialized rows with SHA-256. The zone digest checks ordered physical card zones; continuity checks selected physical Card history/turn state; the effect projection covers selected battle/effect fields and primitives. The live observer uses `sourceZoneSnapshot`, `observableState` and `sourceEffectDigest` on the actual root Store around the genuine `dispatch`, excluding hypothetical cloned Stores. It records no mutating game actions.

Archive-derived checkpoints, expressed as **actions observed → rolling SHA-256**:

| Prefix actions | Expected checksum |
| ---: | --- |
| 2 | `c57be4b4aefc87e547c4424bf59b0305685464428bc4e9612b7107994290d941` |
| 10 | `e98a2c247d93be48af0fee62acdc2f25f880bfa1d1bd4aed7f86dd128664a701` |
| 50 | `202ba72857abce7aa8963d7c0184e5f933e4424ec09bb712f56aab6d9c8da02f` |
| 183 | `c28c866bfc10cafc1595f5667603a30b4a367b1f9aa453ab92730fcdd7fb2b38` |
| 215 | `9ad0b9438538787eb641604a7d411d0ff2c214dfb174f3b323b35c32dbaf72ea` |
| **216** | **`9b6135cb545bc800dd0d40ff441a4f2a6a40fec94459ed87956b79727052196c`** |

The boundary *before* root215 independently matches archived source-zone SHA `5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d` and Card-history SHA `0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548`, previously observed by Agent 22 and Agent 50. The new rolling prefix check asks a stronger question: whether intermediate root-action class and six source-State projections still match **at each of 216 consecutive events**.

## Implementation and falsification

- [Root Store audited runner](../../simulation/twinleaf/rank10-hidden-order-live-probe.cjs) enables the prefix observer only for `ordinal215`, leaving other policy profiles unchanged.
- [Reusable pure fingerprint helper](../../simulation/twinleaf/source-prefix-digest.cjs) fails closed for wrong sequence ordinals or missing checkpoints; [synthetic positive and negative tests](../../tests/source-prefix-digest.test.cjs) cover altered projections and incomplete traces.
- The existing manually dispatched [hidden-information workflow](../../.github/workflows/twinleaf-hidden-information.yml) has a Boolean `archival_prefix_only` job path to compile pinned Twinleaf and run only this source test, avoiding unrelated historical workflow stages. It never triggers on commits.
- Targeted first manual validation: [CI 39161804858](https://github.com/FlareZ123/experiment-01/actions/runs/39161804858), status **pending at report creation**. The prior general-purpose [CI 39161678519](https://github.com/FlareZ123/experiment-01/actions/runs/39161678519) also includes these tests, but earlier general-purpose runs failed at an unrelated rank2 Prize-sampling test. Inspect the independently bounded result before promoting this evidence.

Passing would establish **aggregate selected-State/action-class prefix identity for this archived arm**, not equality of all typed Action fields, prompt payloads, hidden bot history, reducer closure state or copied-attack rule semantics. This is a single previously selected seed and policy branch; it cannot qualify a competitive win or enter a field win-rate denominator.

**Field baseline:** 29/32 exact lists, missing ranks 23/25/28; zero qualified competitive games, no demonstrated 99.5% fixed-list performance.
