# Agent 26: compiled multiseed source-setup alignment result

**18 October 2026, 22:46 UTC.** Evidence type: actual pinned-Twinleaf opening-zone comparison, **not** a match or competitive win-rate estimate.

## Predeclared experiment and version

The [prospective input-order protocol](agent26-prospective-source-input-alignment.md) anticipated that rearranging resolved candidate card copies to align identical source printings with the published champion would make same-seed candidate openings more comparable. A predecessor run [39087408609](https://github.com/FlareZ123/experiment-01/actions/runs/39087408609) returned nominal CI success but **0/120** legitimate first-turn snapshots because the headless engine wrapped the deliberate stopping sentinel in `Error.cause`. Its numerical output was rejected. The follow-up implementation in [aichi-setup-only-capture.cjs](../../simulation/evaluation/aichi-setup-only-capture.cjs) recognizes only the exact private sentinel, directly or through that cause, restores the intercepted Store dispatch, and rejects ordinary engine errors. [aichi-multiseed-setup-coupling.cjs](../../simulation/evaluation/aichi-multiseed-setup-coupling.cjs) now throws if **any** preregistered arm lacks an actual opening capture.

The corrected, unchanged evaluation schedule was executed in [manual CI run 39173508976](https://github.com/FlareZ123/experiment-01/actions/runs/39173508976), GitHub main research SHA `c0eb7420aed2afc8f88cf99cc5f797be7b0bc75c`. It successfully compiled the pinned Twinleaf dependency under Node 20.19.0 and passed **99/99** source regression tests in that workflow stage. The full detached JSON is in [artifact 12153890364](https://github.com/FlareZ123/experiment-01/actions/runs/39173508976/artifacts/12153890364), archived ZIP digest `sha256:cfe7cf131ae4dcc198c1b6e812322eb67116a51fc804d118538264132e2ad575`.

For each of exact published opponent ranks **6, 8, 10**, run **four** prespecified v3 repetitions in each physical engine candidate slot A and B. Each rank/repetition/slot evaluates the published champion source 60 and both Hood Shield and Temple 60s once in source row order and once with copy-preserving reference alignment. This is **3 ranks × 4 repeats × 2 slots × 5 source input arrangements = 120 opening Store runs**, yielding **48** candidate/reference source-vs-aligned paired comparisons. The same predeclared v3 seed is reused across arrangements *within* a rank/repeat/slot, and independently chosen across these blocks via `deriveSlotSeeds(20261016,'pilot',rank,repeat)`. No player moves, opponent responses, or match endings are examined.

The `reference-aligned-v1` operation changes only the physical ordering of the candidate's input array and preserves its exact resolved 60-engine-ID multiset and printed 60-card inventory. Source-facing and hidden-zone measurements are kept outside policy inputs. The observed exposed-zone metric is multiset overlap between the champion's first-turn hand, Active and Bench card copies and the comparison variant's corresponding first-turn zones. The Prize metric counts matching card copies among the six hidden Prize cards. Both metrics are **comparability diagnostics**, never strategic performance scores.

## Compiled observations

The corrected run captured **120/120 valid first-turn Store snapshots with zero reported engine exceptions**. Every comparison matched the actual physical first-player assignment (48/48); each corresponding source-order/aligned pair preserved a byte-equivalent opponent post-setup zone digest (48/48).

| Opponent rank | Variant | Valid pairs | Mean gain in matching exposed copies | Mean gain in matching Prized copies | Exposed improve/tie/worse | Prize improve/tie/worse |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 6 | Hood | 8 | +2.875 | +2.625 | 8/0/0 | 8/0/0 |
| 6 | Temple | 8 | +3.625 | +3.375 | 8/0/0 | 8/0/0 |
| 8 | Hood | 8 | +3.000 | +2.500 | 8/0/0 | 8/0/0 |
| 8 | Temple | 8 | +3.875 | +3.125 | 8/0/0 | 8/0/0 |
| 10 | Hood | 8 | +3.000 | +2.500 | 8/0/0 | 7/1/0 |
| 10 | Temple | 8 | +3.250 | +3.500 | 8/0/0 | 7/1/0 |
| **All strata (descriptive)** | **Both** | **48** | **+157/48 ≈ 3.27083** | **+47/16 = 2.9375** | **48/0/0** | **46/2/0** |

The result supports one narrow engineering conclusion: in these predefined genuine Store source openings, maximizing shared printing positions increased the observed common opening/Prize-card overlap without changing the opponent's observed post-setup state or the turn order. The earlier ten-arm two-seed diagnostic is corroborated by the broader predeclared sample. It also supplies a reproducible, fail-closed setup-capture regression after the previously invalid 0/120 result.

## Limits, causal interpretation and next gating actions

1. **No games were played to completion by this sampler.** The deliberate sentinel stops before normal turn decisions. The number of competitively qualified Aichi games therefore remains **zero**; this result does not evaluate Hood, Temple or the champion's win probability.
2. These are **48 paired contrasts**, not 48 independent deck-strength outcomes: Hood and Temple reuse the same rank/repeat/slot seed and reference, and their paired counterfactuals share source inventories. Printed-card alignment is a deliberately stronger common-random-number construction, so consistently positive *overlap* is the experiment's intended mechanical behavior. Do not apply a naive independent-binomial sign-test interpretation to claim broad strength.
3. Captured exposed sets are **post-setup** and include optional mulligan-related draws/Bench placement; they are not necessarily the original seven. Prize identities are hidden K0 information and may be viewed by researchers solely to audit sampling. The captured cards must never be supplied to either game's player policy.
4. Reordering the input array must not silently change any 60-card list or source resolver. The actual early-game action policy and copied attacks, lock responses, Simulator cloning, and true full-game counterfactual comparability remain unqualified. Noninterference of the stop sampler outside its intended capture boundary is not established universally.
5. This comparison covers **three** source-backed opponent ranks. Exact source lists for ranks **23, 25, 28** remain missing, and the fixed-list **99.5%** target is unsupported.

**Decision:** The `reference-aligned-v1` protocol is suitable for *opt-in, explicitly labeled, source-inventory-preserving paired setup experiments*. It should **not** silently replace historical source-row-order runs, be pooled across protocols, or promote match outcomes without independent decision and opponent-response qualification. The next meaningful test is frozen, observed-decision noninterference and legal strategic continuation under each input-order protocol, not more initial-zone-only samples.

## Independent archived-byte verification

After the CI job completed, Agent 26 downloaded original archived ZIP artifact 12153890364 through the GitHub connector and verified its **exact SHA-256** against the upload log. The ZIP contains `aichi-multiseed-setup-coupling.json` (157,578 uncompressed bytes), raw JSON SHA-256 `9528d291a99f1cb0bd16911b7151a6e2c759249ce0c0c790113f1a0fef9e49ca`. An independent Python `zipfile` + `json` audit of those bytes reconstructed the count of **120 sample records / 48 comparison records**, **24 distinct frozen source seeds**, **120 captured states**, **0 recorded errors**, **48 same actual first-player pairings**, **48 identical paired opponent-zone hashes**, and exact mean improvement values in all six reported groups. Independently summed exposed-copy changes were **+157**, with **48 positive** and none zero/negative; Prize-copy changes were **+141**, with **46 positive, 2 zero**, none negative. This corroborates the job's compact stderr summary from the downloadable evidence rather than relying on the CI success badge alone. It does not independently validate Twinleaf's rule implementation or the physical fairness of its RNG.
