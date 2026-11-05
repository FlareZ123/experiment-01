# Issue 25 native baseline A/A negative control: reproducible original-input and post-choice state

**Agent 1, 5 November 2026.** **Evidence type:** pinned native repeated execution, limited eight registered trials. **Competitive games qualified: 0.** **Causal winning effects: none established.**

## Question

The v8 initial setup comparison had found two different post-choice source physical digests under the all-Basics versus owner-held-turn-entry-support opening policy, despite 16/16 native input and pre-run request parity. Could the same after-choice divergence arise without changing the opening policy, simply because two headless native replays with matching seeds and registered deck lists are not deterministic?

An A/A test is the relevant negative control. The same native baseline opening policy, same source/opponent printings, same source seat and first-player choice, same seeds and common execution wrappers are replayed twice with the same frozen eight trial IDs. The control tests deterministic replay under this one declared actor stack, without changing a setup policy.

## Method and provenance

`tests/agent1-issue25-baseline-sham-v9.native.test.cjs` calls `runPrechoiceCustodyV8('baseline')` twice synchronously within the same Node process. The pre-choice owner-observing hook independently records each native `runMatch` registered trial label, physical owner-seat card inventory, exact printed sixty multiset, owner-private process-keyed HMAC of the randomized hand/deck/Prize order, HMAC of the exact pre-run headless request and the native initial first-player assignment.

The test joins by **registered trial ID and physical owner seat**, never by Store allocation ordinal. Public receipts contain only paired Boolean comparisons and counts. No raw hidden card names, hand order, Prize identities, private HMAC digests or keys are written to disk. The two native campaigns are run using identical baseline policy wrappers. For each ID, the test additionally compares the post-choice source physical digest, trial completion/error status and native root-action count. It archives a sanitized JSON receipt with an SHA-256 content digest.

**Pinned environment:** Twinleaf Git `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compiled via the repository submodule and `npm ci`.

**CI:** [successful run 41940921725](https://github.com/FlareZ123/experiment-01/actions/runs/41940921725); [sanitized archived artifact 13376082623](https://github.com/FlareZ123/experiment-01/actions/runs/41940921725/artifacts/13376082623), content SHA-256 `dfdadfd827797620dd58dd6e99299c3562bab24731ed4168e91628d4012730cb`.

## Observed native results

| Compared diagnostic | Equal/verified | Scope |
| --- | ---: | --- |
| Genuine before-choice owner physical inputs | **16 / 16** | 8 registered trials, 2 physical owner seats |
| Same serialized native pre-run request | **16 / 16** | Both decks' configured 60 card strings, seed and options |
| Both genuine physical owner printed sixties valid | **16 / 16** | Each pair contains 2 correctly staged actual native printed 60s |
| Native first-player seats unchanged | **16 / 16** | Independent setup-prompt observation |
| Same post-choice source physical digest | **8 / 8** | One source digest per registered native trial |
| Same trial status | **8 / 8** | Includes repeated engine error |
| Same native root-action count | **8 / 8** | Includes censored/returned-unqualified games |
| Qualified competitive games | **0** | No paper-valid win-rate inference |

Six? Actually the eight statuses were: seven `returned-unqualified`, one `engine-error` (rank 11, trial `11:102:A:champion-reference`). Error and unqualified statuses are deliberately retained; they are not categorized as wins, draws, legal games, or opponent failures.

## Interpretation and constraints

For these *specific eight registered native source/opponent/seat/seed arms*, the repeated baseline stack produced no post-choice source-deal drift, and the visible statuses and root-action counts reproduced exactly. This rules out observed A/A nondeterminism in the measured quantities on these eight seeds. It increases confidence that the two changed post-choice physical source digests in the separate baseline-versus-protected v8 pair are genuinely related to that declared different execution configuration. The A/A check by itself cannot prove that the *only* actual code difference was the intended opening chooser, or that those differences increased win probability. Full executing non-treatment closure is still `UNRESOLVED`.

This is an eight-seed negative control, not statistical proof that the simulator is deterministic for every seed, policy, card or game state. It also says nothing about whether a bot made strategically competent moves, completed a representative paper game, won a match, or improved the 99.5% all-Top32 objective. The benchmark field still has only 29/32 authenticated exact source lists.

## Repeat and extend

Manual isolated workflow: `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml`. Native test and archived evidence: `tests/agent1-issue25-baseline-sham-v9.native.test.cjs`. Before-choice observer: `simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs`. Protected-vs-baseline prior report: `results/methodology/agent1-issue25-v8-native-prechoice-trial-join-privacy-20261104.md`.

Next reproducibility checks could rerun the same control under the protected policy (A/A), increase seeds and matchup variety, trace first-actual setup placement before turn actions, and independently certify the executing wrapper closure. Do not promote these diagnostic native trials to competitive performance.
