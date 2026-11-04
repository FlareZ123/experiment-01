# Issue25 selected v3: second native artifact resolves abort-root custody, retains a physical-seat provenance gap

**Agent 10, 4 November 2026 | independent read of genuine selected-native CI 41881287898 | development only.**

## Exact immutable evidence

I independently downloaded [actual native CI 41881287898](https://github.com/FlareZ123/experiment-01/actions/runs/41881287898), whose selected source revision is **f8e4135c317d7dfbd51b2cf18b1372fac004e595**, and [artifact 13348763176](https://github.com/FlareZ123/experiment-01/actions/runs/41881287898/artifacts/13348763176). Native report observes Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. The actual ZIP bytes independently hash to SHA-256 **d2ec8c2015877aafb676cd17929d2cad61d07a60ff30a355cb477e51cb0d212d**; the new JSON is **89,802 bytes** with SHA-256 **36801480e08c9e54e752bf97fe3092fd66213f678f1acc6218cdf97275e78068**. The included SHA256 sidecar exactly matches the downloaded JSON byte hash.

This archived execution is later than [the first v3 artifact](agent10-issue25-first-v3-artifact-independent-custody-audit-20261104.md) and its exporter includes Agent 7's subsequent abort-root fallback and reported digests. It is a **different compiled CI revision**. None of the later fields are retrospectively attributed to CI 41876842531.

Independent proof is supplied by the actual JSON and [Agent 10's reusable independent consumer](../../simulation/evaluation/agent10-issue25-receipt-independent-audit.cjs). It recomputes public root-list SHA-256, verifies action ordinal/count/limit and published engine digest, compares the full three-array attempt ID join, and checks original-source deal fingerprints across both contender contexts.

## Actually observed four-attempt root custody

| Original rank and contender | Actual disposition | Downloaded roots | Independently verified SHA-256 of root list |
| --- | --- | ---: | --- |
| 6 / champion reference | Nonterminal at native cap | 48 | 0728b7f0b150f0edaee0f147e99de9775fd7c8465dbc843e700484b3ad34c9b3 |
| 6 / New Moon | Nonterminal at native cap | 48 | c710cace6c14375ed701e60a15e9617ad6c612835c37c628a69c67f1f2e06bc4 |
| 11 / champion reference | Engine-error at ATTACK prompt | **17** | 6acb51a7ac1c4be750aabddf9fdace9827f24afcb134d485e8daa0e5b0fdf146 |
| 11 / New Moon | Nonterminal at native cap | 48 | 68da7cc849414981257a527f99a28bd09368b19cdd3698fd7aea13baa63e7d58 |

**PASS:** all four full public root lists exist, have actionOrdinal 0 through n-1 without truncation and have native root count equal to archived count; each freshly computed hash equals **both** the receipt's computed and runner-reported digest field. Registration IDs are four unique exact matches with actual raw IDs; source-only physical-deal fingerprint and first-player seat match within each rank's two-contender comparison. Rank6 source digest 2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1; rank11 9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5.

**New narrower UNRESOLVED:** the **rank11/champion-reference engine-error row** still records source-seat and candidate-seat as **null** in the exported attempt. Its nativeAbortProvenance independently reports sourceSeat **0**, and its recorded actualStarterSeat is **1**. Source/candidate seats in the principal attempt row are absent, even though the abort evidence may permit corroborated reconstruction. The archived native action 16 is a source-stamped Get Lost attack; archive root action custody is now complete, and the subsequent unhandled attack prompt remains a real engine-error, with no invented native response.

The independent consumer was strengthened after first execution to report explicit per-attempt **seatAttribution** status, separate from complete root action custody. It marks the second archive **rootCustody PASS**, **seatAttribution UNRESOLVED**, hence **overall evidence custody UNRESOLVED**. It refuses to infer direct source/candidate-seat evidence from a registered rank or a separate abort claim without a documented provenance path. Additional pure adversarial tests verify missing and contradictory seat attribution.

## Proposed precise next release step

Agent36's selected-v0 common status collector currently reads sourceSeat and candidateSeat from the raw returned row; when the native run aborts, those ordinary row attributes can be absent even though nativeAbortProvenance carries a verified sourceSeat. The accountable release steward should preserve explicit distinction between **direct row seat** and **native abort source-seat attestation**, and where a candidate seat is derived by a two-player complement label that derivation. Re-run the selected genuine four arms after fixing the exporter; check full physical deal, owner-visible decisions, accepted root, paper payment and native error/cap without converting any to wins.

Even complete receipt custody **does not** certify equal player policies, concealment-safe fallback, paper-legal effects, competent continuation, 25-minute paper clock or 32 authenticated original competitors. The shared target remains **0 competitively qualified games**, original inventories **29/32**, no final fixed 60 or credible 99.5% win-rate evidence.

**Tests and compiled CI status:** the first 11 adversarial receipt tests passed compiled [manual stats CI 41882277082](https://github.com/FlareZ123/experiment-01/actions/runs/41882277082) SUCCESS together with the repaired Sentinel probability suite. Twelve tests (including empty-receipt guard) and then fourteen (including seat-attribution cases) passed locally in Node 22 after that CI revision; their later changes require a new compiled CI run before claiming equivalent remote coverage. No new workflow was created.

## Independent third-run exact root reproducibility (additional check, not a new game population)

The later native [CI 41882814279](https://github.com/FlareZ123/experiment-01/actions/runs/41882814279), checkout 33029da7fdb9012143e90c26e8d1385b12da18c5, [artifact 13350785408](https://github.com/FlareZ123/experiment-01/actions/runs/41882814279/artifacts/13350785408) was independently downloaded. Raw ZIP SHA-256 **9d679d0cf7ccb1b9b60ddbbeef3364389588a649cdf47486831bef74039de308**, JSON SHA-256 **976323584b0627e689a2a80fb2ba54451aede38693332fc9a1132a4bc6b675b9**, 89,802 bytes. Its observed loaded-module digest **fc7f3e36aced2440ad105d579e6f47b09753bb13580eb098f70208705342ee44** differs from CI 418812's module digest **bf1f4f0ac2efd456f0aa1d49f987b914278947827e815e98d1bad45ed7cbc3f7**, because the research revision changed.

An independent comparison of the two saved raw JSON objects found only top-level provenance and selectedExecutingManifest differences. **All four public attempt rows are exactly equal** across the two separate compiled executions: same authentic native source-only fingerprints, raw accepted actions, SHA digests, failures and caps. Rank-11 abort source/candidate seats remain null in both, with the same separate verified native abort sourceSeat0. This is useful consistency evidence for the frozen selected-v3 development profile, with no new game outcomes and no release qualification.

**Further attribution interpretation:** The separately verified abort sourceSeat0, peer original sourceSeat0/candidateSeat1, matching source-deal fingerprint and starter seat support an **explicitly labeled inference** that the aborted row's physical source is seat0 and the candidate is seat1. This derivation should be shown as inferred from named native evidence, rather than silently replacing null directly observed fields. It reduces factual ambiguity about orientation, though the stored direct-row fields are still absent, so the independent module conservatively reports row-level direct seat-custody UNRESOLVED pending a provenance-aware normalization. Full paper-game and decision-policy qualification remains false.
