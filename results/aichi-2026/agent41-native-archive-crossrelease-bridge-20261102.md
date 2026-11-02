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


## New physical-pair mechanism: opponent mulligan and setup-dependent source-deal drift

Root-ledger comparison across the **eight actual rank16 registered seed pairs** now establishes a sharper distinction. For 7/8 pairs the source physical fingerprints and the relevant setup-prompt histories both match. In the only mismatching pair, 16:1:B, the legacy field named **sourceFirstOwnHandSha256 is identical** across champion-reference and New Moon, while the actual original-source physical-deal SHA-256 differs. A new source-code audit below shows that the legacy hand hash can be captured **during setup**, so actual first-live-turn hand equality has **not been certified**.

The accepted setup root sequence is different:

| Rank16 pair 16:1:B | Champion-reference opponent | New Moon opponent |
| --- | ---: | ---: |
| Candidate physical deck ShuffleDeckPrompt actions at setup | **2** | **1** |
| Total setup ShowMulliganPrompt root actions (both seats) | **2** | **0** |
| Setup-phase ResolvePromptAction root count | **11** | **6** |
| Legacy sourceFirstOwnHandSha256 (possible setup hash) | same | same |
| Source full physical-deal SHA-256 | **different** | **different** |

In the champion-reference arm the opponent's additional setup shuffle and the source's observed post-mulligan SelectPrompt / ChooseCardsPrompt occur before the first turn. The New Moon arm lacks those events. In the other seven pairs, both source and candidate setup-shuffle prompt counts match and the source physical digests are equal. This is a strong **association of the source-deal drift with different opponent mulligan/setup histories**, without a controlled causal proof of how Twinleaf consumed its random-number streams or how much came from compensation draws versus order of Prize placement.

The critical experimental lesson is that **matching the legacy early source-hand hash cannot certify a matched physical source deal or actual first-live-turn hand equality**. Prize cards, draw-pile order, setup Bench placement and follow-on draws must be authenticated separately. The corrected bridge exposes per-seat native setup prompt counts, **legacy early source-hand hash equality**, and a different-source-deal veto with **actualFirstLiveOwnerHandEqualityCertified:false**. Its local test suite now passes **12/12** cases, with full-archive replays rechecked on both unchanged ZIPs. No new CI or paper game was executed.

## Further source-code audit: the misleading hand-hash timing

The historical rank16 reporter computes `sourceFirstOwnHandSha256` using the first `game.decisionTrace` entry with the source actor's hand. Its `find` predicate **does not require the source's actual first playing turn**, and `simulation/twinleaf/headless.cjs` records `ChooseCardsPrompt` resolutions in `decisionTrace` even during setup. In both original `16:1:B` arms, source seat A has a genuine `turnBefore:0` `ChooseCardsPrompt` root at ordinal 4, preceding the opponent mulligan bonus prompt at ordinal 9 in the champion-reference arm. That first recorded source decision is therefore setup-phase and the resulting legacy digest should not be called a live-turn first-owner hand fingerprint.

The archived real Store setup-compensation audit resolves the mismatch independently: **champion-reference opponent mulligans [0,1], source bonus offered 1, selected 1 and drawn 1**, while New Moon shows mulligans [0,0] and zero setup bonus cards. Both runs have source initial deal prize counts six, source initially second, and original printed source sixty unchanged. The source-deal digest differs. The recorded source first-own-turn resource **counts** come from a separate genuine first-own-turn observer and are equal on the named cards, but that count map cannot establish full physical hand equality. The confirmed causal *timing* is opponent mulligan and resulting source bonus before the source first live turn; the precise seeded random-stream/draw order producing the source-digest difference remains unproved.

**Correction to prior report wording:** all references above to equal early owner-hand hashes are restricted to the legacy, potentially setup-phase field. The bridge now labels it `sameLegacyEarlySourceHandSha`, keeps `legacyDigestMayBeSetupPhase:true`, and explicitly records `actualFirstLiveOwnerHandEqualityCertified:false`. This correction prevents a false same-hand hypothesis from being propagated to the next selected policy release. The source-deal mismatch and setup-compensation receipts remain independently verified.
