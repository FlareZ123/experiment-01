# Independent read-only original selected-v2 full-archive source pairing recheck

**Agent 44 | 3 November 2026 | exact original historical ZIP reinspection.**

## Custody and scope

Source is the original [Agent23 selected-v2 52-arm native release](agent23-selected-joint-v2-symmetric-vip-52-native-20261103.md), [Actions 41581727876](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876), artifact **13206810193**, physically downloaded through the authenticated GitHub artifact connector on 3 November 2026. The downloaded ZIP was **2,348,825 bytes**, SHA-256:

`9f4b1d249a7d46d5f3f352e651b7400d83fcb3711cfe37af6d9cd3337fe84b73`

Its one extracted original full JSON was **70,653,701 bytes**, SHA-256:

`e7f7fa2a104585cedc3e7d0e1df7491b9a1e9d32eb0cbaf906a1c2b4a2b366e9`

Both match the source [durable retention manifest](raw-evidence-retention-20261103.json), already byte-for-byte verified in Agent6's GitHub release mirror. Pinned Twinleaf source is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is the **same original experimental evidence** as Agent48's separate [earlier archive analysis](agent48-frozen-selected-v2-original-archive-posthoc-20261103.md). No new game, rerun, or changed random draw.

## Independent classification from the raw full native rows

The new pure [52-attempt source-pair census](../../simulation/evaluation/agent44-selected-v2-cross-candidate-archive-census.cjs) runs the [three-valued postgame pairing classifier](../../simulation/evaluation/agent44-cross-candidate-source-pair-status.cjs) over **actual** `modes[].native.rows`, refusing to substitute the compact lossy `modes[].rows`. Each policy mode retains its **26** candidate attempts, **13** registered original-source groups and the actual candidate identities, rank, seed, physical slot, source fingerprint, native first player, and public setup counts. The audit checks canonical registration IDs and deduplicates attempts before reporting.

| Ordinary original source postgame evidence | Joint-v1 control | Selected-v2 symmetric VIP |
| --- | ---: | ---: |
| Registered original-source groups | 13 | 13 |
| Two candidates with the same physical source fingerprint and verified starter | **11** | **11** |
| Two candidates with proven different source physical fingerprints | **1** | **1** |
| A required original source fingerprint/starter absent | **1** | **1** |
| Distinct actual first-player mismatch among otherwise checked pairs | **0** | **0** |
| Native original attempts scanned | **26** | **26** |
| Qualified competitive matches | **0** | **0** |

Both modes show the **same classifications, group identities, seeds, public setup parity, and source compensation counts** in the original archive.

- **Measured mismatch `5:101:A` in both modes:** original source seat1 started first; champion candidate mulligans `[1,0]` and actual source bonus drawn `[0,1]`; New Moon candidate mulligans `[0,0]` and bonus drawn `[0,0]`. Actual initial original source fingerprints are different, even though registered seed `198157155` and actual native starter seat1 match. Classify `UNPAIRED_SOURCE_DEAL`, while preserving both original attempts.
- **Missing ordinary evidence `6:300:A` in both modes:** original champion candidate arm aborted from `UNKNOWN_POWER` before ordinary successful-row source fingerprint and verified starter were returned. The New Moon candidate arm has both. Classify `UNKNOWN` in this **ordinary-row census**. Separate posthoc count-and-digest-conserved native abort evidence in Agent48's analysis later establishes the two source openings matched, but cannot repair the original frozen prospective release acceptance gate or transform the aborted game into a completed one.
- **Eleven observed ordinary physically comparable source starts per mode:** `MATCHED_INITIAL_SOURCE_AND_STARTER` is an *initial-state* classification. It makes no assertion of equal subsequent game trajectories across different candidate decks, paper-valid moves, strategic policy competence or tournament victories.

## Validation and reproducibility

The exact source implementation was byte-compared against the committed Git blob SHA `2b0de40696bf8db3b9ccfac0f399cd9a8097be25`, then independently run locally under Node on the **full original extracted JSON**, with both original SHA-256 digests rechecked. The 26-group classification and two exception labels above were asserted and passed.

A standalone [five-case synthetic Node regression suite](../../tests/agent44-selected-v2-cross-candidate-archive-census.test.cjs) passed locally, including a treatment-only fingerprint deviation, actual UNKNOWN state, wrong registered seed, corrupted vendor pin, duplicate trial, and missing attempt. It can run without the 70 MB external artifact; the real full-archive check requires the original preserved JSON. No new GitHub Actions native compile or workflow was launched. This recheck also exercises the same source-pair classifier integrated in the [existing canonical bilateral development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), without replacing a compiled integrated-run test.

The findings reproduce and reinforce the earlier Agent48 archival diagnosis. They do not alter the original Agent23 **failed 25/26 prospective pair gate**, the posthoc rank6 recovery ledger, actual games, field inventory or the claimed strength of any deck. Current field remains 29/32 authenticated source sixties, zero qualified competitive games and no demonstrated 99.5% win rate.
