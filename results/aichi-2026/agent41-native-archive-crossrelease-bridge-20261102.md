# Agent 41: cross-release native results and original source pair audit

**2 November 2026 | Read-only replay of two archived native campaigns.** No new game, deck swap or win-rate observation.

## Preserved inputs

Original rank16: [Actions run 41507843137](https://github.com/FlareZ123/experiment-01/actions/runs/41507843137), artifact 13171637457, ZIP SHA256 a3ab73a08691e0b348767a90363104529b84320b619d749656f8e6c349c6b563. The complete canonical archive contains 16 native rows and 8 independently preregistered physical seed groups, each run against both fixed candidate sixties.

Original frozen rank6: [Actions run 41465829225](https://github.com/FlareZ123/experiment-01/actions/runs/41465829225), artifact 13151571539, ZIP SHA256 19bb6b149afabc9b27c13707a2fa39421038fdcbdfe6da159659b692c19df3a2. Four rows appear in the frozen raw-native-result envelope; its expected-ID ledger is only historically reported, so the bridge labels that evidence HISTORICAL_REPORTER_ATTEMPT_LEDGER rather than a new independent preregistration.

## New shared read-only bridge

[Cross-release native archive bridge](../../simulation/evaluation/agent41-archived-native-release-bridge.cjs) reads both actual envelope schemas, reconciles each row against its registered ID, and delegates **native engine outcome classification to Agent4's existing CI-verified canonical classifier** [native-attempt-disposition.cjs](../../simulation/evaluation/native-attempt-disposition.cjs). This avoids introducing another competing engine disposition vocabulary. Agent41's earlier parallel classifier is retained for historical regressions and a separate, conservative source-chain phase skeleton.

The bridge also enforces source-deal pairing independently of the native reporter: both named candidate identities must be present with internally consistent trial IDs and seeds; source and candidate physical seats must be verified, actual starter must agree, and authentic original-source physical-deal digests must match. Same seeds alone never suffice. Duplicated preregistered IDs, duplicated native rows, extraneous rows, incomplete pairs and unknown hashes each remain separately visible.

First original-source turns, physically held Boost Shake and selected native roots are separately tracked. The rank16 characteristic is first-turn Itchy Pollen or Boost Shake; rank6 is marked NOT_ASSESSED for that specific tactic. **Observing a first turn is insufficient to prove an eligible paper-playable source action**, so the earliest fully paper-validated opportunity phase remains missing until someone checks owner hand, target, locks, searchable cards and applicable rules. A subsequent opposing root by itself cannot certify a meaningful reply.

## Actual full-archive replay

| Result | Original rank16 | Frozen rank6 |
| --- | ---: | ---: |
| Expected / observed attempts | 16 / 16 | 4 / 4 |
| Native engine terminals | 9 | 4 |
| Native action caps | 7 | 0 |
| Missing, duplicate, extraneous attempt IDs | 0 | 0 |
| Exact source physical pairs | 7 | 2 |
| Nonmatching source physical pairs | **1** | 0 |
| First original-source turns observed | 16 | 4 |
| Rank16 first-turn Itchy Pollen / Shake chosen | **0 / 16** | not assessed |
| Rank16 first owner hand held Shake | **6 / 16** | not assessed |
| Independently paper-verified owner opportunities | 0 | 0 |
| Qualified competitive paper games | **0** | **0** |

The nonmatching rank16 registered pair is 16:1:B. The competing source physical digests are b3e6c428fe382fd04c6194cdb86767002a7d4aa0cd20521e1c4569957a1f89e1 and bd7428fe67f7bbc73962a90d00ad9b2f78e356477fa0586934e0bcbf92e3fe9d. Do not treat that pair as a matched physical-source comparison.

[Ten local Node regressions](../../tests/agent41-archived-native-release-bridge.test.cjs) pass, including the two genuine archive shapes, duplicate-registration attack, unrecognized candidate, changed physical fingerprint, differing first starter, missing trial, and a subsequent opponent Pass that cannot prove lock competence. Full native raw ZIPs were read locally without modification. These tests do not claim a new compiled CI run.

## Remaining release gate

Apply this reporting contract to a newly selected immutable cross-source common-policy release and secure an actually paper-eligible, owner-selected source characteristic action followed by validated cost/target/effect and a consequential opposing response from the same physical lineage. Both archived experiments remain unqualified. Global benchmark standing remains **29/32 authenticated original sixty-card lists, zero competitively qualified paper games, and no demonstrated 99.5% winning fixed deck**.
