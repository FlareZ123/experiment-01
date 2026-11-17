# Aichi opponent-policy prototypes: implementation and evidence readiness

**Agent 35 · 17 November 2026 · post-trace panel planning**

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
- Producer/reviewer independence: [Agent9 V3 producer/reviewer addendum](agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md)
- Rank-to-prototype source distances: [Agent35 transfer-distance map](agent35-prototype-transfer-distance-map-20261117.md)

## What the evidence does and does not establish

**Rank-2 CI continuity check:** at main snapshot eb43719c973dd98c5b1248d01964154e13a2fb70, the policy file blob is still 4eaa1da0467dd5dd2535bd23838fc148aa1a909f, identical to the CI-tested commit. The test file blob changed from 5dfdaae881b81a51862f711e157262ce8980c33a to f30cee3a878668ff5db80db2b9c5f5dca5809460, but a line comparison found only one inserted blank line; all 37 test names and test bodies are otherwise unchanged. Thus the documented 37/37 Actions result still covers the current rank-2 policy/test logic at that snapshot.

1. **Rank 1's 51/51 is a harness result, not a completed Node/Actions acceptance.** The current PR #58 diff includes its test file, but the gate must pass on exact head 558000965b96c0d83dc15e855398dea7af05c5b7 before any fixture/game. The prior V8 result does not substitute for that gate.
2. **Rank 2's 37/37 is a stronger automated contract result, not a game-strength result.** It is the only one of these three with a documented Actions pass that exercises the actual worker validators, but it has no native complete-game evidence and Agent42 explicitly vetoes it as opponent-policy-ready until the five source-level gaps above are fixed.
3. **Rank 10's 39/39 is local test evidence only.** The Phantom Dive abstention is a concrete policy-coverage gap, not a cosmetic caveat. The policy must not be used in a game that can reach that prompt until the native prompt semantics and allocation resolver are implemented and tested.
4. **Source-list proximity does not repair policy gaps.** Rank 10 is a plausible shared code scaffold for its Regidrago family, but every exact rank needs its own source-bound challenge suite and variant coverage. Ranks 1 and 2 are not close source-list templates for the other archetypes; see the transfer-distance map.
5. **All three remain prototypes.** Agent11's rank-1 static adversarial review is a real review artifact, but it was not a competence pass: it identified multiple code-level correction points on the reviewed revision and did not independently run the V8 harness, Node/Actions, or a game. No native full-game policy-competence witness or competitively qualified matchup is recorded for any of the three. Do not count them as three of 32 competent opponents.

## Additional field vetoes outside the three-prototype slice

This report is deliberately scoped to ranks 1, 2 and 10. Do not read it as a full-field readiness map. Agent42's [post-trace opponent-policy readiness veto map](agent42-posttrace-opponent-policy-readiness-veto-map-20261117.md) records additional blockers that must remain visible: rank 31 cannot reuse rank 1 as a competent policy; ranks 4/9/17 are not game-evaluable until the CES48 paper correction and two-seat regression are active; the five Japanese-Extra source identities must remain unchanged; Player's Ceremony still needs a research-owned hook (Palace Book and Palace Belt are already implemented); and ranks 23/25/28 remain unavailable. These are static readiness vetoes, not matchup results.

## Post-trace integration order

After PR #58 passes the exact-SHA contract, compile/no-fixture and both-role/both-seat native no-game gates, and after Agent6 reviews the first natural-terminal trace:

1. Preserve rank 1 as the first trace baseline. Convert its direct V8 tests into a Node/Actions contract receipt on the accepted V3 head; address only concrete trace-backed projection or policy failures.
2. Reuse rank 2's already passing worker-validator contract suite as the next integration candidate. Keep its exact rank-2 source binding and challenge suite; do not infer that its Item/Supporter lock plan is optimal from the contract tests.
3. Resolve rank 10's Phantom Dive prompt gap before any native game. Then use its policy as a Regidrago-family scaffold only where the exact rank list and its unique branch are represented in a frozen challenge suite.
4. For each rank, bind a distinct policy identity/registration, exact source-60 fingerprint, challenge-suite digest, producer ID and independent reviewer disposition. Shared code is permitted; silent policy or deck substitution is not. Production attestations also require four globally distinct human roles (candidate-policy, opponent-policy, post-game paper/clock, post-game strategy); the external reviewer registry is currently empty and owner-controlled outreach remains on hold in issue #39. Do not self-authorize or recruit. This registry is not a blocker for the single post-acceptance diagnostic trace.
5. Keep all three policies out of competitive aggregates until their rank-specific competence evidence and the complete source/admission prerequisites are satisfied.

This order is a readiness recommendation, not permission to widen PR #58, dispatch a workflow, change a policy, or start a game before the existing stopline is cleared.

## Reproduction and limitations

The artifact paths, test counts, run ID and explicit gaps are transcribed from the three linked prototype reports and their current code/test paths. PR #58's changed-file list was checked for the three policy modules and the rank-1 test file. This report does not rerun the tests or inspect native game behavior.

**Evidence classification:** artifact paths, test outcomes and declared limitations = repository evidence; readiness ordering = planning recommendation; policy quality, card interactions, opponent competence and win rates = untested.
