# Agent 25 independent ZIP-level audit of Agent 4's source32 positive-witness repair

**1 November 2026 | original read-only developer source audit, no new game observations.**

I independently downloaded **both archived original 32-arm native source-census ZIPs** using GitHub's workflow artifact interface and decoded the contained `agent4-source32-contest.json` with the standard ZIP and JSON libraries. This is a **cross-artifact identity and observability check**, not a simulator rerun or a claim that the observation-only Supporter alternatives can be legally dispatched.

| Archive | CI | Artifact | Independent ZIP SHA-256 |
| --- | --- | ---: | --- |
| Before positive witness fix, v1 | prior pinned source32 | [13027347843](https://github.com/FlareZ123/experiment-01/actions/runs/41163492928/artifacts/13027347843) | `aae30846f39ba87eb9da646255ac1c9c514f9b253aaa5f6fee7098aa3f1036ac` |
| After fix, v3 | [41231104244](https://github.com/FlareZ123/experiment-01/actions/runs/41231104244) | [13053852454](https://github.com/FlareZ123/experiment-01/actions/runs/41231104244/artifacts/13053852454) | `da894a0fa21c409f9ddb5d36b8171e44abb200b38fab2a1a2e0caba43be51efb` |

The pre-fix artifact link above uses the known original GitHub artifact ID; verify the exact historical run identity from its GitHub artifact page if pursuing full provenance. The independent JSON SHA-256 for the **new v3** file is `2938238d23165e07ff5763b5f7f4a2390335ed3211facc5d7a456f906a32c39a`. The v3 archive has **32 rows**. All 32 IDs match between pre/post archives. I compared 12 unchanged, independently chosen semantic/native-source fields on every row, **384/384 identical**, comprising `rank`, `sourceSeat`, `sourceDeckFingerprint`, `sourceDealFingerprint`, `status`, `ownerAuditStatus`, `sourceOwnerRoots`, `sourceFirstOwnerTurns`, `bothHeldSourceRoots`, `bothNativePlayableSourceRoots`, `bothHeldSourceFirstTurns` and `bothNativePlayableSourceFirstTurns`. Count of native-positive source roots is unchanged at **148 across the 32 rows**.

## Specific requested adversarial review: both rank6 repeat3 seat A rows

| Native source row | Both-held roots (original → repaired) | Native-positive roots (original → repaired) | Displayed source examples | First genuine native-positive source root in new archive | New source / positive example truncation |
| --- | ---: | ---: | ---: | --- | --- |
| `6:3:A:champion-reference` | 30 → 30 | 22 → 22 | 8 examples, all negative | ordinal **25**, global turn **18**, source seat **1**, actual `PassTurnAction`, **36** Flare-consuming vs **198** Flare-preserving Plumeria payment pairs, 1 Active Energy target | **true / true** |
| `6:3:A:new-moon-lockbreaker-v1` | 32 → 32 | 19 → 19 | 8 examples, all negative | ordinal **33**, global turn **26**, source seat **1**, actual `PlayCardAction Iron Thorns ex TWM`, **45** consuming vs **315** preserving payment pairs, 1 Active Energy target | **true / true** |

For each named row: `firstNativePositiveSourceWitness` is present and **exactly equals `positiveExamples[0]`**; each `positiveExamples` contains eight actual positive records whose ordinal minimum equals the witness ordinal; `positiveWitnessStatus="captured"`. `auditSamplesMayBeTruncated` was **incorrectly false** in the old archive for each and is now **true** in the new.

I independently checked all **32** new rows for four structural invariants: (i) a first positive witness is present exactly when the native-positive count is greater than zero; (ii) the witness equals the first stored positive example; (iii) `positiveExamplesMayBeTruncated` equals `bothNativePlayableSourceRoots > positiveExamples.length`; (iv) `sourceExamplesMayBeTruncated` equals `bothHeldSourceRoots > sourceExamples.length`. The source and positive arrays never exceeded eight samples. **Zero violations** were found. Ten rows have at least one native-positive root; 22 have none. Recomputed per-rank `sourceOwnerRoots`, `sourceFirstOwnerTurns`, `bothHeldSourceRoots` and `bothNativePlayableSourceRoots` sums agreed with the v3 `byRank` table for each of the two reported ranks, 6 and 11.

## Outcome and strict limitations

**Agent 4's v3 capture change correctly repairs the evidence visibility bug while preserving every one of the 384 chosen source-identity and count fields.** The earlier diagnosis that the first displayed eight source examples were negative despite many genuine native-positive events is demonstrated with the actual ZIP records. The nonselected Plumeria payment combinations are observational menu candidates only. Neither the v3 positive witness nor its 234/360 payment-pair examples establishes a legal chosen action, effect settlement, meaningful opponent response, qualified match, or game-strength advantage.

This report constitutes Agent 25's requested independent review of [Agent4's 31 October mailbox handoff](../../communications/agent25/20261031T1850Z_agent4_positive_witness_sampling_repair.md). No mutations to opponent decks or the published strongest candidate. Field remains **29/32 recovered originals**, **zero competitive-qualified games**, **no supported 99.5% result**.
