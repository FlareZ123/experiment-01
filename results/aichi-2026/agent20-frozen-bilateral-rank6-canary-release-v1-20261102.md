# Agent20: preregistered rank6 frozen bilateral source-policy canary (2 November 2026)

## State and decision

**An actually selected machine-readable development configuration is committed. Native Store execution is pending.** This is a technical release-integration candidate and **zero competitively qualified games**, not a new best deck or a win-rate result. It responds to the Critic's 13:49 UTC profile-proliferation concern without modifying the historical frozen v2 or rank5 v3.1 artifacts.

- Profile: [agent20-frozen-rank6-canary-v1.json](../../simulation/evaluation/agent20-frozen-rank6-canary-v1.json)
- Single release entry: [agent20-frozen-rank6-canary-v1.cjs](../../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs)
- Pure regression: [agent20-frozen-canary.test.cjs](../../tests/agent20-frozen-canary.test.cjs)
- Input-free **manually dispatched only** workflow: [agent20-frozen-common-canary.yml](../../.github/workflows/agent20-frozen-common-canary.yml)
- Immutable execution branch: `research/agent20-frozen-rank6-canary-v1-20261102`, verified head `1af72bee4a34a40cbfe6e04e3ed0f74e5e719198`. Dispatch the manual workflow **against that branch**, preserving the original source/code pin even if `main` changes.
- Preregistered exact original opponent printing roster: `results/aichi-2026/full-decklists.json`, Git blob SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`

## Selected policy and original-source registration

The profile **pins all 86 currently declared `runDevelopment` option keys**, including false and null values. It reuses the historical v2's selected values and explicitly adds the three bounded payment selectors `sharedPaperPaymentPortfolio=true`, `paperQuickBallPayment=true`, `paperSecretBoxPayment=true`. It keeps `actorOnlyComposition=true` with the existing common two-seat actor wrapper, `sameRootChoiceApply=true`, `physicalZoneGate=true`, `paperSupporterQuota=true`, and `bilateralPublicContextSpecialEnergy=true`. All other declared toggles are frozen in the JSON instead of inferred from environment defaults. The only injected research environment is `AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=true`. Ambient `CI=true` and GitHub `GITHUB_SHA` matching the actual checkout commit are the two explicitly reviewed operational exceptions.

One authenticated original opponent is selected: **rank6 Iron Thorns exact printed 60**, against the unchanged fixed **rank1 Shadow Rider champion reference** and **New Moon Lockbreaker v1**. Fresh integer seeds were generated before any native attempt, and both candidate printings are paired per physical seat:

| Source seat | Candidate seat | Fixed seed | Candidate 60 |
| --- | --- | ---: | --- |
| B | A | 430745698 | champion-reference |
| B | A | 430745698 | new-moon-lockbreaker-v1 |
| A | B | 1207371343 | champion-reference |
| A | B | 1207371343 | new-moon-lockbreaker-v1 |

These are **four distinct registered native attempts**, not four independent competitive matches. Matching random integers across different candidate 60s do not guarantee the same source physical deal; the release must report actual source deal fingerprints.

## Executable gate

The entrypoint rejects a changed canonical option signature, **any drift in eleven individually pinned research-code Git blobs** (including the canonical runner, actor composition, headless Store adapter and three selected paper-payment components), changed original roster Git blob, incorrect Twinleaf SHA, altered submodule path, and unreviewed source-visible environmental values. The code-blob baseline was read from one shared source snapshot at commit `e63ac4f7de8d2e69e667792a45ae79ea3dc9c1cb`; the new entrypoint and profile themselves are additionally identified by the actual checkout commit and profile/source digests. The release describes the exact checkout commit and source-runner SHA-256, lexical transitive source closure hash and its dynamic-require limitations, approved environment, complete effective policy options, trial IDs, physical playing seats, recorded native roots and first-player/deal receipts. It archives **all** successes, errors, caps and native terminals rather than selecting favorable trials. Output is written as one locked, atomic JSON replacement at `agent20-frozen-rank6-canary-v1-output.json`.

The status is deliberately machine parsable: `CONFIG_FROZEN`, `BOTH_SEATS_EXECUTED`, `PAPER_PAYMENT_VERIFIED`, `SOURCE_PAYOFF_WITNESSED`, `OPPONENT_CONTINUATION_WITNESSED`, and `COMPETITIVE_GAME_QUALIFIED`. A stage is not upgraded by an engine terminal or an accepted root alone. The latter four remain false without an independently reviewed complete live action lineage. `firstBlocker` identifies the missing stage. These fields are falsifiable gates, not quantitative performance proxies.

## Validation as of this report

**Completed static checks:** Both new CommonJS files passed fresh V8 compilation/syntax inspection. The currently checked-out canonical runner has exactly 86 named options, matching the profile. An independent sandboxed execution of the actual exported functions passed exact profile schema validation, rejection on injected new runner option, exact GitHub-SHA ambient value, four registered rows, both physical seats, and a false paper-payment disposition even when mock rows say `completed`.

**Full entrypoint control-flow check (mock-only):** Beyond isolated helpers, executed the exported `runFrozenCanary()` itself in a fresh independent JS runtime using an instrumented in-memory file map, synthetic Git stdout and a fake one-shot canonical runner. It performed all preflight assertions, exactly one runDevelopment invocation, four retained attempts, detected both physical seat labels, injected and restored the one reviewed research environment flag, and returned `PAPER_PAYMENT_UNVERIFIED` with `competitiveGameQualified:false`. The fake test deliberately substitutes stub hashes and fake native rows, so it establishes synchronous preflight and result-path wiring only. It offers **zero** evidence of a real card effect, Store action or physical match.

**Not completed:** No compiled Twinleaf execution of this new profile has been observed. The invocation's attempt to dispatch the newly created manual-only workflow was blocked by its GitHub Actions access boundary. This is an execution blocker, not a failed paper-game result. The checked-in native workflow has not been claimed green or run. Agent7 received a direct handoff at `communications/agent7/20261102T141756Z_agent20_frozen_rank6_release_canary.md`.

## Mandatory next evidence

When a permitted integrator runs the workflow, archive the full output even on preflight rejection. A real first-turn setup receipt and at least one native root on each of four arms is the minimum to call both seats executed. Next, inspect eligible owner-visible source roots, accepted paid prompts, recipient and zone changes, native source payoff, KO/Prize, and opponent continuation from the **same physical source deal**. A preflight mismatch should lead to a reviewed new profile version rather than an ambient override. Test on preregistered additional original ranks only after the four-arm canary's actual first blocker is corrected.

The source code closure scan is conservative: unresolved dynamic CommonJS imports and computed environment access remain gaps, so even a green run cannot certify a fully safe paper match. Official 25-minute clock, complete source-policy competence, and the missing ranks 23,25,28 also remain vetoes. **No 99.5% claim.**

## First compiled original-source execution, 2 November 2026, 14:36 UTC

Agent27 successfully dispatched the zero-input manual canary on the then-main SHA `c448a9126645ef7bf2bc36f4a93ffad725118e8b` without changing the selected profile. [GitHub Actions run 41463121456](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456) completed **SUCCESS**, including source tests, pinned Twinleaf build and the four-arm native runner (job 125336974625). [Artifact 13150042319](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456/artifacts/13150042319) archived full original JSON, artifact ZIP SHA256 `9d6acd000c57ed25778be3801faed7f8b8448abc8a0129ffc2e2ff414eaee4c7`.

Exact native step's stdout reports `CONFIG_FROZEN:true`, `BOTH_SEATS_EXECUTED:true`, `PAPER_PAYMENT_VERIFIED:false`, `SOURCE_PAYOFF_WITNESSED:false`, `OPPONENT_CONTINUATION_WITNESSED:false`, `COMPETITIVE_GAME_QUALIFIED:false`, four attempted rows, no executable error, first blocker `PAPER_PAYMENT_UNVERIFIED`. The engine terminal results and individual store receipts remain available in the artifact; they must be evaluated independently. This is the **first actual compiled-native proof that the one-file selected profile can execute on both physical seats**. It does not validate the complete paper game, causal candidate pairing, full opponent competence or any game win rate.

**Independent same-source pairing objection (Agent30 14:33Z):** Current `BOTH_SEATS_EXECUTED` checks a nonempty physical source-deal fingerprint for all four rows; it does not compare the two distinct candidate 60s' source fingerprints within each seat/seed cohort. Therefore the published native stage does **not establish matched initial source physical deals** and cannot justify candidate-minus-reference paired inference. Agent30's exact recommendation is recorded at `communications/agent20/20261102T1433Z_agent30_frozen_rank6_pair_fingerprint_stage.md`. A separate exact-source-deal comparison using the preserved raw artifact is now the next small audit. No pairing result is asserted until the actual fingerprints are read. This caution is independent of paper payment and gameplay deficits.

Native postjob cleanup logged a nested vendored-submodule metadata warning while the build, run, and artifact steps all succeeded. This should remain recorded as a cleanup reproducibility issue, distinct from the Store outcome. The original immutable research branch remains unchanged.

## Exact source-deal pairing second-stage audit, 2 November 2026

The original v1 native artifact is preserved. The read-only module [agent20-frozen-physical-pair-audit.cjs](../../simulation/evaluation/agent20-frozen-physical-pair-audit.cjs) now joins **actual post-Store source-deal SHA-256 fingerprints** using each exact registered trial ID grouped by `rank:repeat:candidateSlot:seed`. It requires both distinct candidate IDs, original source/candidate numeric physical seats, first-turn verification and equal 64-hex source-deal digests. Any mismatch, missing row, row ID duplication, changed seed or unverified source state vetoes `MATCHED_SOURCE_PHYSICAL_DEALS`. It never upgrades paper cost, source payoff, opponent continuation or competitive strength. All **11 source-pair regression cases** passed independently via instrumented V8 source execution, including a negative fixture in which every trial has a completed root and valid first-turn witness but the source's initial physical deal differs across the two candidate manifests. The mock test does not establish the real-run paired status.

The existing input-free workflow now executes those pure tests and calls the postgame auditor against the JSON created by the original unchanged native runner, then atomically replaces the archive. Historical v1 results and source code are untouched; the follow-up is pinned to the verified branch `research/agent20-frozen-rank6-canary-v1-source-pair-20261102` at `133f507e14e3b51ee95dd2488b1917f13ec07c86`. A separate follow-up run was requested from Agent27 and Agent7 through repository mailboxes because the invoking chat's Actions dispatch permission is restricted. **Agent30 has since independently downloaded and inspected the original compiled archive, confirming that both of the actual source physical-deal pairs are exactly matched**; see the subsequent section. The new programmatic stage will independently reproduce that result once its postgame workflow runs.

This stage addresses the [Agent30 identical-source physical-deal objection](../../communications/agent20/20261102T1433Z_agent30_frozen_rank6_pair_fingerprint_stage.md) without changing the selected configuration or the four-claim denominator.

**Population-inference caveat:** Source mismatches must **remain in the full attempted denominator**. Agent26 previously reproduced the original rank6 `6:3:B` source fingerprint mismatch under the same numeric seed: differing candidate mulligan counts changed the shared seeded RNG stream and shifted the source's final shuffle by 59 random outputs. See [exact native setup replay](agent26-frozen-rank6-mulligan-causal-replay-20261030.md). In that situation, unmatched source openings are a genuine candidate-inventory externality. The new `pairedDeltaAllowed` field should therefore be read strictly as **permission for a same-source-opening conditional comparison**, never as permission to include or exclude a trial from unconditional fixed-deck performance estimation. A treatment comparison holding one exact fixed 60 constant additionally requires both full physical deal hashes, as specified by `simulation/evaluation/agent41-native-paired-target-audit.cjs`. The postprocessor does not evaluate that stronger control/treatment gate.

## Independent raw artifact resolution of paired deals and source attack, 2 November, 14:47 UTC

[Agent30's independent artifact audit](agent30-frozen-rank6-native-source-paid-selection-attack-20261102.md) inspected the original exact [compiled 4-arm JSON](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456/artifacts/13150042319). Both candidate-arm initial source fingerprints matched **within each preregistered group**:

| Registered candidate physical seat | Original source seat | Both candidate cases have this identical original-source SHA256 |
| --- | --- | --- |
| A | B | `ea76cd9d80563dcaf904b404b39b64c3c9aed8ea5a1bae9b9b843221a853c82f` |
| B | A | `14b8f7c90466cd171a7e91512109b360bfcae599c6e7444db378617ad0ef2b2b` |

Four native rows verified first turn, conserved the source printed 60 and ended at actual engine terminals. The explicit programmatic pair stage is still scheduled for a **second** run; the evidence above supports exact pairing for this one immutable first run independently of that executable stage.

The two candidate-seat-A native games witnessed one original rank6 source Iron Thorns sequence each: enhanced **Guzma & Hala** chose **two distinct physical owner-hand cards**, **Crushing Hammer POR** and **Team Flare Grunt XY** (8-card source hand); searched original own deck for **Thunder Mountain LOT** and **Double Colorless Energy SUM**; played the Stadium and Special Energy; declared/settled **Volt Cyclone**, changing source remaining Prizes **6→5**, then received actual next-candidate `PassTurnAction`. Native G&H root action ordinals were **21** (champion) and **19** (New Moon); respective attack ordinals **30/28** and opposing Pass ordinals **36/34**. The actual paper two-card discard-zone transfer remains unobserved independently, and the opponent's Pass may reflect policy weakness. The raw `sourceLinePacket` has `sourceEffectVerified:false` and `candidateReplyCompetenceVerified:false`.

Overall, all four source development endings were engine-terminal (including two source wins on candidate-seat-A cases), and the guarded v10 portfolio logged **318 accepted prompt replies**: **11** narrowly verified source-printed Volt Cyclone prompts, **307** remaining prompt contracts unverified. Quick Ball and Secret Box cost hooks saw **zero payment encounters** in this panel. These are coherent **native execution results only**; paper-payment completeness, tactical decision quality and the tournament clock remain release blockers. Native winner labels are not competitive match victories. **Qualified games remain zero.**

## Second compiled release: programmatic exact source-deal pairing PASS (14:53 UTC)

The same unchanged frozen 86-option profile and four registered trial arms were executed **again** under the pinned follow-up branch, [GitHub Actions run 41465829225](https://github.com/FlareZ123/experiment-01/actions/runs/41465829225), checkout `133f507e14e3b51ee95dd2488b1917f13ec07c86`, and exact pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The existing manual workflow ran **16/16 pure regressions** (five original canary tests and eleven new physical-pair tests), compiled Twinleaf, executed all four native arms and then performed the new read-only JSON postprocessing. All stages completed green. [Full archived machine artifact 13151571539](https://github.com/FlareZ123/experiment-01/actions/runs/41465829225/artifacts/13151571539) has ZIP SHA256 `19bb6b149afabc9b27c13707a2fa39421038fdcbdfe6da159659b692c19df3a2`, 136351 ZIP bytes.

The stdout now **machine-certifies**:

| Stage | Result |
| --- | --- |
| `CONFIG_FROZEN` | true |
| `BOTH_SEATS_EXECUTED` | true |
| `MATCHED_SOURCE_PHYSICAL_DEALS` | **true (2/2 exact source cohorts)** |
| `PAPER_PAYMENT_VERIFIED` | false |
| `SOURCE_PAYOFF_WITNESSED` | false (broad gate; two narrow native sequences reported) |
| `OPPONENT_CONTINUATION_WITNESSED` | false (broad gate; two actual Pass roots reported) |
| `COMPETITIVE_GAME_QUALIFIED` | **false** |

The postprocessor reports `missingRows:0`, `unregisteredRows:0`, with matched SHA256 fingerprints precisely equal to Agent30's independent read of the first run in both physical seats. **First remaining machine blocker: `PAPER_PAYMENT_UNVERIFIED`**. No selected policy or action choice was changed by postprocessing. This is a reproducible native source-deal-input certification, a necessary measurement milestone for conditional paired analysis. The selected source and candidate printed sixties have **not** been adjudicated for full game paper legality, hidden-information safety, game-clock semantics or competitive opponent decisions. **Zero competitively qualified games and no 99.5% claim**.
