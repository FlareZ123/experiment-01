# Aichi opponent-policy prototypes: implementation and evidence readiness

**Agent 35 · 17 November 2026 · post-trace panel planning**

## 20 November inventory update — supersedes the three-prototype count above

The 17 November snapshot below identified ranks 1, 2 and 10. The current main tree now contains **20 rank-specific policy module files covering 14 distinct Aichi ranks**: 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 19 and 31. This is a source-tree inventory, **not** 14 admitted opponents, 14 competent policies, or a completed field panel. Multiple v1/v2 files are preserved historical or parallel versions; do not count them as separate ranks.

| Rank | Current prototype(s) | Strongest documented automated evidence | Current disposition |
|---:|---|---|---|
| 1 | Agent6 Shadow Rider v1 | 51/51 direct V8 harness cases using actual worker validators; not Node/Actions | First-trace policy only. Agent11's 13-item static review remains open on the current unchanged policy source. No native game or independent competence pass. |
| 2 | Agent10 Vileplume v1; Agent45 Vileplume v2 | v1: 37/37 Actions tests. v2: separate 15-development / 4-held-out suite; held-outs blocked and no v2 native evidence | Preserve both identities. V1's validator pass is not strategic competence; v2 remains a synthetic contract prototype with five readiness gaps. |
| 3 | Agent17 Snorlax Stall v1 | 49/49 V8 shim cases invoking actual worker validators; not Node/Actions | Standalone, unbundled prototype. Critic explicitly froze further rank-3 scoring expansion; preserve cases as common-policy challenge material. No native game. |
| 4 | Agent50 Raichu/Electrode v1/v2 | v2: 32/32 rank-4 tests passed inside Actions run 44566586371; enclosing workflow failed on an unrelated rank-6 Gladion test. Standalone Node run remains outstanding. | Unregistered. AttachEnergyPrompt, PutDamagePrompt and DiscardEnergyPrompt lines remain blocked; Agent42's CES48 veto for ranks 4/9/17 remains. No native game. |
| 5 | Agent20 Mew/Genesect v8 | 32/32 Node v22.16.0 tests plus 32/32 supplemental V8 shim | Diagnostic-only; no worker IPC, native prompt/Store validation or game. |
| 6 | Agent39 Iron Thorns v1 | Module, test, dependency manifest and challenge-suite files exist; no current passing execution receipt identified in the reviewed report set | Do not infer readiness from older rank-6 source/native investigations; this exact actor-only module has no evidenced native game or competence disposition. |
| 7 | Agent43 Snorlax Stall v1/v2 | v2.3: 44/44 Node tests in Actions run 44605512482 | Synthetic contract prototype only; no native prompt receipt, game or matchup result. |
| 8 | Agent44 Absol/Garbodor v1 | 28/28 tests in Actions run 44631949020; 72/72 combined rank-7/rank-8 suite | Synthetic only. Ten prompt families remain held out; no native game or competence pass. |
| 10 | Agent43 Regidrago v1 | 22/22 policy tests + 17/17 Apex evaluator tests in local Node | No Actions pass or native game; Phantom Dive damage-counter allocation remains an explicit abstention. |
| 11 | Agent31 Absol/Garbodor v1 | 29/29 V8 shim cases invoking actual worker validators | No Node/Actions/native game. Unregistered; Terminal Period condition and other prompt gaps remain. |
| 12 | Agent1 Regidrago v1/v2 | v2: 20/21 V8 shim cases; one Heavy Ball fixture fails before policy execution with BAD_MULTI_SELECT_BOUNDS | No Node test-runner, worker IPC, native game or attestation. V2 init correction passed; the fixture mismatch remains. |
| 13 | Agent24 Regidrago v1 | Module and test file exist; no published execution result or versioned challenge-suite/manifest found in the current tree | Source-bound development only; no native game or competence evidence. The rank-13 source row was separately corrected to 17 Pokémon / 33 Trainers / 10 Energy; do not reuse stale Koraidon attribution. |
| 19 | Agent23 Raging Bolt v1/v2 | v2: 27/27 synthetic tests in a custom V8 harness | No Node/CI/native game, no held-out cases, no producer ID, no independent reviewer and no V3 plan binding. AttachEnergyPrompt and DiscardEnergyPrompt branches remain blocked. |
| 31 | Agent35 Dusknoir/Chimecho v1/v2 | v2: 16/16 V8 shim cases with actual worker init/request/decision validators | No Node test-runner, worker IPC, native Store receipt or game; unregistered, diagnostic-only, with eight held-out cases unrun. |

**Shared-corpus reconciliation:** Agent19 has already consolidated 30 cases from ranks **3, 4, 5, 6, 7 and 31** into the [shared-player challenge corpus v1](agent19/shared-player-challenge-corpus-v1.md) (24 development + 6 held-out). This is the correct reuse path; do not create a second corpus or import the rank-specific policies as strategic-oracle labels. Ranks 8 and 11 are deliberately excluded because their synthetic assertions contain identified rule/condition defects. All 30 corpus cases remain blocked: zero exact runtime actor-view digests, native Store receipts, native traces, source-natural cases or games. The corpus is opponent-role-only and does not yet validate candidate-role or seat symmetry.

**Field-wide conclusion:** none of these 14 ranks has a native complete-game policy-competence witness or an independently reviewed competitive matchup result. Automated contract passes range from V8 shims to Node/Actions, but none makes a policy a competent opponent. Do not turn this inventory into a 14-rank dispatch plan or continue expanding rank-specific score heuristics.

The 19 November Critic freeze says to stop rank-3 scoring expansion and move useful rank-specific examples into the common challenge corpus; the broader 20 November Critic integration direction keeps the first natural-terminal trace on Agent49's single canonical PR #58 path and Agent6's existing ownership. After that trace, prioritize one reproducible, independently reviewed **candidate-policy / exact rank-1 opponent-policy pair**. Only then decide whether any of these other rank modules should be retained as source-specific fixtures, ported as shared-policy challenge cases, or retired. See [Critic's 20 November freeze](../../../communications/broadcast/2026-11/20261120T175704Z_critic-freeze-v3-integration-at-one-sha.md) and [rank-3 freeze handoff](../../../communications/agent17/2026-11/20261119T224928Z_critic-rank3-policy-freeze.md).

## Decision

The panel manifest identifies three opponent-policy prototypes (ranks 1, 2 and 10), but they are not at the same readiness level. The current count should be described as **three identified prototypes**, not three field-ready policies.

- Rank 1 is the first-trace policy and the only prototype explicitly named in the current PR #58 V3 acceptance scope. Its 51-case exercise was a direct V8 harness, not a Node test-runner or Actions pass. Its test file is in PR #58's current changed-file set, but there is no current-head acceptance receipt yet.
- Rank 2 has the strongest completed automated contract evidence: 37/37 Node tests passed in GitHub Actions, exercising the actual worker request/decision validators. It has no native game and is not part of PR #58's current changed-file set.
- Rank 10 has 39/39 local Node tests across the policy and Apex evaluator, but no GitHub Actions pass or native game. It deliberately abstains on Phantom Dive damage-counter allocation, so it is not ready for game use.

None has a native complete-game result, independent competence attestation, or matchup-strength evidence.

## Artifact and evidence matrix

| Rank | Prototype / version | Policy boundary and source binding | Existing test evidence | Integration / material gaps |
|---:|---|---|---|---|
| 1 | agent6-rank1-shadow-rider-opponent-v1 | simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs; actor observation v2, owner-prompt projection v3, action frontier v1, public event receipt; exact rank-1 source list | 51/51 cases in a direct V8 harness invoking the real worker validators; **not** a Node test-runner or Actions pass | First-trace owner is Agent6. The test file is included in PR #58's current diff, but the exact current-head gate has no receipt. Agent11's static adversarial review recorded 13 findings on the reviewed revision; this note does not determine which were addressed in later edits. The prototype report also records unmodeled/uncertain strategic branches and missing projected suppression/stadium fields; fail-closed behavior prevents unsupported prompts from being guessed. |
| 2 | agent10-rank2-vileplume-control-opponent-v1 | simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs; deterministic actor-view policy at the response-v3 worker boundary; exact rank-2 source list | 37/37 Node tests in GitHub Actions run [43595660744](https://github.com/FlareZ123/experiment-01/actions/runs/43595660744), commit e6f981d; tests call the actual Agent49 validateRequest and validateDecision. A continuity check against main snapshot eb43719 found the policy source blob unchanged from the CI commit and the current test file differing only by one inserted blank line; all 37 test names are unchanged | No native fixture/game, no timed-paper validation, no calibrated value function, and five independent source-policy gaps remain: Guzma & Hala mode-zero valuation, Hood-aware Stoutland retreat under Garbotoxin, DCI preservation of the live Jet/TM line, public-own-hand de-duplication, and Peonia/Gladion/Lusamine coverage. Agent42's post-trace veto map details these; correct counts are one each for Peonia, Gladion and Lusamine. The policy report explicitly calls it a contract prototype. It is not in PR #58's current changed-file set. |
| 10 | agent43-rank10-regidrago-opponent-v1 | simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs plus agent43-regidrago-apex-choice.cjs; actor-view-only observation, legal frontier, prompt choices and public receipt; exact rank-10 diagnostic source list | 22/22 policy tests + 17/17 Apex evaluator tests = 39/39 local Node tests | No Actions pass, no native fixture/game, and no completed 32-rank bundle. Phantom Dive damage-counter allocation deliberately abstains; other prompts may be heuristic or unsupported. Not in PR #58's current changed-file set. |

Source reports:
- Rank 1: [Agent6 rank-1 prototype report](agent6-rank1-shadow-rider-opponent-policy-prototype.md)
- Rank 2: [Agent10 rank-2 prototype report](agent10-rank2-vileplume-control-opponent-policy-20261114.md)
- Rank 10: [Agent43 rank-10 prototype report](../../statistics/agent43-rank10-regidrago-opponent-policy-20261114.md)
- Current field inventory: [Agent17 Aichi opponent-policy panel plan](agent17-aichi-opponent-policy-panel-plan-20261117.md)
- Challenge-suite content: [Agent2 policy-challenge-suite operational contract](agent2-policy-challenge-suite-operational-contract-20261117.md)
- Producer/reviewer independence: [Agent9 V3 producer/reviewer addendum](agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md)
- Shared engine-dependency order: [Agent39 post-trace field-unblock priority queue](agent39-posttrace-field-unblock-priority-20261117.md)
- Rank-to-prototype source distances: [Agent35 transfer-distance map](agent35-prototype-transfer-distance-map-20261117.md)

## Per-prototype suite, producer and reviewer status (17 November 2026)

The panel JSON is a source/coverage manifest, not a competence-attestation manifest. Agent2's contract requires a versioned, frozen challenge-suite manifest and the V3 policy plan has a `challengeSuiteSha256` field, but the exact rank-specific digest and canonical suite manifest are not exposed in this matrix or the cited prototype reports. The test counts below are harness/contract regression evidence, not evidence of a frozen development/held-out split. **“Not evidenced here” is intentional:** do not infer a pass, and do not claim that an unlinked private working artifact cannot exist.

| Rank | Frozen challenge suite / held-out split | Exact policy-producer binding | Independent reviewer disposition / admission |
|---:|---|---|---|
| 1 | Rank-specific `challengeSuiteSha256` value, canonical suite manifest, and development/held-out split: **not evidenced here**. The 51/51 direct V8 harness cases are regression coverage, not a frozen held-out competence suite. | `opponentPolicyProducerIdByRank[1]`: **not bound/evidenced** in the current policy-plan core or panel manifest. Do not infer a producer ID from Agent6's first-trace ownership, module path, or commits. | No independent competence disposition. Agent11's static adversarial review is a findings report, not a competence pass. Agent6's first-trace review is diagnostic and remains pending the acceptance gates. **Not admitted.** |
| 2 | Rank-specific `challengeSuiteSha256` value, canonical suite manifest, and development/held-out split: **not evidenced here**. The 37/37 Actions suite exercises worker validators; it is not the frozen rank-specific competence suite. | `opponentPolicyProducerIdByRank[2]`: **not bound/evidenced** in the current policy-plan core or panel manifest. Do not infer a producer ID from Agent10's report authorship or commits. | No independent competence disposition. Agent42's five source-policy vetoes remain open. **Not admitted.** |
| 10 | Rank-specific `challengeSuiteSha256` value, canonical suite manifest, and development/held-out split: **not evidenced here**. The 39/39 local Node tests are regression coverage, not a frozen held-out competence suite. | `opponentPolicyProducerIdByRank[10]`: **not bound/evidenced** in the current policy-plan core or panel manifest. Do not infer a producer ID from Agent43's report authorship or commits. | No independent competence disposition. Phantom Dive damage-counter allocation still deliberately abstains. **Not admitted.** |

**Panel-wide producer binding:** the current plan has a bundle-level `bundle.producerId`, but Agent9's addendum records that the signed policy-plan core does not yet bind `candidatePolicyProducerId` or `opponentPolicyProducerIdByRank`. The full producer-ID set is therefore also not evidenced. A bundle producer is not a substitute for the author of each candidate/opponent policy. The candidate's own `candidatePolicyProducerId` is not evidenced in the current panel manifest either.

**Reviewer hold:** `simulation/evaluation/agent45-authorized-reviewers.json` currently has `reviewers: []`. Production admission requires four globally distinct roles—candidate-policy competence, opponent-policy competence, post-game paper/clock, and post-game strategy—each independent of every policy and bundle producer and of the other reviewer roles. Owner-controlled outreach and registry provisioning remain on hold; do not recruit, edit the registry, or self-authorize. This blocks production competence attestations and competitive admission, but **does not block the single authorized rank-1 diagnostic trace** after V3 acceptance.

## What the evidence does and does not establish

**Rank-2 CI continuity check:** at main snapshot eb43719c973dd98c5b1248d01964154e13a2fb70, the policy file blob is still 4eaa1da0467dd5dd2535bd23838fc148aa1a909f, identical to the CI-tested commit. The test file blob changed from 5dfdaae881b81a51862f711e157262ce8980c33a to f30cee3a878668ff5db80db2b9c5f5dca5809460, but a line comparison found only one inserted blank line; all 37 test names and test bodies are otherwise unchanged. Thus the documented 37/37 Actions result still covers the current rank-2 policy/test logic at that snapshot.

1. **Rank 1's 51/51 is a harness result, not a completed Node/Actions acceptance.** The current PR #58 diff includes its test file. The current PR head is `069cd9406b8460ca2ebbaa90df1c1e36aaf81b0e`; no Actions run or acceptance receipt exists on that exact SHA as of 19:18 UTC. The prior V8 result does not substitute for that gate.
2. **Rank 2's 37/37 is a stronger automated contract result, not a game-strength result.** It is the only one of these three with a documented Actions pass that exercises the actual worker validators, but it has no native complete-game evidence and Agent42 explicitly vetoes it as opponent-policy-ready until the five source-level gaps above are fixed.
3. **Rank 10's 39/39 is local test evidence only.** The Phantom Dive abstention is a concrete policy-coverage gap, not a cosmetic caveat. The policy must not be used in a game that can reach that prompt until the native prompt semantics and allocation resolver are implemented and tested.
4. **Source-list proximity does not repair policy gaps.** Rank 10 is a plausible shared code scaffold for its Regidrago family, but every exact rank needs its own source-bound challenge suite and variant coverage. Ranks 1 and 2 are not close source-list templates for the other archetypes; see the transfer-distance map.
5. **All three remain prototypes.** Agent11's rank-1 static adversarial review is a real review artifact, but it was not a competence pass: it identified multiple code-level correction points on the reviewed revision and did not independently run the V8 harness, Node/Actions, or a game. No native full-game policy-competence witness or competitively qualified matchup is recorded for any of the three. Do not count them as three of 32 competent opponents.

## Benchmark contract and reproducibility

The owner decisions recorded in [issue #59](https://github.com/FlareZ123/experiment-01/issues/59#issuecomment-6893903051) govern this panel: the primary benchmark is one English-language, paper Expanded-legal candidate against the **unchanged original Aichi Japanese Extra lists**. It is a custom cross-format challenge, not Expanded-vs-Expanded and not a sanctioned Expanded tournament result. Preserve the five Japanese-Extra source identities and promo print identities unchanged.

The owner selected **public reproducibility** for physical shuffle seeds. Publish the seed and reproducibility receipts; do not add an owner-held secret-seed or obfuscation mode. This does not relax information-flow rules: each policy worker receives only its own actor-visible observations and public receipts, never native game state, the other player's hidden zones, or physical RNG/seed as decision inputs.

## Additional field vetoes outside the three-prototype slice

This report is deliberately scoped to ranks 1, 2 and 10. Do not read it as a full-field readiness map. Agent42's [post-trace opponent-policy readiness veto map](agent42-posttrace-opponent-policy-readiness-veto-map-20261117.md) records additional blockers that must remain visible: rank 31 cannot reuse rank 1 as a competent policy; ranks 4/9/17 are not game-evaluable until the CES48 paper correction and two-seat regression are active; the five Japanese-Extra source identities must remain unchanged; Player's Ceremony still needs a research-owned hook (Palace Book and Palace Belt are already implemented); the Koraidon ex TEF120 rows in ranks 10/12/18/21/27 are not Dino Cry sources (no SVI125 substitution without a direct Japanese-print bridge); and ranks 23/25/28 remain unavailable. These are static readiness vetoes, not matchup results.

## Post-trace integration order

After PR #58 passes the exact-SHA contract, compile/no-fixture and both-role/both-seat native no-game gates, and after Agent6 reviews the first natural-terminal trace:

1. Preserve rank 1 as the first trace baseline. Convert its direct V8 tests into a Node/Actions contract receipt on the accepted V3 head; address only concrete trace-backed projection or policy failures.
2. Treat rank 2 as the next existing policy to harden only after its five Agent42 source-level gaps are closed. Preserve the 37/37 worker-validator suite as a regression base, add source-branch challenge cases for each gap, and keep its exact rank-2 source binding. Do not schedule a native game or infer that its Item/Supporter lock plan is optimal from the contract tests.
3. Resolve rank 10's Phantom Dive prompt gap before any native game. Then use its policy as a Regidrago-family scaffold only where the exact rank list and its unique branch are represented in a frozen challenge suite.
4. For each rank, bind a distinct policy identity/registration, exact source-60 fingerprint, challenge-suite digest, producer ID and independent reviewer disposition. Shared code is permitted; silent policy or deck substitution is not. Production attestations also require four globally distinct human roles (candidate-policy, opponent-policy, post-game paper/clock, post-game strategy); the external reviewer registry is currently empty and owner-controlled outreach remains on hold in issue #39. Do not self-authorize or recruit. This registry is not a blocker for the single post-acceptance diagnostic trace.
5. Keep all three policies out of competitive aggregates until their rank-specific competence evidence and the complete source/admission prerequisites are satisfied.

This order is a readiness recommendation, not permission to widen PR #58, dispatch a workflow, change a policy, or start a game before the existing stopline is cleared.

## Reproduction and limitations

The artifact paths, test counts, run ID and explicit gaps are transcribed from the three linked prototype reports and their current code/test paths. PR #58's changed-file list was checked for the three policy modules and the rank-1 test file. This report does not rerun the tests or inspect native game behavior.

**Evidence classification:** artifact paths, test outcomes and declared limitations = repository evidence; readiness ordering = planning recommendation; policy quality, card interactions, opponent competence and win rates = untested.
