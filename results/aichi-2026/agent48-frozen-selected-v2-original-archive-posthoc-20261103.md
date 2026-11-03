# Real archived selected-v2 52-arm source-deal forensic recheck

**Agent 48 | 3 November 2026 | verified archive-level result, no new game played**

## Evidence provenance and method

The previously completed [Agent23 frozen selected joint-v2 native release](agent23-selected-joint-v2-symmetric-vip-52-native-20261103.md) was retained unchanged in the [original compiled run 41581727876](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876), artifact **13206810193**, 52 native attempts on 26 original candidate contexts. The full JSON uncompressed artifact has SHA-256:

`e7f7fa2a104585cedc3e7d0e1df7491b9a1e9d32eb0cbaf906a1c2b4a2b366e9`

The new [read-only, no-engine, manual-only archival recheck workflow](../../.github/workflows/agent48-selected-v2-archive-audit.yml), [GitHub Actions run **41595650357**](https://github.com/FlareZ123/experiment-01/actions/runs/41595650357), **SUCCESS**, checked out head `1da4b38a347c1e8f1cb10aaafadfe1a635ccb9f7`, downloaded the original immutable artifact via its original run and artifact IDs, verified eight abort-source test cases and six cross-candidate source-parity cases, and ran [the digest-only archival analyzer](../../scripts/agent48-inspect-selected-v2-archive.cjs). No native Pokémon game or new shuffled deal was generated.

The source parser [`agent48-archive-selected-v2-census.cjs`](../../simulation/evaluation/agent48-archive-selected-v2-census.cjs) explicitly checked the frozen archive schema, vendor pin, **52** attempts, **26** candidate contexts, **13** registered physical seed groups, original **25/26** release gate and zero competitive-qualified games. Its live scan used actual raw `modes[].native.rows` rather than the lossy compact `modes[].rows`.

## New finding 1: the historically censored rank6 original deal was physically matched

The sole existing failed preregistered physical-source pair, `6:300:A:champion-reference`, remained a symmetric original `UseAbilityAction: UNKNOWN_POWER` **engine abort** in control and selected modes. Both raw error rows have an independently recorded `nativeAbortEvidence.sourceDealFingerprint` captured on the first stable player-turn root. The [posthoc verifier](../../simulation/evaluation/agent48-aborted-source-pair-posthoc.cjs) found:

| Evidence predicate | Baseline | Selected |
| --- | --- | --- |
| Authentic native abort receipt | Yes | Yes |
| Source physical seat | 1 | 1 |
| Native physical-source SHA-256 present and valid | Yes | Yes |
| Original first source-deal digest equal | **Yes** | **Yes** |
| Native accepted Store root ledger count and digest conserved | Yes | Yes |
| Native setup coin, first-player choice and first draw verified | Yes | Yes |
| Real first-player seat equal across arms | **Yes** | **Yes** |
| Original game completed | **No** | **No** |

The machine emitted `baselineStatus:'SOURCE_DEAL_AND_STARTER_VERIFIED'`, `selectedStatus:'SOURCE_DEAL_AND_STARTER_VERIFIED'`, `sameInitialSourcePhysicalDeal:true`, `sameVerifiedNativeStarter:true`, `posthocPairParityCertified:true`, `nativeGameReplayed:false` and `competitiveGameQualified:false`.

**Interpretation:** the original 25/26 verdict represented *unavailable ordinary result-path source provenance*, not a demonstrated physically different source deal. This newly inspected independent abort-side evidence establishes initial original source physical parity and starter parity for the censored pair. The original release's **failed acceptance remains failed under its immutable prospective criterion**, and neither failed game may be converted into a successful terminal or win. The previously published 52-arm release report and artifact are untouched.

## New finding 2: equal seed failed to preserve original source deal across fixed candidate decks

Each of the 13 registered original source seed groups was executed for both printed fixed candidates, champion-reference and new-moon-lockbreaker-v1, within each policy mode. The new read-only comparison asked a different, previously underreported question: **did those two different fixed candidates face exactly the same initial original source physical deal?** The real first-player information was compared independently.

| Mode | Groups with two ordinary source digests | Matching source deals | Different source deals | Ordinary source digests unavailable | Matching verified starters |
| --- | ---: | ---: | ---: | ---: | ---: |
| Joint-v1 control | 12/13 | 11 | **1** | 1 | 12/12 |
| Selected-v2 symmetric VIP | 12/13 | 11 | **1** | 1 | 12/12 |

The **same group `5:101:A`** has **different source physical initial fingerprints across champion-reference and New Moon** in *both* modes, despite both candidate contexts being registered with the **same seed** and their real first-player seats matching. This is a direct counterexample to using a common RNG seed as an assertion of cross-candidate original-source deal equivalence. A physically paired candidate-minus-reference result **cannot be claimed for that particular group**, even though its within-candidate control/selected policy comparison was correctly source-matched.

The `6:300:A` cross-candidate group was still marked `physicalUnknown` under the baseline parser's deliberately conservative success-row-only cross-candidate audit because the champion-reference row was aborted. The recovered abort-side fingerprint can be compared against the **other candidate** in a separately labeled extension, without changing any historic release acceptance. No change has been made to that group's cross-candidate classification in the source data.

All other 11 observed groups matched their source-deal fingerprints across candidates in both modes. The matched/not-matched counts here are properties of archived initial physical source positions, not estimates of game strength, causal policy benefits or a representative independent cohort.

## Separate complete posthoc cross-candidate census from native abort-side custody

A second independent, read-only archival run [41596127865](https://github.com/FlareZ123/experiment-01/actions/runs/41596127865), **SUCCESS** at exact research head `49ca25e4be30b9e3062554838d0b19e53d1eeb1c`, re-downloaded the same original immutable 52-attempt artifact (the JSON SHA-256 remained `e7f7fa2a104585cedc3e7d0e1df7491b9a1e9d32eb0cbaf906a1c2b4a2b366e9`). Sixteen pure audit cases passed. Its optional posthoc mode now applies the exact validated native-abort source fingerprint to the historically censored **cross-candidate** rank6 group `6:300:A`. It leaves the success-row-only summary and frozen experiment unchanged.

| Distinct comparison and evidence level | Joint-v1 control | Selected-v2 VIP |
| --- | ---: | ---: |
| Registered cross-candidate source seed groups | 13 | 13 |
| Source groups with either original successful-row or independently verified abort-side physical digest and starter | **13/13** | **13/13** |
| Cross-candidate source opening physically matched, with verified same starter | **12/13** | **12/13** |
| Cross-candidate source opening **mismatched** (`5:101:A`) | **1/13** | **1/13** |
| Unknown source-opening parity after permitted posthoc recovery | **0/13** | **0/13** |
| Source groups requiring the abort-side digest recovery (`6:300:A`) | 1 | 1 |

Thus, the **rank6 `6:300:A` original source initial physical deal actually matches across the two candidate decks in each mode**, as well as across the baseline/selected modes for the aborted champion-reference context. This conclusion depends on the direct, count-and-digest-conserved native abort-side Store evidence plus the accepted native coin, player choice and first draw for the originally failed row. It is a **retrospective, narrower source-opening parity finding**. The original registration's 25/26 full-row successful provenance remains an explicitly failed gate, and the candidate-vs-candidate `5:101:A` mismatched initial source opening is still genuine in *both* modes.

This second confirmation closes all 13 **initial original-source physical opening comparison identities** for the frozen sample without rerunning any games. It does not repair a game ending in `UNKNOWN_POWER`, guarantee later game state parity or provide any new competitive game. The archival analyst emits both ordinary-source-only and explicitly recovered posthoc ledgers so their evidence thresholds cannot be confused.

## Consequences for the single-deck decision

- Preserve each within-candidate control/selected comparison, including the negative rank11 `Claw of Darkness` 4→0 response trajectory, under its own physical-deal proof.
- Exclude `5:101:A` from **physically matched candidate-versus-candidate** comparisons. It may remain descriptive development evidence with explicit cross-candidate source-deal confounding.
- Keep the historic `25/26` acceptance gate unchanged; separately note that the censored rank6 original physical parity has now been positively recovered using abort evidence.
- Design future comparative source benchmarking to verify both matched *policy mode* arms and matched *candidate deck* arms at the original source physical level. Equal seeds are insufficient.
- Maintain **29/32** authenticated original printed opposing sixties, **zero competitively qualified games**, no selected fixed 60 and no supported 99.5% win rate.

This finding does not address full paper effect fidelity, active timer, source/candidate bot competence, independent lossless Store action bindings or hidden information safety. The archive remains a frozen developmental experiment.
