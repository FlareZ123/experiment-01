# 2026-11-26T18:47:42Z — Agent6 orderly release at 70m10s

- **Measured release condition:** original immutable lease `2026-11-26T17:37:32Z`; actual UTC checkpoint `2026-11-26T18:47:42Z`; elapsed **70 minutes 10 seconds**. The 70-minute threshold is met. No lease refresh occurred.
- **No owner authorization arrived.** The latest issue #25 comment remains Agent5's trace-delivery question `7198239604` at 16:54:08Z; Agent49's explicit go/no-go/key-configuration request is comment `7183436494` at 05:23:03Z. Issue #25 `updated_at` remained 16:54:08Z at the last check. The owner has not authorized or declined the unchanged two-game V3 seat-swap pair or chosen trace delivery. Do not dispatch.
- **Current hold remains:** Critic's 16:25Z broadcast `communications/broadcast/2026-11/20261126T162506Z_critic-return-to-game-trace-loop.md` is controlling. No further MCTS/K1 expansion, policy micro-iterations, card audits, alternate runners/serializers/validators/ledgers/workflows, or substitute CI. The existing current-main V3 fail-closed guard and exact contract/no-game receipts are already integrated and recorded above. Preserve all frozen decks, policies, registration, seed, seats and Twinleaf pin.
- **Next incarnation:** read the latest Critic broadcast, Agent6 mailbox and issue #25 comments; continue holding until an explicit owner decision and the required Actions public-key/trace-delivery configuration are supplied. If authorized, use only the existing current-main V3 workflow, run exact-SHA gates on the exact dispatch SHA, then review the registered two-game pair's human-readable trace. If declined or silent, do not manufacture substitute work.
- No code, deck, policy, fixture, CI, or results changes were made in this incarnation; no game ran and no new competitive evidence was produced. Objective remains no final fixed 60, 29/32 authenticated source lists, 0/32 qualified matchups, and no demonstrated 99.5% rate.
- This is the final memory checkpoint. After this commit is confirmed remotely, delete `.lease.json` in the final repository mutation and verify that deletion. Do not make further repository changes afterward.

---

# 2026-11-26T17:42Z — Agent6 continuation: owner-controlled V3 trace hold

- Actual CSPRNG mode draw for this incarnation: 4/10 (normal). Reclaimed Agent6 only after its previous claim at 2026-11-26T10:56:15.392Z was more than 100 minutes old. New immutable lease: `2026-11-26T17:37:32Z`, run `agent6-chat-20261126T173732Z-normal4-gpt6.2-1cbfd5f7`; claim commit `ee1b0e8df10ad28e9a58ea5cd597a8137993c4a4` verified on main. Do not refresh. Mandatory release threshold: 2026-11-26T18:47:32Z; use an actual clock after each checkpoint.
- Read the latest Critic direction `communications/broadcast/2026-11/20261126T162506Z_critic-return-to-game-trace-loop.md`. It freezes further MCTS/K1 expansion and substitute pre-game work; preserve existing artifacts. The next meaningful deliverable is the already-registered V3 two-game physical-seat-swap pair and its move-by-move trace, not another runner, serializer, ledger, validator, workflow, or policy micro-iteration.
- Current-main V3 encrypted-full fail-closed guard is integrated at `d2dcc6ccfb5c54ed6e7a144f029866363993b161`; exact tested source `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa` passed contract-only run `45760563785` and four-cell native no-game witness `45760687304` on pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. These are engineering/no-game receipts only; no fixture/game ran.
- Owner authorization remains outstanding for the exact unchanged Hood Shield Shadow Rider v1 vs original Aichi rank-1 **two-game physical-seat-swap pair**. The owner-controlled `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` variable must be configured for encrypted-full output. Agent49's comment `7183436494` asked for explicit go/no-go and key confirmation; Agent5's latest comment `7198239604` asks for one trace-delivery decision (encrypted owner-held path with actor-safe redacted review, or explicit owner approval for readable/public full-state exposure). As of 17:40Z, no owner decision follows those requests. Issue #72 is separate Stage-A A/B and does not authorize or block V3.
- Do not dispatch, patch, merge, alter the frozen deck/policies/registration/seed/seats, bypass the guard, or repeat status-only checks while the owner is silent. Do not duplicate Agent5's trace-delivery question. If the owner authorizes the pair and confirms key/trace delivery, use the existing current-main V3 path and exact-SHA gates only; produce one human-readable trace review, distinguish deterministic engine/rules faults from policy errors and judgement, and fix general causes. If the owner declines or remains silent, hold and wait for a concrete benchmark-relevant change.
- Read the current issue #25 comments, Agent6 mailbox, and 13:14Z/16:25Z Critic broadcasts this incarnation. No new Agent6-addressed action supersedes the above hold. The candidate-policy PR #69 remains draft/contract-only and is not loaded by main V3; do not extend or merge it before the baseline trace.
- No code, deck, policy, fixture, CI, or result changes were made in this checkpoint; no game or win-rate evidence is added. The board remains no final 60, 29/32 authenticated Aichi source lists, 0/32 qualified matchups, and no demonstrated 99.5%.

---

# 2026-11-26T11:46Z — Alolan Muk Power of Alchemy scope correction

## PR #69 current head
- Found a real shared Ability-lock bug while reviewing the current PR's source-resolution code: Alolan Muk SUM 58 Power of Alchemy text suppresses Basic Pokémon Abilities on both players' sides, but the resolver's `basic-all` branch incorrectly required the target to be on the opposing side. This could leave same-side Basic lock sources such as an Active Wobbuffet incorrectly active.
- Corrected `basic-all` to apply to Basic Pokémon on either side; exposed `effectiveAbilityStatus` via the existing test-only export; added tests for Basic suppression on either side, non-Basic VMAX unaffected, and same-side Alolan Muk suppressing Active Wobbuffet before its lock can apply. Corrected the old fixture assertion that incorrectly claimed opponent-only scope.
- First contract run `45812946990` failed only on that stale fixture expectation; corrected it. Exact current head is `06e23746c022a1991bd06f880317e8a9d36155c6` (31 commits, 3 changed files; worker blob `aaf0b2b6884e0e57d73edc5930166e5f808b2575`, test blob `779cf43e1a0434809f03bb29534da9a2e86ad080`, protocol unchanged `6d32a599ef18f931f9dc4c36868f8e5cdef9d2d3)). Full contract-only run `45813184493` passed.
- Updated PR #69 body, `results/README.md`, and the static Energy/DCI audit to the current head. Notified Agent46 and requested Agent36 review in `communications/agent46/2026-11/20261126T1146Z_agent6-alolan-muk-scope-fix.md` and `communications/agent36/2026-11/20261126T1146Z_agent6-alolan-muk-scope-fix-review.md`.
- PR #69 remains draft and is not loaded by current-main V3. No main policy, fixed deck, registered fixture, seed, or live-game gate changed.

# 2026-11-26T11:38Z — Marshadow prospective-Hood limitation recorded

- PR #69 body now explicitly states a conservative false-negative boundary: the synthetic Marshadow used by `marshadowResettingHoleUsable()` has no prospective Tool attached. It does not credit a line that searches/attaches Stealthy Hood to protect Marshadow from an opponent's Klefki before using Resetting Hole; that Hood is then discarded with Marshadow, and its one-use cost is not priced. This is documented as a limitation, not silently assumed away.
- No code change. Keep the branch draft until a sequence-level test and independent review justify changing this heuristic.

# 2026-11-26T11:37Z — Klefki scope checked against card pool

- Checked the supplied Expanded card pool directly: Klefki SV1-96 and SV4pt5-159 both have Mischievous Lock text affecting Basic Pokémon in play on **both** players' sides, except Mischievous Lock itself. Therefore the current `active-basic-both` scope in the candidate policy is correct; the apparent concern that it should be opponent-only does not justify a code change.
- The current PR #69 resolver still uses activation-order/turn-seat resolution for interacting Active lock sources. No patch made.

# 2026-11-26T11:36Z — PR #69 ability-lock review cross-check

- Re-read the full Agent11 inline review comments on PR #69 and inspected the current exact-head worker. The Active Klefki / Radiant Gate concern is already addressed by `hasRadiantGateLock()` calling `resolveAbilityLockSources()` and `abilityLockSourceSuppressesTarget()`; the source ordering uses activation order and turn-seat tie-breaking. The new Marshadow UNB 81 helper reuses `effectiveAbilityStatus()`, which routes through the same suppression pipeline. No additional patch was warranted.
- The PR remains draft; the current branch head is still `fd3cb1e`. Contract-only run `45808003263` passed. Formal independent review of this exact head remains pending; historical inline comments/replies are not a current-head approval.
- No policy or deck change made.

# 2026-11-26T11:35Z — Deferred Energy cap exposed in current PR synthesis

- Updated the current PR #69 synthesis in `results/README.md` to link the static Energy/DCI audit and state plainly that the global five-Energy cap in `searchNeedScore()`, Underworld Door recipient scoring, and manual VMAX attachment remains unchanged. The discard-priority patch does not resolve that deferred risk.
- The current PR #69 body and Energy/DCI audit also clarify that removing the `attached >= 11` branch is behaviorally neutral while a copy is in hand (11 total copies means at most ten attached); the meaningful reserve change was the earlier v4 increase from value 2 at five attached to value 80.
- No policy or deck change for the global five-Energy cap. This remains deferred until after the unchanged baseline trace.

# 2026-11-26T11:33Z — Psychic Energy threshold interpretation clarified

- Refined PR #69 body and the static Energy/DCI audit: removing the `attached >= 11` branch is behaviorally neutral while a Psychic Energy is in hand, because the fixed list has 11 copies and at most ten can already be attached. The meaningful reserve change relative to current main is the earlier v4 increase from discard value 2 at the five-attached threshold to value 80.
- The 10-attached/one-in-hand test guards the unreachable-boundary invariant; it does not demonstrate a new behavior at that state. The separate global five-Energy search/Underworld Door/manual-attachment cap remains a deferred risk and is not fixed by the discard-priority patch.
- Updated audit commit `9da664929c941f739dd3a67183caec97b7d9da15`; PR #69 remains at `fd3cb1e`, draft, exact-head contract run `45808003263` passed. No code changed in this clarification.

# 2026-11-26T11:29Z — Candidate Energy DCI audit synchronized

- Re-read the earlier Agent6 → Agent46 handoffs on the global five-Energy preference. They identify a separate, high-impact but explicitly deferred mirror risk: candidate searchNeedScore, Underworld Door recipient scoring, and manual VMAX attachment still deprioritize development beyond five total Psychic Energy. The discard correction in PR #69 does not solve this broader Energy-development issue.
- Added an explicit deferred-risk caveat to PR #69 body, linking `results/aichi-2026/2026-11/agent6-shadow-rider-candidate-energy-dci-audit-20261126.md`. The branch remains draft; do not change the registered V3 pair before the owner-authorized baseline trace.
- Refreshed that audit to current PR #69 head `fd3cb1e`, current exact-head contract run `45808003263`, the latest Marshadow/open-Bench/energy-discard corrections, and the remaining five-Energy search/attachment cap. The static damage-breakpoint analysis remains a risk hypothesis, not an observed loss.
- No policy or deck change was made for the deferred five-Energy cap. No decision-board update was made for that hypothesis alone, consistent with the earlier research note.

# 2026-11-26T11:28Z — PR #76 superseded closure

## V3 guard handoff completed
- Agent49 asked for PR #76 status reconciliation after the five substantive guard/test files were transplanted to main. Verified current main runner and workflow still enforce encrypted-full, valid recipient key, canonical repository/workflow, and GITHUB_REF=refs/heads/main for live runs; the explicit witnessOnly sanitized-only bypass remains.
- Verified exact main-tested revision `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; contract-only run `45760563785` and four-cell no-game witness `45760687304` both succeeded. The witness records no game execution/live action dispatch/accepted root actions.
- Updated PR #76 title/body to identify it as superseded by main transplant commit `d2dcc6ccfb5c54ed6e7a144f029866363993b161`, preserve exact run/artifact evidence and owner gates, and closed it as superseded. Added a conversation comment (ID `7190643425`). No branch merge, game dispatch, deck, policy, seed, or gate change.
- Notified Agent49 in `communications/agent49/2026-11/20261126T1126Z_agent6-pr76-superseded-close.md`.
- Updated the V3 guard line in `results/README.md` to state PR #76 is closed and its stale branch must not be merged.

## Current gates
- Main V3 engineering/no-game gates are green on the tested SHA, but those receipts do not transfer to later main SHAs. The public recipient-key configuration and explicit owner go/no-go for the unchanged two-game physical-seat-swap fixture remain outstanding. No live game is authorized.
- PR #69 candidate-policy branch remains draft at `fd3cb1e`; exact-head contract-only run `45808003263` passed, but the branch is not loaded by current-main V3 runner and must not be merged/ported before the owner-authorized diagnostic pair. Await Agent36/Agent46 review.
- The original Agent11 Radiant board page and adapter are marked superseded/legacy; corrected Agent6 independent audit is canonical. The corrected resource-access probabilities are not matchup or win-rate evidence.
- Immutable Agent6 lease: `2026-11-26T10:56:15.392Z`; release threshold `2026-11-26T12:06:15.392Z`. At each checkpoint reread lease and actual UTC clock. Continue if elapsed <70 minutes.

---

# 2026-11-26T11:17Z — Radiant board-access stale-result correction

## Shared evidence correction
- Agent11's result page `results/aichi-2026/2026-11/agent11-radiant-board-access-20261126.md` still displayed the original 56.2209% / 50.1756% as current, although the corrected Agent6 result note and communications already superseded them.
- Marked the Agent11 page as superseded and linked it to `agent6-radiant-gate-board-access-correction-20261126.md`. Preserved the old table as historical output.
- Marked `scripts/agent11-radiant-board-access.py` as legacy and added a stderr warning that it reproduces only the superseded estimate. This prevents silent reuse; it does not claim the corrected Monte Carlo is reproducible from that adapter.
- Main commit: `52603dc4ec71c57ceb80b726cc187ac5f714dbf4`. Agent11 notified in `communications/agent11/2026-11/20261126T1116Z_agent6-radiant-report-superseded.md`.
- Corrected result remains the independent 2M sample: strict v0 53.1786%; V-as-intermediate-FSS-host 54.3985%; 17-non-Basic-Other sensitivity 52.6136%; board + one Psychic Energy 47.7813% / 49.0102%. The sample stream differs from Agent11's original, so it is not a same-sample correction. These are first-turn resource-access estimates, not game or matchup win rates.
- The current results index already links the corrected Agent6 audit. No deck or policy changed.

## Current active work
- PR #69 candidate-policy branch is at `fd3cb1eb02584b2d498ea3a0bce368edecfd259f`; exact-head contract-only run `45808003263` passed. Draft branch only; current-main V3 runner still loads main worker files. No merge/port before owner-authorized V3 pair.
- The three v4 discard-policy corrections are documented in the 11:12 checkpoint: open-Bench guard; Marshadow UNB 81 Resetting Hole ability status (Silent Lab negative, Path to Peak positive, Dimension Valley negative); remove unreachable Psychic Energy >=11 discard cutoff while retaining counter for Max Geist damage.
- Await Agent36/Agent46 review. Do not extend candidate policy beyond concrete in-scope defects.

## Lease / next
- Immutable lease: `2026-11-26T10:56:15.392Z`; release threshold `2026-11-26T12:06:15.392Z`. Do not refresh.
- Issue #25 owner go/no-go for the unchanged V3 two-game seat-swap pair remains unanswered. No game dispatch or policy change on main.
- At each checkpoint, reread the lease and actual UTC clock; continue if elapsed <70 minutes.

---

# 2026-11-26T11:12Z — PR #69 Marshadow/Silent Lab correction

## Additional work after the 11:07 checkpoint
- Verified the candidate's actual card printing against the supplied card pool: Marshadow UNB 81 has the Basic Ability Resetting Hole. Silent Lab's card text suppresses Abilities of Basic Pokémon in play, so Resetting Hole cannot remove Silent Lab while it is active.
- Found the earlier regression fixtures used Marshadow SLG 45, which is a different, Expanded-banned printing and not the candidate's card. Corrected both fixtures to Marshadow UNB 81.
- Added `marshadowResettingHoleUsable(view)`, using the existing `effectiveAbilityStatus` evaluator against a synthetic Basic Psychic Marshadow. `scoreBasicPlay()` now preserves Marshadow only when a Stadium is a real removal target **and** Resetting Hole is actually usable. Silent Lab is a negative control; Path to the Peak remains positive; Dimension Valley remains negative.
- New exact branch head: `fd3cb1eb02584b2d498ea3a0bce368edecfd259f` (commit title: `Agent 6: respect Marshadow Ability suppression`).
- Exact-head contract-only run `45808003263` **passed** on `fd3cb1e`. Contract suite (including the full candidate-policy Node test file), Docker launcher contract, digest-pinned runtime preflight, and both-seat worker-isolation canary passed. V3 no-game witness and fixture/game steps were skipped.
- Updated PR #69 body and `results/README.md` current candidate-policy status to `fd3cb1e` / run `45808003263`. PR remains draft/unmerged; fixed 60 unchanged.
- Sent follow-ups to Agent36 and Agent46:
  - `communications/agent36/2026-11/20261126T1111Z_agent6-pr69-marshadow-silent-lab.md`
  - `communications/agent46/2026-11/20261126T1111Z_agent6-pr69-marshadow-silent-lab.md`

## Current candidate-policy corrections at fd3cb1e
- Marshadow requires both an adverse Stadium and an active Resetting Hole Ability; Silent Lab suppression is handled by the shared Ability evaluator.
- Synthetic live-Basic discard preservation requires an open Bench.
- The unreachable attached-Psychic `>= 11` discard cutoff is removed; all remaining hand Psychic Energy retains value 80, while the shared counter remains for Max Geist damage.
- Test fixtures use the candidate's legal Marshadow UNB 81 printing, not banned SLG 45.
- The full-Bench, Silent Lab, Path to the Peak, Dimension Valley, and 10-attached/one-in-hand boundary regressions are present.

## Evidence boundary / next
- Contract-only evidence; no Twinleaf compile, native no-game witness, fixture/game, matchup, policy-competence admission, or win-rate result. Candidate 60 unchanged and still experimental.
- Await Agent36/Agent46 review of `fd3cb1e`; do not merge PR #69 or nominate a deck from contract evidence.
- The Issue #25 owner go/no-go for the registered unchanged V3 two-game seat-swap pair remains unanswered; no game dispatch. Avoid further policy micro-iterations unless a concrete, in-scope defect is established.
- Immutable lease remains `2026-11-26T10:56:15.392Z`; release threshold `2026-11-26T12:06:15.392Z`. At every checkpoint, reread the lease and actual UTC clock.

---

# 2026-11-26T11:07Z — PR #69 v4 full-Bench guard and exact-head pass

## Additional work after the 11:02 checkpoint
- Found a further false-positive in the new discard heuristic: it passed a synthetic bench-play action to `scoreBasicPlay()` even when the Bench was full. The native root action frontier already guarantees legality for real plays, but the synthetic discard evaluation did not.
- Added a fail-closed `hasOpenBench(view)` guard only at the synthetic `discardValue()` call site. Real root-action scoring is unchanged. Added a full-Bench Girafarig-vs-Psychic-Energy regression.
- New exact branch head: `46ae676a00cce11f9d1228d5e7874a7f2652dc0a` (commit title: `Agent 6: gate live Basic preservation on open Bench`).
- Exact-head contract-only run `45807173575` **passed** on `46ae676`. The full candidate-policy Node test file is included in the existing Agent36 workflow; the job shows contract suite success, Docker launcher contract success, digest-pinned runtime preflight success, and both-seat worker isolation success. All native/no-game/game/260-root diagnostic steps were skipped. Do not describe this as a game or matchup.
- Updated PR #69 body and `results/README.md` current candidate-policy status to exact head `46ae676` / run `45807173575`. PR remains draft/unmerged; fixed 60 unchanged.
- Sent follow-up messages to Agent36 and Agent46:
  - `communications/agent36/2026-11/20261126T1106Z_agent6-pr69-open-bench-guard.md`
  - `communications/agent46/2026-11/20261126T1106Z_agent6-pr69-open-bench-guard.md`

## Current disposition
- All three reviewed v4 issues are addressed at `46ae676`: Marshadow only when the Stadium is an actual removal target; the impossible attached-Energy >=11 discard cutoff removed while keeping the counter for Max Geist damage; and synthetic live-Basic preservation requires an open Bench.
- The earlier first attempt `b1483aa` failed due to my temporary removal of the shared counter; the helper was restored in `aabf76a`, which passed contract run `45806439884`. The later open-Bench guard is the latest tested head.
- No Twinleaf compile, native no-game witness, fixture/game, matchup, policy-competence admission, or win-rate evidence. No change to candidate 60 or its nomination.

## Next
1. Await Agent36/Agent46 review of exact head `46ae676`; avoid another isolated policy edit unless a concrete, in-scope defect is established.
2. Do not merge PR #69 or dispatch any game. The separate Issue #25 owner go/no-go for the unchanged two-game V3 pair remains unanswered; no authorization can be inferred from generic execution instructions.
3. Continue only work that advances the frozen candidate/opponent pair; avoid source-provenance repetition, declined Budew/Ranger scope, or new workflows.
4. Lease remains immutable at `2026-11-26T10:56:15.392Z`; 70-minute release threshold `2026-11-26T12:06:15.392Z`. At every checkpoint, reread lease and actual UTC clock.

---

# 2026-11-26T11:02Z — PR #69 v4 discard-priority correction and contract pass

## Invocation / lease
- Continuing Agent6 in normal mode. Initial required CSPRNG draw was 3/10. Current immutable lease: `2026-11-26T10:56:15.392Z`, run id `agent6-chat-20261126T105615392Z-normal3-gpt6.2-pr69-discard-fix`; 70-minute release threshold is `2026-11-26T12:06:15.392Z`. Do not refresh the lease. Check actual UTC time after every checkpoint.
- Claim commit: `396f1a24b854ce20675bc79db6f2cfeb197bcbdd`. No other identity lease was changed.

## Work completed
- Continued Agent36's 10:20Z review of the v4 candidate-policy discard patch on PR #69 / branch `agent46/candidate-policy-competence-20261124`.
- Exact branch head now: `aabf76a5a9d102b4cde4bbc5e82d1f39da27b371`. Commits in this continuation:
  - `b1483aa019c8daec3ef1f4228b3a9b664387ee15`: Marshadow now requires `hasStadiumRemovalTarget(view)`; positive Path to the Peak and negative Dimension Valley controls; maximum-reachable Psychic Energy boundary test; removed unreachable `psychicEnergyCount(view) >= 11` discard cutoff and retained hand Psychic Energy value 80.
  - `aabf76a5a9d102b4cde4bbc5e82d1f39da27b371`: restored shared `psychicEnergyCount(view)` helper because `attackBaseDamage()` also uses it for Max Geist damage. Keep the helper; only the discard cutoff was dead.
- First exact-head contract-only run `45806268676` on `b1483aa` failed because the helper had been removed. The failed log directly showed ReferenceError in `attackBaseDamage`; this was corrected rather than ignored.
- Second exact-head contract-only run `45806439884` on `aabf76a` **passed**. It used existing `.github/workflows/agent36-bilateral-competence-v9.yml`; its contract command includes the complete `tests/2026-11/agent46-candidate-policy.test.cjs` file (workflow line 581). Docker launcher contract, runtime preflight, and both-seat worker-isolation canary also passed. This is contract-only evidence; Twinleaf checkout/compile, native no-game witness, fixture/game, matchup, and win-rate steps were skipped.
- Updated PR #69 body with exact head, both run dispositions, scope, and evidence boundary. PR remains draft and unmerged.
- Updated `results/README.md` Candidate policy review status with the current exact-head contract result. No decklist changed.
- Sent direct handoffs to Agent36 and Agent46:
  - `communications/agent36/2026-11/20261126T1101Z_agent6-pr69-v4-correction-and-contract-pass.md`
  - `communications/agent46/2026-11/20261126T1102Z_agent6-pr69-v4-correction-and-contract-pass.md`

## Findings / limits
- Marshadow is no longer preserved solely because an opponent has any Stadium; it needs a Stadium the existing policy already recognizes as a removal target. Dimension Valley is correctly a negative control for this Psychic candidate.
- With 11 Basic Psychic Energy in the fixed list, an Energy still in hand cannot coexist with 11 already attached. The prior threshold was unreachable for the discard candidate. Preserve remaining hand Psychic at value 80; keep the counter for damage calculations.
- The passing run does not establish candidate-policy competence, paper matchup strength, a final fixed-60 nomination, or any win-rate claim. The candidate deck is unchanged and still experimental.

## Next
1. Await Agent36 / Agent46 review of exact head `aabf76a`; do not merge PR #69 or change the fixed deck based on contract evidence.
2. Keep any follow-up within the authorized candidate/opponent pair and the current Critic convergence scope. Avoid reopening the declined Budew/Ranger lane or adding a new workflow.
3. No fixture/game dispatch without the explicit owner go/no-go. No competitive or 99.5% claim.
4. At each checkpoint, read this lease and compare actual UTC clock; orderly release only at/after `12:06:15.392Z`.

---

# 2026-11-26 04:20 UTC — no-game registration identity confirmed against current main

- Compared PR #76 branch and current main: candidate policy blob 59466565caa241558c3ed62a331c56228c30e3d1 and rank-1 opponent policy blob 1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd are identical. The entire V3_FIXTURE registration block is byte-identical too, including both printed-60 hashes, policy paths/versions, role identities, and Twinleaf pin. Therefore the passing no-game witness uses the same registered decks, policy source, and engine as current main; only the guard/workflow behavior differs.
- Precise main workflow inspection: the current main workflow has AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM on the *preflight step* (around line 347), but the live fixture runner step (around lines 823-830) still does not receive it. Missing key still selects sanitized-only; main runner still lacks requireEncryptedFullDiagnosticMode. Earlier broad string check was a false positive because it matched the preflight env, not the live runner.
- Agent49 received this exact comparison; PR #76 body now records byte-identical policy sources and V3_FIXTURE block. The Actions variable's actual configured value remains unverified (no variable-management connector).
- Current-main no-game and guard integration remains pending; do not dispatch.

---

# 2026-11-26 04:18 UTC — witness cell-level audit and key-config limitation

- Inspected the downloaded artifact 15086561820 cell by cell. Each of the four role × physical-seat cells has rootDecisionCount=1, promptDecisionCount 2 or 3, workerDecisionCount 4 or 5, actionFrontierItemCount 3–6, selectedActionValidated=true, acceptedRootActions=0, liveActionDispatched=false, gameExecuted=false, actorOnlyWorkerInput=true, nativeStateDisclosedToWorker=false, opponentPrivateZonesDisclosedToWorker=false, physicalSeedDisclosedToWorker=false, policySeedDisclosedToWorker=false, workerFailureCount=0, allWorkerSessionsClosed=true, and policyRngReplayable=true. The same fixed deck/policy hashes are bound across all four cells. This is a valid no-game worker/seat/role witness, not a game.
- Tried to inspect the Actions repository variable AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM through the available GitHub fetch endpoint; the endpoint is not allowed and no variable-management connector is available. Therefore key presence remains unverified; do not infer it from the passing no-game witness. Owner must confirm configuration.
- PR #76 body now notes that current main already has the corrected Agent21 null expectation and that only five substantive files need transplant. No merge or game dispatch.

---

# 2026-11-26 04:14 UTC — current-status docs refreshed; prior Agent11 requests already closed

- Updated root README current-status line and results/README V3 diagnostic bullet in commits d4a7e8e013b3f3b36f399c1b0bc6044006c0b640 and adaac0da9e3dc9b1314d4995c6a3a258697ac7a9. They now distinguish the passing exact-head PR #76 no-game gates from current-main status, state the no-game-only boundary, and direct Agent49 to the five-file transplant. No fixed-60 or competitive status changed.
- Re-read the Agent11 messages in Agent6's inbox. These were already answered by the prior Agent6 incarnation: the joint Prize intersection is in communications/agent11/2026-11/20261126T0208Z_agent6-prize-overlap-verification.md; the Radiant board-access adapter review and corrected 2M estimates are in communications/agent11/2026-11/20261126T0225Z_agent6-radiant-board-model-review.md and 20261126T0229Z_agent6-radiant-board-2m-correction.md. Do not repeat the model or treat the initial 56.2209% adapter rate as corrected; the corrected estimates are 53.1786% strict tree, 54.3985% V-for-FSS, and 52.6136% 17-non-Basic-fodder sensitivity, all structural proxies only.
- The prior 14 Nov snapshot and current board still show 29/32 authenticated Aichi source lists, 0/32 qualified competitive matchups, no final fixed 60, and no demonstrated 99.5% win rate. No game has been dispatched in this invocation.

---

# 2026-11-26 04:10 UTC — ability-order consumer scope resolved; PR transplant handoff sent

- Agent3's 04:08Z acknowledgment confirms the current V3 candidate/opponent pair does not consume abilityLockActivationOrder. The raw actor-observation slot metadata can remain unchanged for the bounded PR76 gate; the Agent21 cleared-Bench expectation of null and >0-to-null normalization match the pinned source. Any future consumer must filter Active + abilityLock:true + positive safe integer (or use a semantic projection). No further actor-observation code change is needed for PR76.
- I inspected current V3 consumers: agent6-rank1-shadow-rider-opponent-policy.cjs uses abilitySuppressions (unknown/null fail-closed) and does not read abilityLockActivationOrder; agent46-candidate-policy.cjs and agent36-v3-runner.cjs have no direct order-field reference.
- Sent Agent49 a concrete current-main transplant handoff: main still permits missing-key sanitized-only fallback in workflow lines 356-360 and does not pass the validated PEM to the live runner step; the PR adds the fail-closed runner guard and runner key binding. Keep current main's pre-existing RSA parsing/type/2048-bit validation. If cherry-picking, omit erroneous intermediate 82f973d; apply final tree state from 1e65ff55.
- Fresh comparison at 04:10Z: PR branch remains 15 commits ahead / 83 behind current main (main e886199a96a04c508ca742de9fc4289a588b596e; merge base dd1cc61df5182ebf9e73eaf215e81dc9b5d53c78). Do not merge as-is; V3 steward Agent49 should transplant/reconcile.
- Agent49, Agent21, Agent2, Agent1 and Agent4 have been sent status/review messages. Agent3 has acknowledged. Await substantive responses; do not create parallel workflows or dispatch a fixture.

---

# 2026-11-26 04:05 UTC — exact-head V3 no-game witness passed; Agent6 continuation

## Invocation and lease
- Initial CSPRNG draw: 6/10, normal research mode. Agent6 was available because the prior lease had been released at the preceding incarnation's 70-minute checkpoint.
- Current immutable lease: 2026-11-26T03:52:29.975578548Z, run agent6-chat-20261126T035229Z-normal6-gpt6-policy-vertical-slice, claim commit ecc4e1f8200d7916827195b35a27df5671262b02. 70-minute orderly-release threshold: 2026-11-26T05:02:29.975578548Z. Do not refresh; compare actual UTC clock after every checkpoint.
- No private data was needed. Do not change other agents' leases.

## Exact V3 gate result
- PR #76 branch agent6/v3-fail-closed-guard-20261126 corrected head: 1e65ff55cca31c42ee7607311304efecbf959ad1.
- Exact-head contract-only run 45752339937 passed.
- Exact-head four-cell native no-game witness 45752443093 passed, using pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Existing workflow .github/workflows/agent36-bilateral-competence-v9.yml; no new workflow.
- Witness artifact ID 15086561820, ZIP digest sha256:04cdaf823a157fad38df4d3b4477c14eb4b7f8178cb143788e16989bf614604c. The downloaded native-no-game-witness.json records schema agent36-v3-native-no-game-witness-v2, coverage 0:0, 0:1, 1:0, 1:1 (candidate/opponent role × physical actor seat), same registered candidate/opponent deck hashes and policy hashes across all cells, actor-only worker inputs, cloned-Store action validation, unchanged original Store, closed workers, and zero worker failures. Top-level and every cell explicitly record gameExecuted=false; top-level liveActionsDispatched=false; each cell has acceptedRootActions=0. This is an engineering/no-game witness only, not a fixture game, policy-competence result, matchup, deck nomination, or win-rate evidence.
- Exact policies in the witness: candidate agent46-hood-candidate-v1 SHA256 a4acf984f859f5fc216e92ccf307bdf6f8a52de61694ae83c643d6907c62a4a3; opponent agent6-rank1-shadow-rider-opponent-v3 SHA256 be490919a86da2c80af5e58a2bb0b02875b7428bcc757fbc729694019a886371. Candidate printed-60 SHA256 1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924; opponent printed-60 SHA256 159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090.
- No fixture game or any other game was dispatched. The owner-controlled two-game physical-seat-swap go/no-go and encrypted-full key confirmation remain outstanding. Stage-A/issue #72 is a separate frozen owner decision.

## Ability-lock test failure: corrected diagnosis
- Earlier no-game run 45745695972 at branch head 77af3ac54fb8fa791050b0d9f4793d2a9becd865 failed two Agent21 assertions at test line 73 (both seats, null !== 0). Initial diagnosis in messages 20261126T035712Z_agent6-ability-lock-projection-root-cause.md and 20261126T035712Z_agent6-pr76-ability-lock-projection-fix.md was wrong and explicitly retracted in follow-up messages.
- Pinned Twinleaf source confirms native PokemonCardList.abilityLockActivationOrder initializes to 0, and CLEAR_ABILITY_LOCK_ACTIVATION writes 0 when a Pokémon leaves Active. Agent21's direct native-state assertion at line 65 already passed.
- The research actor-observation contract intentionally normalizes native zero (no established locker) to null, exposing only positive established activation orders. Existing tests/actor-observation-contract.test.cjs:197-244 explicitly asserts zero-to-null at lines 235-243. Thus the production projector was correct; Agent21's new projected-view assertion was stale.
- A temporary wrong helper change was committed at 82f973d7c94c896ea5a99a922510c7fafa8f9ded; exact-head contract-only run 45752134781 failed because it contradicted the existing zero-to-null contract test. It was reverted. The helper is back to original blob 712dc196f0d6316545efedf3f682c232ef0403c9. Only the Agent21 assertion was changed to expect null with an explanatory message. The corrected head is 1e65ff55; contract-only and no-game gates both pass.
- Correction sent to Agent21 and Agent49; Agent2 asked to independently inspect the receipt; Agent1/Agent4 asked to review the bounded key/workflow guard.

## PR and integration state
- PR #76 remains draft. Its description now records exact-head run IDs, artifact digest, no-game scope, corrected test disposition, and the fact that it is not merge-ready.
- At 04:03Z, compare showed branch agent6/v3-fail-closed-guard-20261126 was 15 commits ahead / 67 behind current main, diverged at merge base dd1cc61df5182ebf9e73eaf215e81dc9b5d53c78. Do not merge this branch as-is. Agent49 is the V3 integration steward; hand off the exact receipts and let the steward reconcile the bounded guard/test changes onto current main, preserving mainline changes, then rerun existing exact-head contract-only and no-game gates.
- Messages sent at 04:04Z to Agent49, Agent21, Agent2, Agent1, Agent4 under their 2026-11 mailboxes. Wait for substantive review; do not create parallel workflow or dispatch.

## Objective status and next actions
- Still no selected final fixed 60, 0/32 qualified competitive Aichi matchups, and no demonstrated 99.5% field win rate.
- Next: (1) obtain Agent49's integration disposition and independent Agent1/Agent4 guard review; (2) have Agent2 review the exact witness artifact and actor/seat invariants; (3) keep PR #76 draft until the bounded patch is reconciled onto current main and exact-head gates pass; (4) do not dispatch the registered two-game fixture without explicit owner go/no-go and valid encrypted-full key configuration.
- Do not expand MCTS, candidate variants, statistics, or other sidework. The 03:15Z and 03:34Z Critic broadcasts prioritize one owner-authorized complete game and trace-to-learning loop; this invocation has only passed a no-game engineering gate.
- Useful references: communications/broadcast/2026-11/20261126T031528Z_critic_trace-to-learning-loop-convergence.md, communications/broadcast/2026-11/20261126T033444Z_critic-mcts-ci-lane-convergence.md, communications/agent49/2026-11/20261126T040426_agent6-pr76-four-cell-no-game-pass.md.

---

# Final handoff — 2026-11-26T03:12Z (Agent6 normal incarnation releasing at 70-minute lease age)

## Durable work
- Radiant first-turn access audit: `results/aichi-2026/2026-11/agent6-radiant-gate-board-access-correction-20261126.md`. Corrected independent 2M estimates: 53.1786% strict search tree; 54.3985% with V-for-FSS intermediate search; 52.6136% V-for-FSS with only 17 non-Basic `Other` fodder. Board+one Psychic Energy in hand: 47.7813% / 49.0102%. These are resource-access estimates, not win rates. Exact Radiant-only Active false positive: 2.69867356% of legal sevens; OtherBasic must be Active in 42.0930874% of legal openings. Linked from `results/README.md`.
- Corrected sample-stream identity: my 2M run is an independent replication, not Agent11's exact same shuffle stream; clarifications sent to Agents11 and15. Agent11's initial 56.2209% is not a literal playable Gate board rate.
- V3 fail-closed guard draft PR #76: `https://github.com/FlareZ123/experiment-01/pull/76`, branch `agent6/v3-fail-closed-guard-20261126`, head `46caf8e5599c173c8b3ae92c73f6fe2f35ea5b07`. Exact-head contract-only run `45746829101` passed. Agent2 reviewed current head and reports no remaining issue in this guard/test slice. PR remains draft/unmerged.
- V3 guard behavior: workflow fails closed on missing recipient key before compile; runner requires encrypted-full, valid RSA >=2048, canonical repository and approved workflow identity; no-game witness `witnessOnly` remains sanitized/key-free. The workflow performs subsequent encryption, so direct local/fork invocation is blocked.
- Four-cell native no-game witness run `45745695972` failed on two unrelated Agent21 ability-lock-order tests (both seats, `null !== 0`) and one stale V3 workflow assertion. The V3 assertion is corrected in PR #76. Agent21 notified at `communications/agent21/2026-11/20261126T0300Z_agent6-no-game-test-failures.md`; Agent49 notified at `communications/agent49/2026-11/20261126T0301Z_agent6-no-game-gate-failure-isolated.md`. Rerun after Agent21 resolves the test blocker.
- No fixture game was dispatched. The owner two-game go/no-go and key confirmation remain outstanding; PR #76 does not authorize a game.

## Next actions
1. Monitor Agent21's ability-lock test fix; then rerun the exact-head four-cell native no-game witness on PR #76's current head.
2. Keep PR #76 draft until the no-game gate passes; do not merge or dispatch a fixture game without owner authorization.
3. Agent11/15 should incorporate the Radiant active/fodder corrections into their own adapter and preserve exact sample provenance.
4. Continue toward one fixed legal 60-card deck and the full Aichi Top32 matchup evidence. No claim of 99.5% performance is justified.

This memory update and all useful state were pushed before lease deletion. This incarnation has reached the 70-minute release threshold and will now release Agent6.
---

# Current status — 2026-11-26T03:08Z (supersedes 03:04Z status)

- PR #76 current head `46caf8e5599c173c8b3ae92c73f6fe2f35ea5b07` remains draft/unmerged. It contains the bounded V3 fail-closed correction: fixture-only missing-key preflight fails before compile; live runner requires encrypted-full, valid RSA >=2048 key, canonical repository identity, and the intended GitHub Actions workflow (the workflow performs subsequent encryption); no-game witness retains the explicit sanitized/key-free `witnessOnly` bypass.
- Agent2 re-reviewed the current head and reports **no remaining issue** in the guard/test slice, including the canonical-repository check.
- Exact-head contract-only run `45746829101` **passed** on current head `46caf8e5599c173c8b3ae92c73f6fe2f35ea5b07`.
- Full four-cell no-game witness has not passed: earlier run `45745695972` failed on two unrelated Agent21 ability-lock-order tests (`null !== 0`, both seats) and one stale V3 workflow assertion. The V3 assertion is corrected in PR #76; Agent21 was notified in commit `365f7b5b936dd83981bb1f793e98ec0686ec2e94`, and Agent49 in `90616d721fc54371931ec17fd1220f59a4d1f1fd`. Do not rerun until Agent21 resolves the test blocker.
- No game dispatched. The first V3 fixture pair still requires explicit owner go/no-go and key confirmation; PR #76 does not authorize it. Keep PR draft until the no-game gate can pass and any final review is complete.

---

# Current status — 2026-11-26T03:04Z (supersedes 03:01Z status)

- PR #76 current head `8a88d1261d3c52cfdc62259acf3f25becf33a2f5` adds the direct-runner hardening suggested by Agent2: in addition to encrypted-full mode and RSA-2048+ key validation, live fixture execution now requires `GITHUB_ACTIONS=true` and `GITHUB_WORKFLOW_REF` to identify the specific workflow that performs subsequent private-artifact encryption. The explicit `witnessOnly` no-game path remains sanitized and bypasses this live-only marker.
- Agent2's earlier review of head `77af3ac54fb8fa791050b0d9f4793d2a9becd865` found no blockers and one non-blocking direct-output safety note; addressed in the current head and re-review requested in `communications/agent2/2026-11/20261126T0304Z_agent6-pr76-workflow-marker.md`, commit `91f44752fc70080881444a38c315bb530136a6d4`.
- Contract-only run `45746347405` passed on head `eb4719f1692d34daf946631fa091e40ff94b9cf6`. A fresh exact-head contract-only run `45746490080` is queued on current head `8a88d1261d3c52cfdc62259acf3f25becf33a2f5`.
- Four-cell no-game witness `45745695972` failed due two unrelated Agent21 Ability-lock order tests plus one stale V3 workflow assertion; the V3 assertion is corrected in PR #76. Agent21 and Agent49 have been notified. Do not rerun until Agent21 fixes their tests or explicitly confirms the expected active-slot source.
- No game dispatched. PR remains draft/unmerged; owner two-game authorization and key configuration remain separate. Do not merge until current-head contract-only passes and Agent2 re-review is received. Full no-game witness is still blocked by Agent21 tests.

---

# Current status — 2026-11-26T03:01Z (supersedes 02:45Z status)

- Took over the bounded V3 fail-closed correction after both original assignees approached/exceeded lease thresholds and no implementation branch was visible. Draft PR **#76**: `https://github.com/FlareZ123/experiment-01/pull/76`, branch `agent6/v3-fail-closed-guard-20261126`, head `16cb6d83a9e92b34cb5b00a5dd57e55e695ad3d1`.
- Five files changed: workflow missing-key preflight now throws before compilation (existing RSA >=2048 validation preserved); live single-seat and paired runner require encrypted-full plus nonempty recipient key; workflow passes the validated public key into runner; no-game witness remains sanitized-only via `witnessOnly`; three existing contract tests updated.
- Exact-head contract-only run `45745566241` passed on earlier head `77af3ac54fb8fa791050b0d9f4793d2a9becd865`. Fresh contract-only run `45746059301` on current head `16cb6d83a9e92b34cb5b00a5dd57e55e695ad3d1` is in progress.
- Four-cell native no-game witness run `45745695972` on earlier head reached the full test bundle. New V3 runner guard tests and no-game witness unit tests passed; it failed on one stale V3 fixture workflow test (now updated in PR #76) and two unrelated Agent21 ability-lock-order tests at `tests/2026-11/agent21-ability-lock-order-native-projection.test.cjs:73` on both physical seats (`null !== 0`). Agent21 notified in commit `365f7b5b936dd83981bb1f793e98ec0686ec2e94`; Agent49 notified in commit `90616d721fc54371931ec17fd1220f59a4d1f1fd`. No game dispatched.
- Requested independent Agent2 review in `communications/agent2/2026-11/20261126T0256Z_agent6-review-pr76.md`, commit `95a98047ddbe05391f5c4e37c3ae4cc676e23c21`. Agent49 has been updated about the patch and gate blocker.
- **Next:** monitor fresh contract-only run; ask for no-game rerun only after Agent21 blocker is fixed. Keep PR draft/unmerged pending independent review. Do not dispatch any fixture game; owner two-game authorization and key configuration remain separate.

---

# Current status — 2026-11-26T02:45Z (supersedes 02:42Z status)

- **V3 guard ownership risk:** Agent4's lease is `2026-11-26T01:13:50.713Z`; at 02:44Z it was ~90.5 minutes old, beyond the 90-minute hard runtime. No main-branch implementation commit was visible, and branch searches for `v3-key` / `guard` found no obvious Agent4 implementation branch. I did not alter Agent4's lease or any branch. Notified Agent49: `communications/agent49/2026-11/20261126T0244Z_agent6-agent4-guard-ownership-handoff.md` (commit `9d4042bdf26f9b285aca5171487228db06f63b20`) and follow-up `communications/agent49/2026-11/20261126T0246Z_agent6-no-v3-guard-branch-found.md` (commit `d0eecb8f2dbc7e7f5a1c1ad394d6d36533d728f5`). This is a visible-state assessment, not proof no differently named branch exists. The first-game owner go/no-go/key gate remains separate.
- Read Agent3's earlier Stage-A patch review note; it does not override the current separate Stage-A owner gate. No Stage-A changes or dispatch.
- **Next:** await Agent49's reassignment/response and Agent11's corrected-model response. If Agent4's V3 guard implementation appears, review only the bounded no-game fail-closed change; do not dispatch a game without explicit owner authorization.

---

# Current status — 2026-11-26T02:42Z (supersedes 02:39Z status)

- Preserved the corrected Radiant first-turn access audit as a durable result: `results/aichi-2026/2026-11/agent6-radiant-gate-board-access-correction-20261126.md` (final formatting commit `03dc4416a7a558d092585fe7d0d264c6f90302b0`; initial creation `470ff66e008293de2b274bbc16331c9ca936cda3`). It records the exact opening-hand corrections, independent 2M estimates, board-plus-one-Energy estimates, searcher assumptions, sample-identity caveat, and limitations.
- Linked the audit from the relevant existing Radiant/Regidrago setup-arithmetic paragraph in `results/README.md`, commit `8b315e5df1ab2ee8378b633d646441fa1c14f671`. This is a targeted synthesis link, not a new deck nomination.
- Agent11 has not yet committed an updated adapter/report or acknowledged the corrections. Continue to avoid editing their files; the exact model changes and independent results are documented and communicated.
- **Next:** wait for Agent11's response or any concrete request. Do not start a joint post-Gate energy model without coordination; do not multiply conditional probabilities. First V3 diagnostic remains owner-gated; no game dispatched.

---

# Current status — 2026-11-26T02:39Z (supersedes 02:36Z status)

- Derived two exact opening-hand corrections for Agent11's Radiant adapter:
  - Radiant is the only Basic in the opening seven with probability **2.81554525% conditional on a legal seven**. Given that opening, at least two VMAX remain in deck after six Prizes plus the first draw with exact probability **254/265 = 95.8490566%**. Thus the exact false-positive event counted by `can_finish(state,0,0)` is **2.69867356% conditional on a legal seven**. Derivation/message: `communications/agent11/2026-11/20261126T0237Z_agent6-exact-radiant-active-correction.md`, commit `2950f1fd578264b3b5101bf65a09eea59336916a`; forwarded to Agent15 in commit `4904de44ad46c29c25d9502ec06ffe09b9be4b34`.
  - An `OtherBasic` must be the starting Active in **42.0930874% of legal openings** (exact numerator 140,036,226 / denominator 332,682,240), whenever no Mimikyu or Shadow Rider V is in the opening and at least one OtherBasic is. The Active is not in hand and must be removed from generic `Other` fodder. Message: `communications/agent11/2026-11/20261126T0238Z_agent6-exact-otherbasic-active-frequency.md`, commit `57cb1dcf1f9c2dcf6c64b6a64109e7b6300c715c`.
- These exact terms explain why the uncorrected 56.2209% is not a literal Climactic Gate board rate. The corrected Monte Carlo estimates remain independent replications, not exact same-stream reprocessing; sample identity clarification is already sent and recorded above.

---

# Current status — 2026-11-26T02:36Z (supersedes 02:33Z status)

- **Sample identity correction:** the Radiant simulations used the reconstructed 60-card candidate composition and seed 20261126, but did not reproduce Agent11's exact shuffle stream. Agent11's run has 1,722,459 legal sevens; my independent 2M run has 1,722,936. Treat my 2M rates as an independent Monte Carlo replication, not a same-sample correction. Clarifications sent to Agent11 (`communications/agent11/2026-11/20261126T0236Z_agent6-sample-stream-clarification.md`, commit `35ddb388387632e9bb3073978a185705fc2e096d`) and Agent15 (`communications/agent15/2026-11/20261126T0236Z_agent6-sample-stream-clarification.md`, commit `c0dd212e4d8397e237f2aa5c017b95d2b06f139f`). The model corrections/rates remain valid independent estimates; exact same-environment replication should be rerun by applying the corrections directly to Agent11's script.
- Do not describe the 1M values as the first million of Agent11's stream; they are independent as well.

---

# Current status — 2026-11-26T02:33Z (supersedes 02:29Z status)

- Also corrected Agent11's board-plus-one-Psychic-Energy-in-hand event on the same 2M JSON-order / seed-20261126 sample and with the same Active/fodder corrections: strict v0 **823,241 / 1,722,936 = 47.7813%** (95% Wilson 47.7067–47.8559%); V-cap-one FSS-host extension **844,415 / 1,722,936 = 49.0102%** (95% Wilson 48.9356–49.0849%). Conditional on the corrected board event, one Energy is accessible in 89.85% / 90.09% respectively. This is Energy in hand by end of the first-turn search sequence, not an attached-Energy or turn-3 attack result.
- Sent this correction to Agent11: `communications/agent11/2026-11/20261126T0231Z_agent6-board-plus-energy-correction.md`, commit `5e211b018661418b2170cf2b3744174fadfd4a9c`. Their memory commit `051c00e0c3f2d4195c79f7a8b32733a8c1addede` still records the initial 56.2209% / 50.1756% values; no acknowledgment or corrected adapter commit seen yet.
- Do not multiply the first-turn board-plus-Energy rate by the conditional post-Gate energy model. It is still not a joint per-game estimate; first-turn search choices change the hand/deck/Prize state.
- **Next:** await Agent11's response or corrected report; no further model expansion unless requested. The V3 first-game owner authorization and Agent1/Agent4 preflight fix remain pending.

---

# Current status — 2026-11-26T02:29Z (supersedes 02:26Z status)

- Completed a full 2,000,000-deal corrected Radiant-board run on the JSON-order deck construction, seed 20261126. Legal openings: **1,722,936**. Strict `v_target=0` with Radiant-only Active excluded and active OtherBasic removed from fodder: **916,233 / 1,722,936 = 53.1786%** (95% Wilson 53.1041–53.2531%). Allow one V as an intermediate Forest Seal Stone host without terminal V requirement: **937,251 / 1,722,936 = 54.3985%** (95% Wilson 54.3241–54.4728%). Restrict fodder to 17 non-Basic Other cards in the V-for-FSS model: **906,499 / 1,722,936 = 52.6136%** (95% Wilson 52.5391–52.6882%).
- Sent full 2M correction to Agent11: `communications/agent11/2026-11/20261126T0229Z_agent6-radiant-board-2m-correction.md`, commit `c0c20e37450d2946b3dc211cd3a636da9370f291`. Sent full-sample confirmation to candidate owner Agent15: `communications/agent15/2026-11/20261126T0229Z_agent6-radiant-board-2m-confirmation.md`, commit `6059bdd474f96b6c5ce169115e4d1563d625d7f1`.
- Agent11's 56.2209% is an uncorrected proxy that includes Radiant-only Active openings and can use the starting OtherBasic as discard fodder. The corrected event must require Radiant be playable onto Bench. `v_target=0` is right for terminal board requirements but disables V search for an FSS host; decouple intermediate V search cap from terminal V requirement.
- The 25-Other fodder model remains optimistic; the 17-nonbasic sensitivity is useful but not a strict lower bound (Mimikyu is still protected and some nonbasic Others are not expendable). Do not combine these first-turn rates with conditional post-Gate Energy rates by multiplication; the searcher line changes the hand/deck state.
- **Next:** wait for Agent11's response/update; do not expand this proxy analysis without a concrete decision-changing request. First V3 game owner authorization and Agent1/Agent4 key-preflight correction remain separate pending gates.

---

# Current status — 2026-11-26T02:26Z (supersedes 02:19Z status)

- Reviewed Agent11's adapter `scripts/agent11-radiant-board-access.py` and sent a substantive correction: the reported 56.2209% includes legal openings where Radiant is the only Basic and therefore must start Active (it cannot trigger Climactic Gate from the Active); it also counts an `Other` Basic chosen as Active as discard fodder.
- On the first 1M deals of Agent11's exact JSON-order / seed-20261126 stream (861,133 legal sevens), excluding Radiant-only Active and removing a starting `OtherBasic` from fodder gives **53.1956%** for the strict `v_target=0` search tree (Wilson 95% 53.0902–53.3010%). Separating V search-cap from terminal V requirement allows a valid V-for-FSS intermediate line and gives **54.4069%** (Wilson 95% 54.3017–54.5121%). An independent 2M category-order run for the latter gave 54.4510%.
- Fodder sensitivity with only the 17 non-Basic `Other` cards yields 51.3709% (strict v0) / 52.6503% (V-for-FSS), showing the 25-`Other` assumption is optimistic, not an unbiased point estimate. Mimikyu remains protected even though it is not required, so net bias is mixed.
- Full review and exact minimal adapter changes: `communications/agent11/2026-11/20261126T0225Z_agent6-radiant-board-model-review.md`, commit `395dddc7b0d67c27f138157543f1a7c0c6307a14`. Sent concise correction to candidate owner Agent15: `communications/agent15/2026-11/20261126T0226Z_agent6-radiant-board-access-correction.md`, commit `a4ccb068c3cd3ec3a5f0aaf7bb05c8ece543d85e`.
- **Next:** await Agent11's response/update to the adapter; do not multiply the first-turn board rate by the conditional Energy model. A defensible joint probability needs state propagation from the searcher line into the post-Gate Energy process. Do not expand proxy work beyond this requested correction without a concrete decision-changing reason.

---

# Current status — 2026-11-26T02:19:01Z (supersedes older "current status" sections below)

- **Invocation/identity:** normal research mode selected by actual initial CSPRNG draw **5/10**. Claimed Agent6 with immutable lease `2026-11-26T02:02:39.106Z`, run `agent6-chat-20261126T020239Z-normal5-gpt6.2-v3-priority-review`; claim commit `faa25e6d4c4b232deb1f46a9e98a8cfaed249778` was read back from main. Do not refresh. The 70-minute release threshold is **2026-11-26T03:12:39.106Z**; after every checkpoint compare this timestamp with an actual runtime clock.
- **Current owner gates:** issue #25 still has no explicit owner go/no-go for the first V3 diagnostic game or owner-key confirmation. The mainline fail-closed key preflight / encrypted-full live-runner guard correction is assigned to Agent1/Agent4. Do not dispatch a game, create a new harness/serializer/workflow, or repeat authorization requests. Stage-A issue #72 remains a separate, unaccepted owner gate; do not patch or dispatch it.
- **Critic direction:** preserve the fixed candidate/opponent diagnostic pair and converge work on it; no new candidate variants, policy scopes, PR73 continuation, or proxy-only card deltas without a decision-changing whole-game hypothesis. PRs #69/#71 remain frozen. No deck, policy, or PR changes made in this incarnation.
- **Mailbox reviewed:** Agent2's V3 dispatch stopline, Agent31's K1 cross-check, Agent46's statistical-design handoff, and Agent11's two specific access-model requests. No other identity state or lease was changed.
- **Agent11 request 1 — joint Prize overlap:** independently derived the legal-seven-conditioned intersection of Copycat capacity cut and Fairy Zone hard Prize denial for the registered 14-Basic list. Exact denominator **7,637,545,871,155,200**; Copycat event 2.3669091034%, Fairy Zone event 0.0562028943%, intersection 0.00564545938%, union 2.4174665383%. Message: `communications/agent11/2026-11/20261126T0208Z_agent6-prize-overlap-verification.md`, commit `bff83f08e086710f6c2a2565130c5989495ea3e4`.
- **Agent11 request 2 — Radiant board access:** extended the 15 Nov searcher state transitions to estimate first-turn Radiant-on-Bench plus at least two VMAX remaining in deck, without Mimikyu/E1/E2. 2,000,000 Monte Carlo deals, seed 20261126; 1,722,737 legal openings, 938,047 successes; **54.45097% conditional on a legal seven**, 95% Wilson interval 54.37659–54.52533%. Excludes a Radiant-only Basic opening (Radiant would be forced Active); uses the original simplified searcher/discard assumptions. Message: `communications/agent11/2026-11/20261126T0218Z_agent6-radiant-board-access.md`, commit `2b35cbc07f68d8b584676bf47e12afb27329dfee`.
- **Important interpretation:** the 54.45% is a first-turn resource-access estimate, not a game/match result. Do **not** multiply it by Agent11's conditional post-Gate Energy probabilities as if independent: first-turn searcher choices change the remaining hand/deck/Prize state. A joint per-game estimate requires carrying post-Gate states from the first-turn search DP into the Energy model.
- **Next useful work:** wait for Agent11's response on whether they want a coupled joint state model; otherwise do not expand proxy work. Monitor the assigned V3 preflight correction only for a concrete review need. Preserve the owner authorization boundary.

---

# Current status — 2026-11-25T23:18:16.083Z (supersedes older "current status" sections below)

- **Invocation/identity:** normal research mode selected by actual initial CSPRNG draw **3/10**. Claimed Agent6 with immutable lease `2026-11-25T23:17:38.290Z`, run `agent6-chat-20261125T231738290Z-normal3-gpt6-stageA-owner-gate`; claim commit `1b7a2c89ad518322de606923174d6565ac68b5f6` was read back from main. Do not refresh. The 70-minute release threshold is **2026-11-26T00:27:38.290Z**; after every checkpoint compare this timestamp with an actual runtime clock.
- **Stage-A / owner gate:** issue [#72](https://github.com/FlareZ123/experiment-01/issues/72) remains open with no owner A/B decision. Stage-A is **NOT ACCEPTED**. The two exact-SHA contract/no-game gate passes are not game or competence evidence; no fixture/game ran. Do not patch, dispatch, add a workflow, or infer the owner's choice. If owner chooses A, the authorization is one acceptance-only patch on the existing branch for the three issue-72 defects, followed by the existing exact-SHA contract-only and four-cell no-game gates plus Agent4 review; no fixture/game. If B, retire the lane. Critic's 22:26Z broadcast recommends one bounded A only after owner approval, while keeping game execution separately gated.
- **Causality:** the Stage-A ordinal-23 failure is not proven to be caused by PR #62. The failed trace has no selected action, worker decision, or validation receipt; do not claim the synthetic PR #62 defect explains it.
- **Policy / PRs:** PRs #69 and #71 remain frozen at their reviewed scopes; do not extend candidate/rank-1 policy, rerun contracts, or dispatch a no-game witness without a separate scope decision. The rank-1 policy still has known owner-K1 and other capability gaps; contract/no-game receipts do not establish competence. The owner-K1 findings from Agent43 are a future scope item, not authorization to edit.
- **Lockbridge / PR #73:** Critic's 22:04Z direction parks PR #73 and its report/script as historical supporting analysis. Agent21's package-level Hood Shield vs Lockbridge synthesis is already complete and preserves both exact 60s unranked. Do not add more VS Seeker/Guzma-displacement sensitivities, Prize-only reports, candidate variants, or another synthesis unless a new result changes the two-list decision or supplies a specific testable whole-game hypothesis.
- **Benchmark:** issue #59's candidate-only English Expanded vs unchanged original Japanese Extra Top32 contract and public physical-seed reproducibility decision are settled. Current board: 29/32 exact source lists authenticated; ranks 23/25/28 missing; 0/32 qualified competitive matchups; no selected final fixed 60; no demonstrated 99.5% field rate. Do not conflate source authentication, physical-copy certification, structural deck construction, policy competence, or competitive matchup evidence.
- **Current highest-value action:** preserve the owner decision boundary and do not manufacture another report or verification loop. The strategic next milestone after the applicable owner approvals is one complete actor-only diagnostic game with an unchanged candidate 60 and explicit rank-specific opponent policy, using the already-existing full-state diagnostic/trace path and independent strategy review. Do not create another serializer, runner, workflow, or parallel harness. The first trace is diagnostic, not a qualified matchup; improve general policy/simulator causes from the trace rather than one-scenario patches.
- **Twinleaf:** keep the upstream pin at `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No upstream changes.

---

# Agent 6 — persistent research memory

## Current status — 25 November 2026 10:22 UTC (overrides older sections)
- **Current blocker:** owner direction on issue [#72](https://github.com/FlareZ123/experiment-01/issues/72). Stage-A is frozen by Critic's 09:14 directive; no new patch, workflow, dispatch, fixture, or game until the owner decides. The existing Stage-A trace does not establish PR #62 causality; the relationship is explicitly **unproven**.
- **Policy work is frozen:** older PR #70 / PR #71 policy-v3 notes below are historical context, not current authorization. No more policy extensions, contract reruns, or native witnesses without a separate scope decision.
- **Latest substantive research:** `results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md`, exact legal-seven-conditioned Prize-recovery / opening-access analysis for Hood Shield, the rank-1 champion reference, and Lockbridge. It is a structural proxy only; no deck is nominated or changed, no game or matchup was run, and no 99.5% claim is supported.
- **Twinleaf:** verified submodule path `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No submodule changes.
- **Lease:** original immutable claim is `2026-11-25T09:33:50.594092401Z`; 70-minute release threshold is `2026-11-25T10:43:50.594092401Z`. Do not refresh. At/after threshold, finish memory and verification, then delete the lease as the final repository mutation.

## Current program
Continue rank-1 Shadow Rider opponent-policy v3 competence work. This is a policy-quality workstream, not a decklist change. The published 60-card rank-1 reference list remains unchanged. Do not claim competitive competence, matchup win rate, or progress toward 99.5% from contract-only evidence.

## Current implementation / review
- Review PR: [#70](https://github.com/FlareZ123/experiment-01/pull/70), draft branch `agent6/rank1-policy-v3-review-20261124`.
- Tested policy blob: `0c8573581232a88a9c6b36d6040d622d0b3abe30`.
- Tested regression-test blob: `b39132ba87fca35c8238f3fe95e11fdbcb7cf61d`.
- Source/test commit on the original repair branch: `a5ba464b92092a033f015fcea79af8497b90151c`.
- Contract-only run on source/test commit: [45416861911](https://github.com/FlareZ123/experiment-01/actions/runs/45416861911).
- Contract-only rerun after porting onto the current main baseline: [45418790071](https://github.com/FlareZ123/experiment-01/actions/runs/45418790071), review-branch head `b5551c34bcf7ea86707223e8d574b32ac12edb52`.
- Both contract-only runs passed. The rank-1 policy regression file has 103 tests and is included in the contract suite. No native fixture/game or Aichi matchup was run.

## Implemented changes
1. Quick Ball FST 237 now distinguishes the mandatory actor-hand discard prompt from the later deck search using exact source, description, owner, zone, bounds, and cancelability. Payment ranking protects singleton Shadow Rider V/VMAX, unique Pokémon and one-of resources, and prefers redundant search cards/duplicates. The later search still uses retrieval scoring.
2. Mysterious Treasure's forced-discard fallback ranks all legal choices, including negative-score choices, and protects singleton Shadow Rider V/VMAX rather than taking native choice order.
3. Radiant Eternatus / Climactic Gate suppression now accounts for Path to the Peak and Silent Lab using either player's global Stadium/Tool epoch; Active Klefki, Wobbuffet and Iron Thorns on either side; opponent Active Neutralizing Gas; Power of Alchemy from either board; and Tool-equipped Garbotoxin on any face-up slot. Ability-name checks avoid printing-only omissions; Field Blower target matching recognizes Garbodor DRX 54, LTR 68, and BKP 57.
4. Clefairy search/play checks Dragons across opponent Active and Bench. Fairy Zone damage applies only to an Active Dragon target when Fairy Zone is explicitly known active and Stealthy Hood is not effective; Tool-effect suppression is global across either player's epoch.
5. Field Blower is considered for effective lock Stadiums or live opponent Tools when Underworld Door is available. Mode choice, opponent-only Tool-bearing Pokémon targets, no-target behavior, Garbotoxin priority, and Dragon/Stealthy Hood priority are covered by synthetic prompt tests.

## Important limitations
- The actor observation contract deliberately emits `abilitySuppressions[].suppressed: null` until a source-attributed resolver exists. Therefore Fairy Zone damage remains fail-closed in live actor observations; synthetic tests with explicit `suppressed: false` do not prove live Fairy Zone operation.
- Field Blower and discard values are heuristics, not calibrated through game outcomes.
- Both successful workflow runs were `contract_only`; no native game, paired fixture, matchup sample, or win-rate estimate exists.
- The repaired policy is not independently competent yet. Agent2 and Agent11 review is pending. Do not merge PR #70 or unfreeze Stage A / Stage B based solely on these contracts.

## Next actions
1. Read any new replies in `communications/agent6/` and the latest relevant broadcasts.
2. Obtain independent review of PR #70's exact policy/test blobs from Agent2 and Agent11. Agent2 should challenge Quick Ball scoring and the complete Gate lock inventory; Agent11 should validate Field Blower prompt source/metadata/choice-index assumptions and Fairy Zone/Hood behavior.
3. Keep the Fairy Zone multiplier disabled when Ability suppression status is unknown. Resolve the adapter gap only with source-attributed evidence; do not infer from printed Ability text.
4. Do not launch a native fixture/game unless a separate owner/Critic authorization lifts the Stage-A retry freeze.
5. If review identifies a defect, fix the code and tests, then rerun the existing `agent36-bilateral-competence-v9.yml` workflow with `contract_only: true` on the exact new source/test revision.


## 2026-11-24 23:11Z — rank-1 review checkpoint

- Claimed Agent6 at `2026-11-24T23:03:43.357Z`; the immutable 70-minute release threshold is `2026-11-25T00:13:43.357Z`. Do not refresh the lease; after each checkpoint compare the actual clock with that timestamp.
- Current branch ref `agent6/rank1-policy-v3-review-20261124` points to `885301c5273d4a127bd7ecc158ae8e5b3423dfb7`. Policy/test blobs remain `11a2b633cd3fecead2df0946264d62aced86ac39` / `42c9903b59361a8f72e457f8bbf7dd52bd0f6764`, identical to exact tested head `6c7dbde71a5a21de1f272f571d74e61f3e296150` and contract-only run [45496803806](https://github.com/FlareZ123/experiment-01/actions/runs/45496803806). PR #70 is closed unmerged. The branch is now 1 commit ahead / 122 behind main; do not rebase merely to chase unrelated mainline movement.
- Agent2's exact-head review is in `results/aichi-2026/2026-11/agent2-rank1-policy-v3-exact-head-review-20261124.md`. It confirms numeric CardType mapping and identifies general Expanded helper gaps: Stage >=3 incorrectly includes V-UNION/LEGEND; LV.X needs stack-depth context; Counter Energy must distinguish uppercase Pokémon-EX/GX from newer lowercase Pokémon ex; Super Boost Energy and Neo Upper Energy are not mapped. I checked pinned Twinleaf `PokemonCardList.isEvolved()`: LEGEND and V-UNION are not evolved; LV.X on a two-card stack is not evolved. Project card pool confirms the listed Energy text. Agent2 explicitly says these special-Energy defects do not occur in the rank-1/Hood fixed pair (both use Basic Psychic Energy); defer general-Expanded completeness rather than expanding the frozen rank-1 policy without a fixed-pair consequence.
- New narrow host/policy blocker: main protocol now accepts numeric native SpecialCondition codes 0–4; this branch's `agent49-policy-protocol.cjs` still validates `specialConditions` with `stringArray`. The policy helper already handles numeric ASLEEP/PARALYZED, but its existing numeric test bypasses `checkedDecision`. Agent49 asks for one `checkedDecision` regression using actual `actorObservation()` output with [2] ASLEEP and [0] PARALYZED, asserting Pale Moon-GX versus Night Watch selection. Direct coordination: `communications/agent49/20261124T230815Z_agent6_numeric_special_condition_followup.md`; follow-up request: `communications/agent6/2026-11/20261124T230837Z_agent49-checked-decision-condition-coverage.md`.
- Agent21 reports no-game witness run [45503924321](https://github.com/FlareZ123/experiment-01/actions/runs/45503924321) failed only at the raw-source purity regex: policy comment at current line ~878 contains the word `require` ("require an actor-owned empty Bench slot"). No actual forbidden import/global API was found. Minimal safe fix is to replace the comment word with "needs" or "must have"; do not change the worker scanner unless new evidence requires it.
- Sent Agent11 exact-blob scope/coordination at `communications/agent11/20261124T230815Z_agent6_rank1_exact_head_review_scope.md`. It asks for disposition on the exact current blobs, distinguishes the general Expanded Energy gaps from fixed-pair blockers, and notes the numeric SpecialCondition follow-up.
- No policy code, test, decklist, workflow, fixture, or submodule changed in this checkpoint. No game or fixture was dispatched. Contract-only evidence is not policy competence; no matchup/win-rate/99.5% claim.
- Next: keep the current policy/test blobs fixed until the requested review disposition is available; then make one bounded update for numeric SpecialCondition validation plus actorObservation/checkedDecision behavior, and the one-word purity-comment correction only if the no-game witness is authorized. Rerun the existing exact-head contract lane only after that code change; do not dispatch a game or fixture.


## 2026-11-24 23:12Z — fixed-pair scope check

- Compared the exact fixed lists: Hood Shield Shadow Rider v1 has 11 Basic Psychic Energy, one Dimension Valley, Trevenant & Dusknoir-GX, Latias ex, Float Stone and the listed Tools; the rank-1 champion baseline also has 11 Basic Psychic Energy. Neither list contains the special Energies in Agent2's general Expanded helper findings. Those findings remain real general-Expanded completeness work, but they do not alter this fixed pair's energy-unit calculations.
- Checked Trevenant & Dusknoir-GX SMP SM217 directly in the supplied card pool: Pale Moon-GX costs [Psychic][Colorless] and its Energy-discard clause needs one extra Psychic beyond that attack cost. Dimension Valley removes the Colorless cost, so two Psychic Energy are sufficient; without Dimension Valley, two Psychic plus a third Energy unit are sufficient. Current `paleMoonHasExtraPsychicEnergy()` thresholds (`psychic >= 2` with Dimension Valley; `psychic >= 2 && total >= 3` otherwise) are correct. Do not change this path based on the mistaken [P][P][C] recollection.
- The candidate has no identified SpecialCondition-producing card in the current fixed list; the numeric Asleep/Paralyzed regression is a rules/worker-boundary completeness request from Agent49, not a demonstrated loss in this specific pairing.


## 2026-11-24 23:15Z — Copycat false-positive reconfirmed

- The frozen rank-1 policy still has the 2026-11-18 Agent11 Copycat defect: `copycatTargetAvailable(request)` at line ~687 inspects only the current opponent Active's printed attacks and ignores validated `request.publicEventReceipt.opponentCopycatChoices`. It feeds Mimikyu search/play and retreat/target scoring. Hood Shield v1 contains Shadow Rider VMAX / Max Geist, so the helper returns true even when Max Geist was not used on the preceding turn. This can spend resources on an unavailable Copycat line in the fixed pair.
- Exact test file `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` currently asserts the false-positive in tests around lines 1620, 1744, and 1802. The prompt-level `ChooseAttackPrompt` test around line 1192 is different: a genuine native prompt and its choices are authoritative; do not conflate it with pre-play Mimikyu search/play heuristics.
- Proposed bounded policy correction after review: for pre-play/retreat heuristics, require a validated non-empty `publicEventReceipt.opponentCopycatChoices` array; without a tracker-backed receipt return false. For a Copycat action already present in the native action frontier, trust that legal frontier item rather than reusing the pre-play heuristic. Add positive receipt, absent-receipt, and empty-choice regressions. The current V3 runner does not attach the tracker-backed choices, so the production policy must remain fail-closed until that integration exists.
- Sent exact-blob handoff to Agent11 at `communications/agent11/2026-11/20261124T231359Z_agent6_rank1-copycat-current-active-false-positive.md` and follow-up to Agent2 at `communications/agent2/2026-11/20261124T231422Z_agent6_rank1-copycat-fixed-pair-followup.md`. No code changed; branch remains frozen pending review disposition.


## 2026-11-24 23:17Z — Copycat card-text boundary

- Supplied card pool confirms Mimikyu GRI 58 Copycat text: "If your opponent's Pokémon used an attack that isn't a GX attack during their last turn, use it as this attack." The prior-turn predicate is explicit; current printed Active attacks alone are insufficient.
- Hood Shield v1 has four Shadow Rider Calyrex VMAX with Max Geist (non-GX) and one Trevenant & Dusknoir-GX with Night Watch (non-GX) / Pale Moon-GX (GX). The current heuristic's current-Active Max Geist positive can be false if Max Geist was not used last turn; its hard-coded Night Watch exclusion can also hide a legal non-GX prior-turn target. Keep the distinction between pre-play Mimikyu planning (requires validated prior-turn receipt) and a Copycat attack already admitted by the native action frontier / prompt (native choices are authoritative).


## 2026-11-24 23:41Z — rank-1 v3 bounded correction and no-game acceptance

- Current branch: `agent6/rank1-policy-v3-review-20261124`, exact head `32c1557a23e3a69083498ac72b2e7e0a35969d5a`. Exact blobs: policy `07d5057d2c1dd74f1b40c4eec9111eb8d0090d21`, protocol `204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766`, tests `5e14bbcec43570f90f723cd7fe3aa50d993b79eb`.
- Bounded code correction: pre-play Mimikyu search/deployment now requires validated `publicEventReceipt.opponentCopycatChoices`, rather than reading current Active printed attacks; no receipt means fail-closed. A Copycat attack already in the native action frontier still scores normally because the frontier is engine legal-action evidence. The unsupported Night Watch exclusion remains and is tested with a receipt sourced from Trevenant & Dusknoir-GX.
- Ported main's numeric `specialConditionArray` validator into the rank-1 branch. New checked-decision test feeds actual `actorObservation()` output through the worker validator for both physical seats: awake opponent chooses Night Watch, numeric PARALYZED (0) and ASLEEP (2) prevent retreat and choose Pale Moon-GX.
- Reworded the raw-source comment flagged by Agent21 so the no-game purity scanner no longer sees a false-positive `require` word.
- First contract-only run `45510665460` failed only because the old pinned actor-observation adapter expects empty Bench slots as slot objects (`{getPokemonCard:()=>null,cards:[]}`), not JavaScript `null`. Corrected the test fixture and reran: exact-head contract-only run `45510919943` passed.
- Exact-head native no-game witness run `45511057679` passed on the same SHA. It compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed Docker worker preflight, adapter/runner syntax, worker/prompt/privacy/fixture contracts, and both-role/both-seat witness checks. Fixture-game step was skipped; no game or matchup was dispatched. Artifact: `agent36-v3-native-no-game-witness-32c1557a23e3a69083498ac72b2e7e0a35969d5a`, id `14975482609`, digest `sha256:86199c86cad668380347f2cb5352425fe81c38bc18eabfed0ffd8f16839b8c42`.
- Updated canonical report `results/aichi-2026/2026-11/agent6-rank1-shadow-rider-policy-competence-v3-20261124.md` and live board `results/README.md` on main commit `49ca2771f15d481c743c843d95b9827557d09721`. The board now distinguishes contract/no-game acceptance from policy competence and competitive results.
- Fresh exact-head review requests sent to Agent2 and Agent11 at `communications/agent2/2026-11/20261124T233914Z_agent6-rank1-v3-exact-head-review-32c1557.md` and `communications/agent11/2026-11/20261124T233914Z_agent6-rank1-v3-exact-head-review-32c1557.md`; responses pending. Agent49 and Agent21 were informed of the pass. Agent2's prior Stage/V-UNION, Counter Energy EX-vs-ex, and Super Boost/Neo Upper findings remain general Expanded completeness issues; both exact fixed lists use 11 Basic Psychic Energy, so they do not alter this pair's energy-unit calculation.
- Production limitation remains: the V3 runner does not yet attach tracker-backed `opponentCopycatChoices`, so Mimikyu pre-play is deliberately unavailable until that receipt is integrated. Source-attributed Ability-suppression facts also remain incomplete. No policy-competence acceptance, Aichi matchup, win-rate estimate, or 99.5% evidence exists.
- Next actions: obtain Agent2/Agent11 exact-head review; only then consider a further bounded change for Copycat receipt integration / source-attributed suppression. Do not re-open broad generic Special Energy helper work for this fixed pair and do not dispatch a fixture game without the separate owner/Critic authorization.


## 2026-11-25 01:59Z — Copycat receipt gate repaired and contract-passed

- Reclaimed Agent6 at `2026-11-25T01:32:47.176345014Z`; the 70-minute release threshold is `02:42:47.176Z`. Continue until the measured threshold at a checkpoint.
- PR #71 replacement branch is `agent6/rank1-policy-v3-review-20261124`. The exact tested policy/test head is `3bfd7aca57eb340dd24f1ef740e55e47f94e082f`; report-only commit advanced the current PR head to `cbeb19e1c79961d80387b23f5882f202f0702c82`.
- Agent11 added the initial root/prompt Copycat receipt gates and regression tests. Static inspection found six new Active-Mimikyu fixtures used incomplete `{name,cost}` attack rows; `protocol.validateView()` requires `name,cost,damage,damageCalculation,text,gxAttack,barrage`. Commit `3bfd7ac` replaces those with complete fixture rows, tightens prompt provenance so the prompt's copied printing/attack, selected choice metadata, and validated receipt row must all match exactly, adds empty-choice prompt and mismatched-source/attack negatives, and preserves the pre-play helper's independence from the Active-only compatibility bit.
- Dedicated exact-head contract run [45529074554](https://github.com/FlareZ123/experiment-01/actions/runs/45529074554) **passed** on `3bfd7ac`: Node 22 syntax checks and 132 rank-1 policy/prompt/worker/action-frontier tests. Earlier failed runs 45526991876 and 45527187502 were on superseded head `0d39e2a`; no further workflow run is planned unless code changes.
- Current code/test blobs: policy `22d3db7d3f8b2348e12f8ad4416f024c153ed22e`; protocol `204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766`; tests `7a4b55bd38d3e028191b4d0b3371e1e253e810fd`. Evidence report `results/aichi-2026/2026-11/agent6-rank1-shadow-rider-policy-competence-v3-20261124.md` updated to current blobs/run (blob `079a49a4370d3939e88f609491d657129428cde7)); PR #71 body and results/README rank-1 status also refreshed.
- Important live boundary: V3 runner calls `eventReceipt(state, actorSeat, null, null)`; no previous-opponent-turn history or Copycat choice fields reach the policy. The host prompt projector still rejects Copycat provenance. Receipt-backed positive tests are synthetic contract tests, not live Copycat support. Do not wire tracker history until Agent49 fixes source-correct GX classification; Twinleaf currently omits `gxAttack: true` for Pale Moon-GX, Dedenne-GX Tingly Return-GX, Oricorio-GX Strafe-GX, and Arceus & Dialga & Palkia-GX Altered Creation-GX.
- Prior no-game witness 45511057679 passed on superseded head `32c1557`; it predates Copycat changes and is not same-SHA evidence for `3bfd7ac`. No native game, new no-game witness, Aichi matchup, or deck-strength result was produced. Stage-A remains retry-frozen; no fixture/game dispatch is authorized.
- Requested one focused independent review from Agent2 in `communications/agent2/2026-11/20261125T015710Z_agent6-rank1-copycat-exact-head-review-request.md` and a final check from Agent11 in `communications/agent11/2026-11/20261125T015829Z_agent6-rank1-copycat-final-head-review.md`. Await replies; do not duplicate their review or dispatch.
- Next: incorporate only concrete exact-head review findings; if code changes, run the dedicated `agent6-rank1-shadow-rider-policy-contract.yml` workflow once on the resulting code/test SHA. Keep PR #71 draft until review/host dependencies are resolved. Do not claim policy competence, matchup strength, or 99.5%.


## 2026-11-25 02:14Z — review status and Copycat scope clarification

- Agent11 posted a consolidated exact-head review on PR #71 (review 6050470566): no remaining Copycat root/prompt blocker in the tested policy/protocol/test blobs. Their follow-up notes that the suite already covers a non-Basic opponent Active, explicit live `suppressed:false`, and unknown Skyliner status; only a direct `suppressed:true` regression is missing. No further workflow rerun was requested/authorized for this non-blocking coverage gap.
- Agent2's new incarnation claimed `2026-11-25T02:06:32.886126882Z`; exact-head review of PR #71 is pending. Agent2's earlier memory notes that the generic `copycatAttack:true` filter is not a blocker for the current rank1-vs-Hood fixed pair because Hood contains no Regidrago VSTAR, but it should not be generalized to all Expanded Mimikyu choices.
- Verified rank1's exact published list contains one Mimikyu GRI 58 and one Dialga-GX UPR 100. The rank1 helper still conservatively excludes generic `copycatAttack:true`, so Apex Dragon is not supported in a hypothetical Regidrago pairing. This is separate from the current rank1-vs-Hood pair and the shared PR #69 protocol issue; nested Mimikyu→Apex Dragon legality remains unresolved.
- External rules check: Pokémon's official strategy page explicitly describes Mimikyu Copycat copying Reshiram & Charizard-GX's non-GX Flare Strike (https://www.pokemon.com/uk/strategy/rayquaza-gx-and-ultra-necrozma-gx-battle-arena-decks-analysis). The official Japanese FAQ says Marshadow's Shadow Mimicry can copy Flare Strike again on the next turn (https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%88%E3%83%A9%E3%82%A4%E3%82%AF&regulation_faq_main_item1=all). These support attack-level GX classification and repeated use of a copied attack, but do not directly settle the nested Apex Dragon effect. Keep that question open; do not remove generic flag gates without a rules/engine decision.
- PR #71 body now distinguishes the broader Expanded/candidate Apex Dragon issue from the current rank1-vs-Hood fixed pair. The consolidated PR comment links the official evidence and records the unresolved nested-copy question. No new workflow, native no-game witness, fixture, or game was run; Stage-A remains retry-frozen.


## 2026-11-25 02:21Z — Max Geist / Fairy Zone Regidrago alternative

- Agent11 saved `results/aichi-2026/2026-11/agent11-regidrago-max-geist-fairy-zone-threshold-20261125.md`: registered Hood Shield Shadow Rider v1 has a deterministic card-text Max Geist threshold against Regidrago VSTAR. With Fairy Zone active, `2 × (10 + 30E)) reaches 320 at five Psychic Energy across all candidate Pokémon (KO vs 280 HP); four Energy gives 260. Four Shadow Rider VMAX Underworld Door uses plus the manual attachment form a theoretical five-attachment ceiling if four VMAX, usable Abilities, and five Energy in hand are assembled. Both Clefairy ex copies prized is 0.8475%; without Fairy Zone the raw threshold is nine Psychic Energy. This is not a setup probability or matchup result.
- Forwarded the result to Agent46 in `communications/agent46/2026-11/20261125T022100Z_agent6-regidrago-max-geist-route-handoff.md` and added a concise link/caveat to `results/README.md` (commit `8e7a355748bdd4d00b74ba4a6b709a04d102a26b`). This route is independent of the unresolved nested Mimikyu/Apex question and should be included in later Regidrago modeling alongside Tool/Energy pressure.
- No simulator game, fixture, matchup, deck change, or workflow was run for this threshold. Tool removal, Ability suppression, Energy denial, access, and timing remain unmodeled.


## 2026-11-25 02:24Z — Agent2 identifies blocking five-slot Bench assumption

- Agent2's exact-head review [6050753594](https://github.com/FlareZ123/experiment-01/pull/71#pullrequestreview-6050753594) reviewed tested code/test head `3bfd7ac`, policy/protocol/test blobs `22d3db7` / `204d0af` / `7a4b55b`, and contract run `45529074554`. Copycat receipt/provenance changes were judged internally consistent; Agent11's prior review found no Copycat blocker.
- New blocking defect: exact rank-1 list contains two Sky Field, but policy assumes a five-slot Bench in four paths: `shouldUseClimacticGate()` uses `5 - occupied`; `isActorBenchPlacement()` rejects indices >=5; `actionTargetSlot()` rejects indices >=5; Underworld Door prompt slot resolution rejects indices >=5. The adapter preserves the full Bench array, so truncation is in policy. The 132-case contract suite does not cover these paths or slots 5–7. Policy-competence acceptance is blocked.
- Minimum fix proposed by Agent2: reuse `effectiveBenchCapacity()` / `openBenchSlots()` from Agent46's `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` (PR #69 head `f6ae93e`) or extract a shared helper; apply consistently to Gate EV, actor placement, target-slot resolution, and Underworld Door. Regressions should cover Sky Field=8, disabled Stadium/Tool effects=5, Parallel City owner/orientation=3 where applicable, unknown direction/effect fail-closed, and valid actor/target indices 5–7.
- Sent a focused helper-interface request to Agent46 (`communications/agent46/2026-11/20261125T022235Z_agent6-rank1-bench-capacity-helper-query.md`) and a scope-decision broadcast to Critic (`communications/broadcast/2026-11/20261125T022235Z_agent6-rank1-bench-capacity-review-blocker.md`). No code change or workflow was started: the prior Critic stopline prohibits new workflows, fixtures, and games. Await scope authorization before patching or rerunning.
- Updated PR #71 body, evidence report, and `results/README.md` to record the blocker. Current PR documentation head is `ce1960380d308b6fd8378aa14ff5cfce4505b88a`; exact tested code/test head remains `3bfd7ac`; report blob is `cf8701b7d62a18d89f5e2b7108f7f5bc90977e04`. PR remains draft and policy competence is not accepted.


## 2026-11-25 02:25Z — Agent2 review and Apex evidence reconciliation

- Agent2's exact-head review [6050753594](https://github.com/FlareZ123/experiment-01/pull/71#pullrequestreview-6050753594) also corrects the Apex evidence status: the nested Mimikyu → Regidrago Apex Dragon → Dialga-GX UPR 100 Timeless-GX line is **paper-text-supported with staged native reproduction**, not wholly uninvestigated. The two-seat mechanics report `results/methodology/agent46-copycat-real-apex-history-paper-hook-two-seat-20261107.md` (run 42333138227) uses two opt-in reversible research hooks and records 150 damage, GX use, and the extra turn in both physical seats; the original-60 staged comparison `results/methodology/agent46-original60-copycat-real-apex-unpatched-vs-paper-bothseats-20261107.md` (run 42336534060) extends the mechanics witness to original rank-1/rank-10 inventories on a constructed board. Neither is a natural shuffled-60 game or direct official adjudication; natural-game integration remains open.
- Updated PR #71 body/comment to reflect staged evidence and distinguish the generic `copycatAttack:true` protocol issue from the current rank1-vs-Hood fixed pair (Hood contains no Regidrago). The main decision board's Shared Copycat section already records the corrected evidence class. Keep tracker history disabled pending source-aware protocol decision and four GX metadata fixes.
- Agent2's blocking Bench finding remains the immediate PR #71 issue. No code patch, contract rerun, no-game witness, fixture, or game is authorized under the prior Critic stopline. Agent46 helper query and Critic scope-decision broadcast are pending.


## 2026-11-25 02:27Z — bounded Bench-fix scope recommendation

- Agent2 published `communications/broadcast/2026-11/20261125T022624Z_agent2-scope-recommendation-bench-capacity.md`, recommending authorization for the narrow four-path Bench correction plus exactly one run of the existing contract-only workflow on the resulting exact SHA.
- Proposed bounded scope: port/reuse `effectiveBenchCapacity()` and `openBenchSlots()` from Agent46's candidate policy; correct only Climactic Gate EV, actor Bench placement, target-slot resolution, and Underworld Door; add tests for Sky Field 8, disabled Stadium/Tool effects 5, Parallel City 3, unknown fail-closed, and valid slots 5–7.
- Explicit exclusions remain: no new workflow, Twinleaf rebuild, native no-game witness, Stage-A fixture, game, matchup, decklist change, tracker-history enablement, or Stage-A unfreeze.
- PR #71 body now records Agent2's blocker and the proposed scope; exact tested code/test head remains `3bfd7ac`, PR documentation head `ce1960380d308b6fd8378aa14ff5cfce4505b88a`. No code correction or new workflow has been started pending Critic authorization.
## 2026-11-25 03:24Z — authorized four-path Bench-capacity correction

- Invocation selection draw was 7 (normal research mode). Continued Agent6 after its prior lease aged past 100 minutes; this incarnation claimed at `2026-11-25T03:12:54.913684640Z`.
- Read Critic's 02:34Z authorization and Agent2's bounded-scope recommendation. Authorization was limited to the four reviewed policy paths plus four focused regressions and exactly one run of the existing contract-only workflow. No fixture, game, native no-game witness, new workflow, Twinleaf rebuild, deck change, tracker-history enablement, or Stage-A unfreeze.
- Reused Agent46's effective-capacity semantics after inspecting its helper and `simulation/twinleaf/actor-observation-contract.cjs`. The actor observation already preserves `stadiumDirection` and both players' Stadium/Tool no-effect epochs. `.gitmodules` identifies `vendor/twinleaf` → `https://github.com/twinleafgg/twinleafgg.git`, pinned on main at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no submodule changes were made.
- Implemented one `effectiveBenchCapacity()` / `openBenchSlots()` contract on PR #71:
  - live Sky Field: 8;
  - disabled Stadium/Tool effects: 5;
  - Parallel City: actor capacity 3 for own/DOWN or opponent/UP, otherwise 5;
  - unknown relevant suppression epoch or Parallel City direction, and conflicting Stadium states: fail closed.
- Applied it only to Climactic Gate open-slot EV, actor Bench placement, manual Psychic Energy target resolution, and Underworld Door Bench-pair prompt resolution. Added four regressions; the suite now contains 136 top-level tests and covers indices 5–7 in actor placement, target resolution and Underworld Door.
- Exact tested policy/test commit: `89a3e93c0f804713509e924ba76c5df7ccf9e96b`. Policy blob `01e4bc5d345f5e6bd98ae3bbdec03c98d12f9a61`; protocol blob unchanged `204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766`; test blob `3046db51d74e98d7c2e032e636588bdce5506f91`.
- Ran the existing `.github/workflows/agent6-rank1-shadow-rider-policy-contract.yml` exactly once on that code/test SHA. [Run 45539327197](https://github.com/FlareZ123/experiment-01/actions/runs/45539327197) completed successfully; Node 22 syntax and all 136 contract tests passed. This is policy-contract evidence only, not Twinleaf/native/game/competitive evidence.
- Updated the PR #71 evidence report on the branch (report blob `593c0372282b6b5395daad3f50705ea77809023c`, report commit / current PR documentation head `285a0c0cc49fc2f24d4232153982ed11949378c6`) and refreshed the PR body with exact tested blobs and run receipt. PR remains draft; no policy-competence acceptance.
- Sent one consolidated exact-head review request to Agent2 and Agent11 in `communications/agent2/2026-11/20261125T032224Z_agent6-rank1-bench-capacity-exact-head-review-request.md` and `communications/agent11/2026-11/20261125T032224Z_agent6-rank1-bench-capacity-exact-head-review-request.md`.
- Agent4's separate Gate-slot reservation/sequencing risk is explicitly deferred and not part of this authorization. It needs a separate scope decision before any code change. Stage-A remains retry-frozen; no native witness, fixture, game, Aichi matchup, win-rate estimate, or 99.5% evidence was produced.
- Next: obtain Agent2 and Agent11's consolidated reviews of exact tested SHA `89a3e93`; resolve any concrete issue only with fresh scope authorization. Do not dispatch native work or alter the fixed 60 under this PR scope.
## 2026-11-25 03:42Z — Regidrago Stadium overlay

- Extended Agent11's Max Geist / Fairy Zone threshold with a source-list cross-check from `results/aichi-2026/full-decklists.json`: among 9 published Regidrago lists (ranks 10,12,13,14,18,20,21,27,32; ranks 23 and 28 missing), Parallel City appears in 7/9, Path to the Peak in 4/9, Silent Lab in 2/9 (all six lock-Stadium lists also include Parallel City), and Megaton Blower in 6/9. The two non-Parallel-City lists use Sky Field. Do not extrapolate these counts to the full 11 Regidrago lists.
- Cross-checked card text against the uploaded card pool: Path to the Peak suppresses Rule Box Abilities (Clefairy ex Fairy Zone and Shadow Rider VMAX Underworld Door); Silent Lab suppresses Basic Pokémon Abilities (Fairy Zone and Marshadow Resetting Hole) but not evolved VMAX Underworld Door. Mimikyu GRI 58 Copycat is an attack, not an Ability, so neither Stadium suppresses the attack itself; the prior-turn non-GX attack condition remains separate.
- Candidate Hood Shield Shadow Rider v1 has Clefairy ex ×2, VMAX ×4, Psychic Energy ×11, Sky Field ×1, Dimension Valley ×1, Field Blower ×1 and Marshadow ×1. The Stadium attrition / ability-lock overlay is recorded in `results/aichi-2026/2026-11/agent6-regidrago-stadium-pressure-crosscheck-20261125.md` and linked from `results/README.md`.
- Added a board-count refinement: two VMAX in play (one Active, one Benched) provide up to two Underworld Door attachments plus the manual attachment = three Psychic Energy per turn, so five Energy for the Fairy Zone threshold can be assembled over two turns if the abilities and Energy access are available. Under an opponent-facing Parallel City cap of three, Active VMAX + Benched VMAX + Clefairy + Radiant uses exactly three Bench slots. A Gate sequence can reach this shape if Clefairy is already Active before Radiant; otherwise Radiant + two fetched VMAX may consume all three slots. This is board arithmetic, not a tested line or setup probability.
- Shared the Stadium overlay with Agent2, Agent11 and Agent17; shared the Clefairy/Gate-slot nuance with Agent4. No deck change, game, matchup, or win-rate claim was made.
- Next: await Agent2 and Agent11's consolidated review of PR #71 exact tested code/test SHA `89a3e93`; keep the separate Gate-slot reservation / Clefairy support-slot issue outside PR #71 until a new scope decision. Stage-A remains retry-frozen.
## 2026-11-25 03:54Z — Gate terminality correction and final CI receipt

- Rechecked Radiant Eternatus CRZ 105 card text directly in the uploaded card pool: if Climactic Gate is used, the turn ends. Corrected the Regidrago Stadium report and `results/README.md`; a Gate sequence cannot switch/promote or attach Underworld Door Energy on the same turn.
- Corrected board sequence: with Clefairy Active and empty Bench under opponent-facing Parallel City cap 3, Gate places Radiant + two VMAX on Bench and ends the turn. The opponent gets a full turn. On the next own turn, a legal switch/retreat can promote a VMAX and move Clefairy to Bench, leaving Active VMAX + Bench [second VMAX, Clefairy, Radiant]. Two VMAX then provide up to two Door attachments plus manual attachment per turn; five Energy from zero takes two subsequent attachment turns, with another opponent turn between. Max Geist's own attack cost must also be paid (two Colorless with Dimension Valley, three without). This remains board arithmetic, not a demonstrated game line or setup probability.
- Sent terminality correction to Agent4 and Agent11 in `communications/agent4/2026-11/20261125T034233Z_agent6-climactic-gate-terminality-correction.md` and `communications/agent11/2026-11/20261125T034233Z_agent6-climactic-gate-terminality-correction.md`.
- Recovered final status for the single authorized contract workflow after GitHub Actions API rate limiting: run `45539327197` is `completed / success`, head SHA `89a3e93c0f804713509e924ba76c5df7ccf9e96b`, workflow `agent6-rank1-shadow-rider-policy-contract.yml`, run attempt 1. It is the exact policy/test head and passed 136 cases.
- Agent2 and Agent11 have not yet posted responses to the exact-head review requests; Agent4 has not yet responded to the Clefairy/Gate-slot note. PR #71 remains draft. No further workflow run or code change is authorized by the current Critic scope.


## 2026-11-25 09:38 UTC — Stage-A independent rejection and owner-direction request

- **Mode / identity / lease:** actual initial CSPRNG draw was **1/10**, selecting normal research mode. Reclaimed Agent6 after confirming the prior immutable lease `2026-11-25T06:43:50.471Z` was more than 100 minutes old. New immutable claim: `agent6-chat-20261125T093350594Z-normal1-gpt6-stageA-owner-direction`, `claimed_at=2026-11-25T09:33:50.594092401Z`. The 70-minute orderly-release threshold is **2026-11-25T10:43:50.594092401Z**. Do not refresh; after every checkpoint compare this original timestamp with an actual runtime clock.
- **Current Stage-A disposition:** Agent4's final independent review rejects post-gate SHA `a6a17bd56644cdda74bf503d392157e85d2b7246` as **NOT ACCEPTED**, despite exact-SHA contract-only and four-cell native no-game gates passing on both `45176d5` and `a6a17bd`. No fixture/game ran. The four outstanding acceptance gaps are: (1) public no-game witness includes `seed`/`seed32` plus candidate/opponent deck and policy hashes; (2) `actionSignature(action)` and dedup remain outside per-candidate tagged `try`; (3) test exercises the wrapper helper rather than injecting failure through the production runner's actual `assertKnownCapFreeAdapterAdmissionClear()` call; (4) nested receipt test does not assert outer `native-no-game-witness` together with nested `nativeActionValidationStage`. Full review: `communications/broadcast/2026-11/20261125T092753Z_agent4-stageA-binary-disposition.md`.
- **Controlling direction:** Critic's `communications/broadcast/2026-11/20261125T091408Z_critic-decline-budew-ranger-policy-scope.md` freezes further Stage-A patch/workflow/dispatch pending owner direction, and says to seek that direction after the independent review. Do not treat successful contract/no-game receipts as game, policy competence, matchup, or win-rate evidence.
- **Owner request:** created issue [#72](https://github.com/FlareZ123/experiment-01/issues/72), assigned to FlareZ123. It asks for a binary route: (A) one bounded acceptance-only repair of exactly the four gaps, existing exact-SHA contract/no-game gates and one Agent4 review, with no fixture/game; or (B) retire Stage-A. It asks the owner to state whether already-authorized public-reproducibility metadata (seed/deck/policy hashes) remains permitted in the public no-game witness. Issue #59's candidate-only Expanded-vs-original-Aichi and public-reproducibility decisions are not reopened.
- **No code, test, workflow, registration, seed, seat, deck, policy, Twinleaf, or result-board change** was made. The only repository mutations in this incarnation are the Agent6 lease claim and issue #72.
- **Next:** await the owner's explicit issue #72 decision. If A, implement only the bounded four-item acceptance correction and run only the existing gates if that scope is explicitly authorized; seek Agent4 re-review. If B, leave Stage-A unaccepted and stop this route. No fixture/game dispatch is authorized by either choice here; it requires a separate owner decision. Preserve the 0/32 qualified matchup and no-99.5%-claim status.

## 2026-11-25 09:42 UTC — Copycat counter-ALS Prize collision quantified

- **Decision relevance:** added an exact Prize-access calculation for the Mimikyu GRI 58 → opponent's Apex Dragon → own Dialga-GX UPR 100 Timeless-GX counterline. Both Hood Shield v1 and Lockbridge v1 contain one Mimikyu, one Dialga-GX, and one Hisuian Heavy Ball; both Pokémon are Basic, and the fixed 60 has one Prize-recovery Heavy Ball.
- **Exact result:** with a uniform six-card Prize subset, the line is Prize-inaccessible if at least two of the three specified cards are Prized. Numerator 3*C(57,4)+C(57,3)=1,214,290; denominator C(60,6)=50,063,860; exact fraction 83/3422 = **2.425482%**. A second-Heavy-Ball counterfactual fails only when at least three of four specified cards (Mimikyu, Dialga, two Heavy Balls) are Prized: 4*C(56,3)+C(56,2)=112,420, or **0.224553%**. This is not a slot recommendation, game-loss estimate, or matchup result.
- **Interpretation:** the result is identical in Hood and Lockbridge, so it does not rank those lists. It adds a hard Prize-only access constraint for this specific counter-ALS; the line still needs Apex Dragon last turn, Mimikyu Active with its own attack cost paid, Dialga in discard, and the GX marker unused. Fairy Zone / Max Geist and other plans remain outside the calculation.
- **Artifact:** results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md. Direct messages sent to Agent31 and Agent49: communications/agent31/2026-11/20261125T094056Z_agent6-copycat-prize-collision.md and communications/agent49/2026-11/20261125T094056Z_agent6-copycat-prize-collision.md. No README update because this common result does not alter candidate ranking.
- **No deck, policy, test, workflow, fixture, game, or Twinleaf change.** This is a combinatorial result only. Continue to preserve the explicit distinction between Prize-access probability and competitive performance.

## 2026-11-25 09:45 UTC — shared Heavy Ball capacity extension

- Extended the Copycat-specific Prize collision result with an exact capacity model for the eight singleton Basic tech Pokémon in Hood Shield / Lockbridge: Tapu Lele-GX, Trevenant & Dusknoir-GX, Latias ex, Dialga-GX, Mimikyu, Girafarig, Marshadow, and Radiant Eternatus.
- For X target Basics and Y Heavy Ball copies in the six Prizes, with H copies in the 60, stranded Prize targets are max(0, X-(H-Y)). Exact 60-card enumeration: with one Heavy Ball, P(at least one of eight targets stranded)=10,912,860/50,063,860=**21.79788%**, expected stranded targets=**0.25973/game**. With two Heavy Balls, the corresponding values are 2,622,060/50,063,860=**5.23743%** and **0.05803/game**.
- This is a shared Prize-recovery capacity metric, not a loss probability or Heavy Ball slot recommendation. Target values are unequal and matchup/state dependent; ordinary search outs, Item lock, and slot cost are not modeled.
- Appended the derivation to results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent the extension to Agent31 at communications/agent31/2026-11/20261125T094416Z_agent6-shared-heavyball-capacity.md. No candidate ranking, deck, or policy change is claimed.

## 2026-11-25 09:47 UTC — correction: Copycat Prize calculation was already covered

- **Correction to the 09:42 memory entry and 09:40 direct messages:** 2.425482% (one Heavy Ball) and 0.224553% (two Heavy Balls) were raw unconditional six-Prize-subset calculations. They are not the game-start conditional values. Agent35's existing reconciliation already gives the Mimikyu/Dialga/Heavy Ball capacity cut conditioned on a legal seven in the 14-Basic list: **2.366909%** with one Heavy Ball and **0.219492%** with two. The pair-specific result is prior work and must not be presented as new.
- **Retained new contribution:** the revised report now focuses on the broader eight-singleton-Basic shared recovery pool, conditioned on a legal seven and all 14 Basics in the list. Exact results: one Heavy Ball gives P(any of the eight targets stranded)=**21.12871136%**, expected stranded targets **0.25062455/game**; two Heavy Balls gives **4.99530820%** and **0.05520196/game**. This is a capacity metric only, not a loss estimate or slot recommendation.
- Revised artifact: results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md. Sent explicit corrections to Agent31 and Agent49 at communications/agent31/2026-11/20261125T094633Z_agent6-prize-model-conditioning-correction.md and communications/agent49/2026-11/20261125T094633Z_agent6-prize-model-conditioning-correction.md.
- Do not repeat the pair-specific Prize calculation as a new finding. Preserve the distinction between raw Prize-subset probability and probability conditioned on a legal seven.

## 2026-11-25 09:49 UTC — Item-lock stress endpoint and Agent21 handoff

- Extended the eight-singleton shared Prize-recovery model with the no-recovery endpoint: if Item lock prevents any Heavy Ball from being played when recovery is needed, then conditional on a legal seven P(at least one of the eight target Basics Prized)=**58.50049720%**, and E[number of those targets Prized]=**0.78300048**. This is a no-recovery stress case, not an Item-lock setup probability or game-loss estimate; it does not apply if Heavy Ball was already used before the lock or the lock has cleared.
- Added this endpoint to results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md.
- Read Agent21's existing multiplicity model. It already covers the Mimikyu/Dialga/Heavy Ball pair and legal-seven conditional values; the pair-specific result is not new. The eight-target shared-capacity extension is the new scope. Sent the exact extension to Agent21 in communications/agent21/2026-11/20261125T094705Z_agent6-eight-target-prize-capacity.md.
- Issue #72 remains open with no owner response as of 09:49 UTC. No Stage-A code/workflow/dispatch or game work has been started.

## 2026-11-25 09:51 UTC — Hood vs champion narrow opening / Prize-capacity comparison

- Extended the eight-role shared Heavy Ball capacity report to compare Hood Shield v1 with the published champion reference. Both lists have 14 Basics and one Heavy Ball. Hood has 4 Shadow Rider V / 1 Tapu Lele-GX; champion has 3 Shadow Rider V / 2 Tapu Lele-GX; the seven other singleton Basic support/tech roles match.
- Conditioned on a legal seven: P(open at least one Shadow Rider V) is **46.37744%** for Hood vs **36.61785%** for champion. The eight-role model's P(any role stranded by one usable Heavy Ball) is **21.12871%** vs **17.54447%**; expected stranded roles are **0.25062** vs **0.20309/game**. In the no-recovery / active-Item-lock stress case, P(any role unavailable) is **58.50050%** vs **53.81455%**.
- Interpretation is a narrow structural tradeoff: the fourth Shadow Rider V improves opening-V access, while the second Tapu Lele in the champion baseline reduces shared Prize-recovery pressure. This is not a strength ranking or matchup estimate; it excludes target-value differences, all other list changes, search/Item-lock timing, and games.
- Updated artifact: results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md. Shared with Agent1 and Agent31 in communications/agent1/2026-11/20261125T095058Z_agent6-hood-champion-opening-prize-tradeoff.md and communications/agent31/2026-11/20261125T095058Z_agent6-hood-champion-prize-tradeoff.md.

## 2026-11-25 09:52 UTC — correct interpretation of the V / Tapu Lele starter swap

- The candidate-vs-champion comparison has one further exact decomposition: Hood's 4 Shadow Rider V + 1 Tapu Lele-GX and the champion's 3 V + 2 Lele both total five copies across those two Basic starter roles.
- Conditioned on a legal seven, Hood vs champion: P(open V)=**46.37744% vs 36.61785%**; P(open Lele)=**13.54370% vs 25.71007%**; P(open at least one of either)=**55.09137% for both**. The one-card swap changes starter identity, not the combined starter-pool probability. Do not describe it as a net opening-consistency gain.
- Added the decomposition to results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent clarifications to Agent1 and Agent31 at communications/agent1/2026-11/20261125T095153Z_agent6-starter-role-decomposition.md and communications/agent31/2026-11/20261125T095153Z_agent6-starter-role-decomposition.md.

## 2026-11-25 09:53 UTC — synthesis link for the new capacity comparison

- Added one concise link from the existing Copycat/Apex section of results/README.md to results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md. The addition states the legal-seven 8-role capacity comparison (Hood 21.1287% vs champion 17.5445%) and the unchanged combined V-or-Lele opening probability (55.0914%). It is explicitly labeled a structural proxy, not a strength ranking.
- This is the only README change for the new result; no candidate nomination, list edit, policy change, or win-rate claim.

## 2026-11-25 09:54 UTC — reverted unnecessary decision-board detail

- The root README's repository-practice rule says results/README.md should be updated for fixed-60 contender, source-coverage, released-policy, or competitive-qualification changes; atomic reports should be linked from their research area. My brief addition linking the new Prize-capacity proxy from results/README.md did not meet that bar, so I reverted it in commit 93e92ddecafd28993fa0b7a54850be1af5996de9. The report remains under results/aichi-2026/2026-11/ and is linked from relevant communications. No results/README.md change remains from this work.

## 2026-11-25 09:55 UTC — Critic PR #62 trace-causality request completed

- Read the new 09:46Z Critic broadcast communications/broadcast/2026-11/20261125T094646Z_critic-pr62-stageA-freeze.md. It asks Agent2 and Agent6 to determine from the existing Stage-A trace only whether the failed selected action traversed PR #62's RNG-sensitive path; no new probe/report/dispatch.
- Read results/stage-a/2026-11-24-run-453540-attribution-review.md. The final candidate-seat-0 root record has no worker decision trace, decision kind, actionName/actionType, validationReceipt, or dispatch. rootActionFrontierAdmissionCount and rootDecisionCount remain 21 for the failed root. The attribution localizes failure before the frontier/admission block completed and before session.decide/worker response, but cannot distinguish enumerator creation/enumeration, frontier build, or admission.
- **Conclusion:** PR #62's synthetic regression demonstrates a possible defect class, but the existing Stage-A trace has no selected action or validation receipt; causal connection to ordinal-23 is **unproven**. Posted this evidence-bounded note to owner issue #72 (comment ID 7158958677) and informed Agent2 at communications/agent2/2026-11/20261125T095350Z_agent6-stageA-rng-causality-check.md. No new probe, report, patch, workflow, witness, fixture, or game.
- Also inspected the full root README and .gitmodules: submodule path vendor/twinleaf, remote https://github.com/twinleafgg/twinleafgg.git, main pinned at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 per current repository records. No submodule change or upstream interaction.

## 2026-11-25 09:56 UTC — addressed outstanding Agent49 mailbox request

- Read Agent49's 24-Nov message communications/agent6/2026-11/20261124T230837Z_agent49-checked-decision-condition-coverage.md, requesting a checkedDecision regression for native SpecialCondition codes [2] Asleep and [0] Paralyzed.
- The request is superseded by Critic's 25-Nov PR #71 stopline: no additional policy extensions, contract reruns, or native witnesses without a separate scope decision. Replied to Agent49 at communications/agent49/2026-11/20261125T095620Z_agent6-defer-specialcondition-regression.md, preserving it as an unresolved coverage gap rather than implementing or claiming it is correct.
- No PR #71 code/test changes or contract reruns.

## 2026-11-25 09:59 UTC — Hood Shield vs Lockbridge shared Prize-capacity cost

- Extended the legal-seven-conditioned role-capacity model to the exact four-slot Lockbridge swap. Both lists have 14 Basics, four Shadow Rider V, and one Heavy Ball. Hood has eight common singleton support/tech roles plus a two-copy Clefairy/Fairy Zone role; Lockbridge has the same eight plus one Clefairy role and one Wobbuffet role.
- With one usable Heavy Ball, P(any support/tech role stranded) is **21.44129%** Hood vs **29.28868%** Lockbridge; expected stranded roles are **0.25459** vs **0.36599/game**. In the no-recovery / active-Item-lock stress case, P(any role unavailable) is **58.94803%** vs **67.42486%**. With two Heavy Balls as a counterfactual, P(any role stranded) is **5.08841%** vs **8.38106%**.
- This quantifies the Prize-access cost of reducing Clefairy redundancy from two to one while adding Wobbuffet as another one-copy Basic role competing for Heavy Ball. It does not value Wobbuffet/Temple benefits, Ranger loss, or Temple's own Stadium-Prize risk; not a candidate-strength ranking or matchup result.
- Updated results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent the comparison to Agent31 at communications/agent31/2026-11/20261125T095841Z_agent6-lockbridge-prize-capacity-comparison.md.

## 2026-11-25 10:01 UTC — legal-seven conditioning for Lockbridge Temple package

- Computed the legal-seven-conditioned Prize failure for Agent31's existing Wobbuffet + Temple package analysis (14 Basics in the 60). With one Temple / one Wobbuffet / one Heavy Ball: P(Temple Prized)=**10.06467208%**, P(Wobbuffet+Heavy Ball Prized)=**0.83532182%**, overlap=**0.05801444%**, combined package Prize failure=**10.84197947%**. With two Temples: P(both Temples Prized)=**0.85841900%**, Wobbuffet+Heavy Ball=**0.83532182%**, overlap=**0.00307480%**, combined failure=**1.69066602%**.
- These are conditional-on-legal-seven refinements to Agent31's raw six-Prize-subset values, not new interaction findings and not game-loss/matchup rates. Sent to Agent31 at communications/agent31/2026-11/20261125T100120Z_agent6-temple-package-legal-seven-conditioning.md; no edit to their report and no deck/policy change.

## 2026-11-25 10:04 UTC — completed relevant inbox review and superseded Stage-A scope

- Listed the Agent6 mailbox using the repository Contents API and read the relevant recent Agent2, Agent4, Critic messages. Key notes: Agent2's 08:22 candidate-indexing gap is the same actionSignature(action) / seen pre-try defect mapped by Agent4; Agent2's 08:14 PR62/RNG note says no evidence the pinned enumerator consumes randomness; Agent2's 08:18 exact-SHA note says the tested SHA was 45176d and current a6a17 has unvalidated sanitizer runtime changes; Agent2's 08:24 note corrects the non-reentrant RNG scope.
- Read Critic's 08:36 one-patch authorization and the later controlling 09:14 broadcast communications/broadcast/2026-11/20261125T091408Z_critic-decline-budew-ranger-policy-scope.md. The later directive explicitly supersedes the earlier authorization: no new Stage-A patch/workflow/dispatch; Agent4's independent review is the final diagnostic review; after rejection, seek owner direction. Issue #72 is that owner-direction request. Do not resume Stage-A implementation even though the earlier 08:36 message authorized a patch.
- Replied to Agent2 at communications/agent2/2026-11/20261125T100445Z_agent6-candidate-indexing-stopline-reply.md: their candidate-indexing gap is captured in Agent4's review and issue #72, but no patch is authorized now. The separate PR62 causal link remains unproven from the existing trace.
- Also read older Agent2 PR70 focused review and Critic stale-diff note; both are superseded by current PR71/Stage-A stoplines and require no action.
- The private directory listing returned only .gitkeep; no private content was read. No identity or lease changes.

## 2026-11-25 10:06 UTC — exact list inputs verified and linked

- Fetched the exact Hood Shield printing-normalized 60 and Lockbridge JSON. Counts used by the report are confirmed: Hood has 4 Shadow Rider V, 2 Clefairy, and eight singleton Basic support/tech roles; Lockbridge has 4 Shadow Rider V, 1 Clefairy, 1 Wobbuffet, and the same eight singleton roles. Both have 14 Basics and one Heavy Ball. The champion comparison's 3 V / 2 Tapu Lele-GX counts are from the authenticated full-decklists field file.
- Added exact source links to the report: results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md, results/aichi-2026/candidate-hood-shadow-rider.json, results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json, and results/aichi-2026/full-decklists.json. No deck edits.

## 2026-11-25 10:06 UTC — Lockbridge comparison shared with Agent1

- Shared the legal-seven-conditioned Hood vs Lockbridge shared Prize-recovery cost with Agent1 at communications/agent1/2026-11/20261125T100605Z_agent6-lockbridge-prize-capacity.md. Key numbers: one Heavy Ball P(any role stranded)=21.44129% Hood vs29.28868% Lockbridge; expected stranded roles=0.25459 vs0.36599/game; no-recovery stress P(any role unavailable)=58.94803% vs67.42486%.
- Framed strictly as the Prize-access cost of replacing the second Clefairy with a Wobbuffet role; it does not value Wobbuffet/Temple benefits, Ranger loss, Temple Prize risk, or game outcomes. No deck/policy change.

## 2026-11-25 10:06 UTC — value-weighted Prize-capacity interpretation

- Added a formal value-weighted extension to the shared Prize-capacity report: for missing roles M(s,P), available Heavy Ball recoveries R=max(0,H-Y), and state-dependent role values v_i(s), unrecovered value is the sum of all missing-role values minus the top R values recoverable. The current model sets v_i=1 and therefore measures stranded role count only.
- Explicitly states that a competitive value estimate requires opponent/state-conditioned values from a competent policy or validated game traces; none exist for this candidate, so no value-weighted Prize-loss estimate is reported. This guards against interpreting capacity percentages as matchup losses.
- Updated artifact: results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md. No policy/deck changes.

## 2026-11-25 10:08 UTC — energy-ready opening proxy added

- Added a more specific opening-hand proxy to the Hood-vs-champion comparison. Both lists have 11 Basic Psychic Energy and 14 Basics. Conditioned on a legal seven, P(open at least one Shadow Rider V and at least one Basic Psychic Energy) is **34.19736%** for Hood's four V vs **26.88607%** for champion's three, +**7.31129 pp**.
- This does not establish a turn-one attack or full engine; it ignores search/draw sequencing and going-first/second. It complements, rather than replaces, the result that combined V-or-Lele starter-pool probability is identical at 55.09137%.
- Updated results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent the clarification to Agent1 at communications/agent1/2026-11/20261125T101200Z_agent6-energy-ready-opening-proxy.md. No deck/policy change or strength claim.

## 2026-11-25 10:10 UTC — champion comparison expanded to include Clefairy role

- Corrected the Hood-vs-champion role-capacity comparison to include the common two-copy Clefairy/Fairy Zone role in both lists. The earlier 21.12871% vs17.54447% values remain correct for the narrower eight-singleton-only pool; the fuller nine-role pool (eight singleton roles + Clefairy x2) gives, conditioned on legal seven: P(any role stranded by one usable Heavy Ball)=**21.44129% Hood vs17.84089% champion**; expected stranded roles=**0.25459 vs0.20673/game**; no-recovery stress P(any role unavailable)=**58.94803% vs54.29676%**; two-HB counterfactual P(any stranded)=**5.08841% vs3.81085%**.
- Updated the comparison section in results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent corrections to Agent1 and Agent31 at communications/agent1/2026-11/20261125T100930Z_agent6-clefairy-role-capacity-correction.md and communications/agent31/2026-11/20261125T100930Z_agent6-clefairy-role-capacity-correction.md.

## 2026-11-25 10:11 UTC — Clefairy role-specific legal-seven Prize cost

- Computed the Fairy Zone role's own Prize inaccessibility under one Heavy Ball, conditioned on a legal seven: Hood with two Clefairy = **0.05620289%** (63,813 / 113,540,416); Lockbridge with one Clefairy = **0.83532182%** (446,319 / 53,430,784), a **14.86×** increase. This is role access only, not Fairy Zone or matchup failure.
- Added this specific result to the Lockbridge comparison in results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent it to Agent31 at communications/agent31/2026-11/20261125T101055Z_agent6-clefairy-role-legal-seven.md.

## 2026-11-25 10:12 UTC — champion source list cross-check

- Parsed the authenticated 29-deck full-decklists JSON. Rank 1 is Yasunori Kato, with 3 Shadow Rider Calyrex V, 2 Lillie's Clefairy ex, and 2 Tapu Lele-GX; the Hood and Lockbridge exact files were separately fetched and their 14-Basic counts verified. This confirms the role multiplicities used in the candidate/champion comparison.
- Issue #72 still has only Agent6's evidence-bounded PR62-causality comment; no owner response or A/B decision as of 10:12 UTC. No Stage-A patch/workflow/dispatch or game work.

## 2026-11-25 10:13 UTC — source coverage qualification

- Clarified the report's full-decklists source link: it is the authenticated **29-deck subset**, with rank 1 present; this analysis does not imply all 32 Top 32 lists are authenticated. Ranks 23/25/28 remain unresolved. The comparison uses only the published rank-1 card counts and does not make a field-wide claim.
- Updated results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md accordingly.

## 2026-11-25 10:16 UTC — role-capacity scope caveat

- Clarified the report's scope: Shadow Rider V copies are included in the 14-Basic count and legal-opening weights but are not modeled as a target role. The separate risk of multiple V copies being Prized, and the engine's need for more than one V, is outside this role-capacity metric.
- Rewrote the value-weighted extension with preserved LaTeX delimiters and added the caveat in results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md.

## 2026-11-25 10:17 UTC — champion recovery and energy counts verified

- Raw rank-1 entry for Yasunori Kato in results/aichi-2026/full-decklists.json confirms 3 Shadow Rider Calyrex V, 2 Tapu Lele-GX, 2 Lillie's Clefairy ex, **1 Hisuian Heavy Ball**, and **11 Psychic Energy**. This confirms the Heavy Ball and energy-count assumptions in the champion comparison.

## 2026-11-25 10:18 UTC — legal-seven sampling-order proof

- Clarified the exact Prize model's sampling order in the report. Although actual setup draws the legal seven first and six Prizes from the remaining 53, every disjoint opening-seven / Prize-six pair has equal probability; reversing the order gives the same joint count by C(60,7)C(53,6)=C(60,6)C(54,7). Therefore enumerating Prize sets first and weighting each by the legal openings among the remaining 54 is exact.
- Corrected inline math delimiters in the model definitions. Updated results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md.

## 2026-11-25 10:19 UTC — clarify candidate role-pool wording

- Corrected the report's opening question to distinguish the shared eight singleton roles from Lockbridge's additional Wobbuffet role and reduced Clefairy count. Hood Shield has eight singleton roles plus Clefairy x2; Lockbridge has those eight plus Clefairy x1 and Wobbuffet x1. Both have one Heavy Ball.
- Updated results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md.

## 2026-11-25 10:19 UTC — current status checkpoint

- Main new research artifact is results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md. It contains exact legal-seven-conditioned role-capacity models for Hood Shield, the rank-1 champion reference, and Lockbridge; an energy-ready opening proxy; a value-weighted extension definition; exact list links; sampling-order proof; and limitations. No candidate deck is nominated or edited.
- Stage-A remains frozen by Critic's 09:14 directive. The only new Stage-A action was the requested existing-trace check: PR #62 causal link unproven, recorded in issue #72. Issue #72 remains open, assigned to FlareZ123, with no owner response as of 10:19 UTC. No Stage-A patch/workflow/dispatch, fixture, or game.
- No 99.5% claim. No Twinleaf or private content modification. Agent6 lease remains the original 2026-11-25T09:33:50.594092401Z claim; release threshold is 2026-11-25T10:43:50.594092401Z. Do not refresh; perform final memory/push verification and lease deletion only at/after that threshold.

## 2026-11-25 10:20 UTC — submodule gitlink directly verified

- Used the repository Contents API for vendor/twinleaf (metadata only) to verify the actual gitlink: type=submodule, pinned SHA **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, remote **https://github.com/twinleafgg/twinleafgg.git**. This matches .gitmodules and the README. No submodule checkout, upstream source interaction, or change.

## 2026-11-25 10:23 UTC — Hooded Guardian scope clarification

- Inspected the existing unvalidated candidate-hooded-guardian-shadow-rider.json only to distinguish it from Lockbridge. It has 15 Basics and adds Enamorus V while cutting Quick Ball; it was **not** included in the Prize-capacity analysis or ranked. Do not imply Hooded Guardian was assessed; only Hood Shield, the rank-1 champion reference, and Lockbridge were compared.

## 2026-11-25 10:24 UTC — Tapu Lele role-specific Prize access

- Added the Tapu Lele-GX role's own Prize hard-failure probability to the Hood-vs-champion comparison: Hood (one Lele + one Heavy Ball) **0.83532182%** vs champion (two Lele + one Heavy Ball) **0.05620289%**, conditioned on a legal seven. The second Lele reduces this role's Prize-only inaccessibility by **14.86×**.
- Updated results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md and sent the addendum to Agent1 at communications/agent1/2026-11/20261125T102450Z_agent6-tapu-lele-role-prize-access.md. This is a role-access metric, not a matchup-loss rate.


## 2026-11-25 checkpoint — VS Seeker access after Guzma enters discard

- Current incarnation claimed Agent6 at 2026-11-25T20:42:32.248Z after an actual mode draw of 7 (normal mode). The lease is in agents/agent6/.lease.json; do not refresh it. Continue the 70-minute lease-age rule from that original timestamp.
- Took a bounded, read-only audit of Agent21's Wobbuffet displacement model and the exact 29 published Aichi lists. The direct displacement Trainers in those inventories are Guzma, Escape Rope, Counter Catcher, and Prime Catcher; no fifth direct switch Trainer was found.
- Material omitted later-state line: once one Guzma is already in discard, a VS Seeker in hand can retrieve it directly; Battle Compressor is not required. 25/29 lists contain Guzma, and 23/25 of those also contain VS Seeker. All nine known Regidrago lists have 2–3 Guzma and 2–3 VS Seeker.
- Exact H=9 conditional K0 access results (same-subset comparisons; Items playable; one Guzma known in discard and not in Prizes):
  - 25 Guzma lists: 32.12% baseline -> 44.12% with one Guzma in discard (+12.00 pp).
  - 23 Guzma + VS Seeker lists: 32.48% -> 46.63% (+14.15 pp).
  - 9 Regidrago lists: 35.85% -> 49.09% (+13.24 pp).
  - Regidrago counterfactual treating VS Seeker as a non-out: 20.89%, so the marginal VS Seeker contribution is +28.19 pp at H=9. Across H=7..10 the marginal contribution is +23.84, +26.14, +28.19, +30.02 pp.
- Important correction: the first draft incorrectly treated an Aichi opponent's own Budew/Itchy Pollen as blocking that opponent's own Items. It does not; Itchy Pollen blocks the opponent's Items on the opponent's next turn. The exact Lockbridge 60 has no Budew. The invalid Budew-only displacement branch and figures 29.21% -> 16.72% / 25.99% -> 12.92% were removed. Do not reuse them. Opponent Budew can affect Lockbridge's Item use on its next turn, potentially affecting recovery after displacement; that is outside this access model.
- Durable artifacts are on branch agent6/lockbridge-vsseeker-discard-sensitivity-20261125:
  - results/aichi-2026/2026-11/agent6-lockbridge-guzma-discard-itemlock-sensitivity-20261125.md
  - scripts/agent6-lockbridge-vsseeker-discard-sensitivity.cjs
  - Draft PR #73: https://github.com/FlareZ123/experiment-01/pull/73
- Sent scope, correction, and final result notes to Agent21; sent correction to Agent2. Await review of the one-discard state assumption and script. No deck, policy, fixture, workflow, or game changes. No candidate ranking changed; do not update results/README.md as though Lockbridge were promoted.
- Next useful step: obtain Agent21's response or an independent review, then decide whether to merge the sensitivity artifact. If later game evaluation becomes available, keep the one-Guzma-in-discard state separate and estimate its frequency from actual turn traces rather than averaging conditional priors into a matchup estimate.


## 2026-11-25 addendum — two-Guzma discard state

- Generalized the exact conditional model to one or two Guzma copies already in discard. For H=9, among the 19 lists with at least two Guzma (including all nine Regidrago), access is 45.51% with one discarded copy and 35.70% with two; the two-discard counterfactual without VS Seeker as an out is 8.05%, giving a +27.65 pp marginal VS Seeker contribution.
- In the nine Regidrago lists, the two-discard state is 39.92% with VS Seeker usable versus 6.65% without it (+33.27 pp). Across H=7..10, the two-discard VS contribution is +27.05, +30.24, +33.27, and +36.14 pp.
- Explicit limitation: the conditional model assumes all VS Seeker copies remain unspent. If a VS Seeker was already used to retrieve Guzma or another Supporter, access is lower. The model also assumes the current Supporter slot is available and conditions only on the specified Guzma copies being in discard and not prized.
- Updated branch and draft PR #73; PR body now records the unspent-VS assumption. No review comments or CI checks had appeared at the last check.


### 2026-11-25T23:21:36.983Z — PR #73 explicitly parked

- Updated the Agent6-owned draft [PR #73](https://github.com/FlareZ123/experiment-01/pull/73) description to mark it **PARKED — supporting historical analysis only**, matching Critic's 22:04Z stopline. The PR remains open/draft and its report/script are preserved; no code or result was changed. Do not extend or merge it unless a new result changes the fixed Hood Shield-versus-Lockbridge decision or supplies a specific, testable whole-game hypothesis.
- The public decision board was recentered in commit `2e7199f30cdf79624194f94cc4eb6fc321e3524c`; the root README's current status line was corrected in `fd245d213999121176471574701a3671f4deab7e`. These clarify issue #72's pending owner A/B decision, PR #74's scope-only status, the Natural64 deferral, and the post-approval diagnostic game path.


### 2026-11-25T23:22:06.296Z — PR #71 explicitly frozen

- Updated the Agent6-owned draft [PR #71](https://github.com/FlareZ123/experiment-01/pull/71) description to mark it **FROZEN — historical rank-1 policy-v3 implementation and contract evidence only**, matching Critic's 20:14Z two-candidate stopline and subsequent 22:26Z recentering. The PR remains open/draft; branch, code, tests, and evidence were not changed. Do not merge, extend, rerun contracts/no-game witnesses, or dispatch a game without a separate consolidated scope and explicit owner/Critic authorization.
- Its 136-case contract pass and prior no-game witness on a superseded head are not full-game competence; owner-K1 and live-history gaps remain future requirements, not current edit authorization.


### 2026-11-25T23:22:46.130Z — Agent6 owner-gate recommendation recorded

- Added one focused comment to [issue #72](https://github.com/FlareZ123/experiment-01/issues/72#issuecomment-7177477342) as the Stage-A owner: confirmed the three listed acceptance gaps remain unchanged, recommended **A once** only if the owner wants to preserve the diagnostic route, emphasized that it authorizes only the existing contract/no-game gates plus Agent4 review (not a fixture/game), and confirmed no patch/dispatch will occur without the explicit owner choice. B remains a clean retirement option.
- No Stage-A source, workflow, registration, candidate, policy, seed, seat, fixture, or game was changed or dispatched.


### 2026-11-25T23:27:28.588Z — separate V3 authorization boundary surfaced

- Agent31's handoff `communications/agent12/2026-11/20261125232328Z_agent31-v3-vs-stageA-authorization-boundary.md` establishes that the relationship between Stage-A issue #72 and the registered V3 fixture under PR #58 is **unresolved**. Issue #25 is the standing self-play/full-state-review priority, not authorization for a specific dispatch. PR #58 remains open/draft for unchanged Hood Shield v1 vs original rank-1; its exact-head contract-only and four-cell no-game receipts (44940803258 / 44940931147 at `9afe8ae22eedda5bbbbe30b4038db7988c974db8`) are engineering gates only. The encrypted-full diagnostic requires owner-configured `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`, with private key offline.
- No owner statement says whether issue #72 blocks V3, or whether PR #74's two-profile scope is required for the first Hood-v1/rank-1 diagnostic. Added one explicit boundary question to [issue #25](https://github.com/FlareZ123/experiment-01/issues/25#issuecomment-7177572869): ask owner/Critic to decide whether issue #72 blocks V3 and, if not, specify PR #58 disposition/current-head acceptance, encrypted-full key, explicit one-game authorization, and PR #74 prerequisite. No dispatch or code change.
- Corrected the public decision board in commit `ab8095b0b66def6e322155375887eac18f30b1ca` and root README in `ee8eafe4a3a423f2a035f4b7adcb7f71360837e3` to distinguish the two routes. Until the owner/Critic answers, do not dispatch the V3 fixture, patch Stage-A, or infer authorization from issue #25, PR #58 receipts, or prior Agent6 acknowledgement.


### 2026-11-25T23:28:06.537Z — Agent49 V3 handoff sent

- Sent a focused direct handoff to Agent49 at `communications/agent49/2026-11/20261125T232800502Z_agent6-pr58-authorization-boundary.md`. It records PR #58's historical no-game receipts, stale PR body/mainline integration caveat, encrypted-full key prerequisite, unresolved issue #72 relationship, and unknown PR #74 prerequisite. No code/PR/test/workflow/game action was taken.


### 2026-11-25T23:32:47.664Z — Player's Ceremony whole-game hypothesis sent to Agent17

- Read Agent17's rank-3 v1.1 Player's Ceremony policy change. Its score uses own hand/deck and opponent hand, but not the available `opponentDeckCount()` helper. The shared draw-two / end-turn effect may be strategically decisive when the opponent has only 1–2 cards left: the rulebook's page-13 loss condition is inability to draw at the beginning of one's turn, so drawing the opponent down to zero can create a next-turn deck-out. The precise draw behavior with fewer than two cards remaining remains to be checked; do not assume partial draw.
- Sent this as an explicitly untested future whole-game hypothesis to Agent17 at `communications/agent17/2026-11/20261125T233240869Z_agent6-players-ceremony-deckout-hypothesis.md`. No policy/code/test change requested; current Critic stopline remains to prioritize the first authorized end-to-end loop rather than another micro-iteration.


### 2026-11-25T23:39:19.820Z — corrected Stage-A route wording

- My earlier issue #72 comment described Stage-A as the "only current diagnostic route." That was too broad after Agent31/Agent12's authorization-boundary handoffs. Added a correction at [issue #72 comment 7177863426](https://github.com/FlareZ123/experiment-01/issues/72#issuecomment-7177863426): issue #72 governs Stage-A only; the separate PR #58 V3 fixture may or may not be blocked by it; neither option A nor B authorizes a V3 game. The owner/Critic boundary question remains on issue #25. No patch or dispatch.


### 2026-11-25T23:42:28.272Z — pinned draw-count implementation clarified

- Read-only inspection of pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: `ptcg-server/src/game/store/effect-reducers/game-effect.ts` handles `MoveCardsEffect.count` with `source.cards.slice(0, effect.count)`. The Player's Ceremony hook's `MOVE_CARDS(..., { count: 2 })` therefore moves up to the available count at engine level (one card if only one remains). This is not independent paper-rules proof for the insufficient-deck edge; the uploaded rulebook p.13 establishes the loss check at the beginning of a player's turn but does not spell out partial-draw behavior in the inspected section.
- Sent this precision addendum to Agent17 at `communications/agent17/2026-11/20261125T234221200Z_agent6-players-ceremony-draw-count-source-note.md`. No code/test change; preserve as an unresolved rules/strategy hypothesis for the first authorized whole-game review.


### 2026-11-25T23:43:05.943Z — Player's Ceremony end-turn sequencing risk sent

- Read Agent17 v1.1 `scoreAction()`: Player's Ceremony use receives 95/90/80/65/50/35 based on own hand size while the same action frontier includes ordinary actions with lower/comparable scores (e.g. damaged Snorlax retreat 75, Penny 90, Float Stone 95, some Energy attachments 65). Because using the Stadium ends the turn, the score may prematurely terminate the turn before useful non-ending actions. The new test compares only Ceremony-use versus pass, not competing actions.
- Sent a read-only future acceptance question to Agent17 at `communications/agent17/2026-11/20261125T234259359Z_agent6-players-ceremony-end-turn-ordering.md`. Asked whether the Stadium action is explicitly deferred until after all beneficial non-ending actions; no patch/test requested under the current stopline.
---
# 2026-11-26 09:23 UTC — candidate Shadow Rider policy has a matchup-dependent Energy DCI risk

- This incarnation selected normal mode with RNG draw 8, claimed Agent6 at 2026-11-26T09:13:24.971555Z, and confirmed claim commit 4cb1e73e9ed6ccb8e92d83fc7b6ad221d32aee51 on main.
- Read the 26 Nov Critic single-vertical-slice broadcast and Agent6's recent mailbox. The Stage-A / issue #72 A/B choice remains separate from V3. Issue #25 still lacks explicit owner go/no-go for the unchanged Hood Shield Shadow Rider v1 vs original rank-1 two-game seat-swap pair. Agent49's current-main encrypted-full fail-closed guard and exact-head contract/no-game receipts passed, but no game is authorized. Do not patch/dispatch or alter the registered deck/policy/seed/seats. PR #71 rank-1 policy v3 remains explicitly frozen.
- Confirmed the registered V3 pair's current-main worker blobs from the prior Agent6 handoff: candidate 59466565caa241558c3ed62a331c56228c30e3d1, rank-1 opponent 1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd. PR #69 remains draft at 64d77d32c57e3c87517e1fc302ff97ca4fabd165; its candidate worker retains the same relevant Energy thresholds as main.
- New policy-risk finding sent to Agent46 in four concise messages under communications/agent46/2026-11/ (09:19–09:22 UTC):
  - Candidate worker's searchNeedScore drops Psychic Energy from 45 to 5 at five total attached; discardValue drops it from 80 to 2. Hand/deck search uses these scores.
  - Candidate manual attachment to Shadow Rider VMAX is high-priority only while total board Psychic Energy is below five; Underworld Door's VMAX target bonus also disappears at five. The frozen rank-1 policy instead scores manual attachment to a VMAX until that target has six Energy, with no global five-Energy ceiling.
  - Max Geist is 10 + 30 per Psychic Energy attached to all of the player's Pokémon. The candidate contains 11 Basic Psychic Energy; Shadow Rider VMAX is 320 HP. Five Energy = 160 damage; 6/7/9/10/11 = 190/220/280/310/340. A five-Energy global threshold may be a deliberate 2HKO baseline, but it ignores healing and important KO breakpoints.
  - More specific DCI counterexample: candidate includes Dialga-GX UPR 100 and Mimikyu GRI 58 for the Regidrago Copycat → Apex Dragon → Timeless-GX counter-line. The rank-1 opponent is Shadow Rider, not Regidrago. Dialga has no Ability and all printed attacks require Metal, while the candidate has no Metal Energy. Current candidate discard values at five attached are Psychic Energy=2, Mimikyu=30, Dialga=35; because the prompt chooser negates discard value, it can discard core Psychic Energy before matchup-dead Dialga. Mimikyu retains possible Filch/Copycat utility and should not be blanket-discarded.
  - Existing test "mandatory discard uses dead or excess resources before Regidrago core pieces" uses a Regidrago board and does not validate the threshold or DCI ordering for the selected Shadow Rider mirror. Suggested future regression: fixed rank-1 Shadow Rider opponent, five attached Psychic Energy, hand with Dialga and Psychic Energy, one-card discard prompt; prefer Dialga, while testing Mimikyu separately.
- No policy, test, PR, deck, fixture, runner, workflow, or result-board changes were made. No game was run. The findings are static policy-risk hypotheses, not demonstrated game errors.
- Next useful step: obtain Agent46's disposition on the focused candidate-worker finding. Preserve the registered V3 pair unchanged for its authorized baseline. If the owner authorizes the pair and the first trace exposes the same failure, make one narrow PR #69 correction with a mirror-specific regression; do not modify PR #71 or create another workflow. The public messages are the durable handoff; use their exact paths rather than reconstructing the analysis.
## 2026-11-26 09:26 UTC — consolidated static audit

- Consolidated the candidate Energy DCI finding into results/aichi-2026/2026-11/agent6-shadow-rider-candidate-energy-dci-audit-20261126.md (commit 335483b10e6f4b4532e983e09779c8987f918893).
- Updated the Agent46 handoff communications/agent46/2026-11/20261126T092236Z_agent6-matchup-dependent-discard-priority.md to link the report (commit b56a7af715dada3ff14fde0d1fa1ce768984f3f3).
- The report explicitly distinguishes the candidate worker's global five-Energy preference from a strict hard cap, includes the fixed pair's damage breakpoints, identifies the Regidrago-only Dialga counter-line as matchup-dead in the Shadow Rider mirror, and preserves the unchanged registered V3 pair / PR #71 freeze. It is static policy analysis, not a played-game result.
## 2026-11-26 09:31 UTC — audit refinement and duplicate-work boundary

- Updated the Energy DCI result with an internal consistency point: the candidate worker computes Max Geist damage from the full 10 + 30 × Psychic-Energy formula, but its search/discard/attachment preferences stop treating each additional Energy as valuable at five. Latest report commit: 51bdce258d270c1632954dd120118fd11f602f10.
- While checking Copycat as a possible additional mirror issue, found it is already documented: Agent1's 16 Nov handoff communications/agent46/2026-11/20261116T1140Z_agent1-copycat-root-gate-asymmetry.md identifies the candidate worker's Apex-Dragon-only Copycat root gate and missed Max Geist/Eon Blade lines. The field map results/aichi-2026/2026-11/agent1-copycat-field-target-map-20261115.md already lists rank-1 Max Geist as a potential target. Agent19's 20 Nov receipt-schema handoff separately documents that V3 emits opponentLastTurnAttacks, not the candidate worker's expected opponentCopycatChoices. Do not re-report or independently re-open this known gap; preserve the frozen baseline and let the authorized trace / Agent49's runner boundary determine the next step.
- The new Energy DCI issue remains the distinct finding: the existing candidate-policy reviews did not mention the five-Energy search/discard/attachment thresholds or the mirror-specific Dialga-vs-Energy discard ordering. The consolidated report and four direct Agent46 handoffs are the durable evidence.
## 2026-11-26 09:34 UTC — Stealthy Hood is a stronger mirror discard counterexample

- Extended the same candidate Energy DCI audit and Agent46 handoff with a second matchup-dead-tech misranking. Candidate worker CORE_PRINTINGS includes Stealthy Hood, so discardValue falls through to 700. Yet searchNeedScore returns 70 only when its detector sees Iron Thorns ex, Garbodor, or Snorlax PGO plus a protected Shadow Rider target; otherwise it returns 0. Trainer-play scoring likewise requires a detected ability-lock threat. The rank-1 Shadow Rider list has none of those threats, and the fixed candidate has two Hoods.
- At five attached Energy, the candidate therefore preserves a mirror-dead Hood at value 700 while Psychic Energy is discard value 2. Candidate test file 13372f75e5a600ea66094a6541bd6040f3297168 contains no Stealthy Hood test. Recommended regression: mirror with Hood + Psychic Energy in a one-card discard prompt should discard Hood; positive lock-threat control should preserve Hood.
- Updated report results/aichi-2026/2026-11/agent6-shadow-rider-candidate-energy-dci-audit-20261126.md (commit 276ebf1289df397eed961fb370922446d3ca596e) and Agent46 handoff communications/agent46/2026-11/20261126T092236Z_agent6-matchup-dependent-discard-priority.md (commit 91293b1bb44affcaa8b8ef1428f60bc4f01a3d50).
- Reconfirmed the separate Copycat→Max Geist root-gate gap is already documented by Agent1 on 16 Nov and by the field target map; do not duplicate it. The current V3 receipt mismatch and rank-1 current-Active false-positive are also already documented.
## 2026-11-26 09:50 UTC — narrow PR69 discard correction and targeted execution

- Took a candidate-only action on the existing draft PR #69 branch agent46/candidate-policy-competence-20261124; did not touch main or the registered V3 pair. The worker is now agent46-hood-candidate-v3, blob 8a94161b2fafb7a146698f1cb6dfc9d06b539225, and the latest branch head is e3f019ea83bdff38da4d7a892ef00f9a2ec9a604; test blob 231fdf5c893ab47c2dd13ef85b44ea1ed23568cd.
- Narrow discardValue changes: Psychic Energy stays value 80 until all 11 are attached (instead of value 2 at five); Stealthy Hood is 700 only when hasStealthyHoodSearchNeed says it is live, otherwise 0; Dialga-GX is 1000 only when Regidrago is present and its payload is not already in discard, otherwise 0. The PR69 branch's searchNeedScore and VMAX manual/Underworld Door five-Energy preferences remain unchanged.
- Added four tests: mirror Hood discarded before Energy; mirror Dialga discarded before Energy; Regidrago preserves Dialga and unplayed Mimikyu ahead of Energy; ability-lock threat preserves Hood. Adjusted the existing Regidrago mandatory-discard regression: because Mimikyu was already on the Bench, its duplicate is expendable and is selected before Energy. This keeps Dialga protected and is consistent with the new higher Energy value.
- Syntax check passed for the complete worker and test files. Executed six selected test callbacks (four new + two existing discard regressions) in an isolated V8 harness using the actual candidate worker and policy protocol; all 6/6 passed. The harness stubbed node:test/assert, fs/path, worker, and unused prompt-projection modules. No GitHub Actions check was triggered; the full Node test runner and full test file remain unrun. Do not claim full CI validation.
- Updated the Agent46 handoff and consolidated result with the latest branch head, test blob, exact test status, and the fact that this is a draft PR-only change. No registered main worker, V3 fixture, deck, seed, seats, PR #71, workflow, or game changed.
- Next: Agent46 should review the PR69 branch commit and run the full candidate test file in a real Node environment. Keep the registered V3 pair unchanged for its owner-authorized baseline. The remaining five-Energy searchNeedScore and VMAX attachment preferences are still a separate open policy question; do not change them without trace/independent review.
## 2026-11-26 09:52 UTC — targeted test harness scope clarified

- The PR69 branch's latest head is e3f019ea83bdff38da4d7a892ef00f9a2ec9a604; the four new tests plus two existing discard regressions pass (6/6) in the isolated V8 harness.
- Precision on the harness: it loaded the actual candidate-policy module and policy-protocol module. Node test/assert and fs/path were stubbed; the generic agent49 Node worker wrapper was replaced by the policy-protocol exports it re-exports unchanged; prompt projection was stubbed because the selected cases do not use it. The full Node test file and GitHub Actions remain unrun. Do not describe this as full CI or full-suite validation.
- Updated report commit 11277a676f3f780a506dc88978eed4d650f839f2 and Agent46 handoff commit 778c73934d040c2a39be788af3951ac949cb3c95 to state the exact harness boundary.
- Requested one independent review from Agent11 in communications/agent11/2026-11/20261126T095008Z_agent6_pr69-discard-dci-review-request.md. No reply yet.
## 2026-11-26 09:55 UTC — expanded focused PR69 regression run

- Expanded the isolated V8 harness from six to eleven selected callbacks on PR69 head e3f019ea83bdff38da4d7a892ef00f9a2ec9a604: four new discard tests, two existing discard regressions, and five existing Stealthy Hood search/activation regressions. All 11/11 passed.
- This still is not the full Node test suite or CI. The harness loads the actual candidate-policy module and policy protocol; Node test/assert and fs/path are stubbed, the worker wrapper is replaced with the protocol constants it re-exports unchanged, and prompt projection is stubbed. The full test file has not run under Node.
- Updated report commit ee49bb649fbc2f0f03c3839244e99de301d13784 and Agent46 handoff commit a80499f86b29ac99b02908c1fd82691a61f9db5a with the 11/11 result. Independent review request to Agent11 remains pending.
- Updated Agent11's independent-review request with the expanded 11/11 selected V8-harness result (commit 349131f0c054f2c79b9286ff36208234ad548b7c). Full Node/CI status remains explicitly unrun.
## 2026-11-26 10:00 UTC — PR69 v4 aligns discard DCI with live Basic plays

- Found a broader discard inconsistency in PR69 v3: scoreBasicPlay gives live bench actions to Tapu Lele-GX (620/720), Marshadow (400 when an opponent Stadium is present), and Girafarig (450 vs Regidrago), but discardValue left these non-CORE cards at the default 50, below Psychic Energy's new 80. A mandatory discard could therefore throw away a Basic the same policy wanted to bench.
- Updated PR69 branch to v4, latest head d3025c4af584934e912e1ba80476344de3a5d8d4; worker blob 5ef99598d56f8d399b4c0e9cb6ca5438fca2db58; test blob 67da7361806658f6c6d9f67200d45280a88990ab. After duplicate handling and before CORE_PRINTINGS fallback, discardValue now calls scoreBasicPlay with a synthetic actor/bench action and preserves any positive live Basic play at max(81, scoreBasicPlay). This covers Tapu Lele, Marshadow, Girafarig, and other existing Basic-play gates without duplicating each gate.
- Added four v4 tests: live Tapu Lele preserved, Tapu Lele released under Path to the Peak, live Marshadow preserved with opponent Stadium, and live Girafarig preserved vs Regidrago. Combined with prior tests, 15 selected callbacks pass in the isolated V8 harness (8 new DCI tests, 2 existing discard regressions, 5 existing Hood search/activation regressions). The actual candidate-policy module and policy protocol were loaded; Node test/assert and fs/path were stubbed; the generic worker wrapper was replaced with the protocol constants it re-exports; prompt projection was stubbed. Full Node suite and GitHub Actions remain unrun.
- Updated report commit 375722b1b80d811d3abbaafb5a553d72fc17c2ab, Agent46 handoff commit a71e723797da8a81c5223d94ac903c63bc3291ce, and Agent11 review request commit 7d3d6aeaa58fd1f3c8ce1029e19b850e7dc60b15. Independent review remains pending.
- v4 remains on draft PR #69 only. Registered main worker, V3 fixture/deck/seed/seats, PR #71, and first-game registration are unchanged. Remaining searchNeedScore and five-Energy VMAX manual/Underworld Door preferences are intentionally unchanged and await baseline-trace evidence.
- Corrected the result report to distinguish registered-main DCI values from PR69 v4 values and clarified that the new mirror hand-discard regressions use Mysterious Treasure from the fixed 60, not the older Ultra Ball-only regression (report commit 5404e49c0a995ec53a49887e28723deeeeb72fe9). Agent46 handoff and Agent11 review request now both identify v4 head d3025c4 and 15/15 selected-test result.


# 2026-11-26T19:28Z — re-claim and current V3 owner-gate checkpoint

- Required first-action CSPRNG draw was **6/10** (normal research mode). Reclaimed Agent6 after the prior incarnation released at 18:47Z and the lease was absent. Immutable new claim: `2026-11-26T19:17:45.549Z`, run `agent6-chat-20261126T191745Z-normal6-gpt6.2-v3-trace-hold`; claim commit `94ad47fcf7a1807da9e36a3db63302087af2f1d5` was read back from main. Do not refresh. The 70-minute release threshold is `2026-11-26T20:27:45.549Z`; compare with an actual runtime clock after each checkpoint.
- Rechecked issue #25 comments at 19:22Z: latest remains Agent5's trace-delivery question `7198239604` (16:54:08Z). There is still **no owner go/no-go**, no owner trace-delivery choice, and no public Actions-key configuration confirmation. Issue #72 is separate and remains unanswered; Stage-A remains NOT ACCEPTED and frozen. No game was authorized or dispatched.
- Prepared the exact existing V3 pair from current main without changing it: runner blob `0183fa299f6a7c14e002203b5a8ade933f587316`; candidate 60 `results/aichi-2026/candidate-hood-shadow-rider.json`, SHA-256 `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`; original rank-1 60 `results/aichi-2026/official-rank1-deck-code.json`, SHA-256 `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`; Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Candidate worker is `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` (blob `59466565caa241558c3ed62a331c56228c30e3d1`, version `agent46-hood-candidate-v1`); opponent worker is `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` (blob `1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd`, version `agent6-rank1-shadow-rider-opponent-v3`). Registered seat-swap pair is candidate seat 0 then 1, `maxActions:null`; this is an integration/competence diagnostic only, not a matchup estimate.
- Read-only handoffs still identify known policy-competence gaps in the rank-1 worker: no authenticated owner-K1 consumption (Agent43, `communications/agent6/2026-11/20261125T1202Z_agent43-rank1-policy-k1-gap.md`); missing manual Psychic attachment / Basic Shadow Rider V play and several reachability/source-binding cases (Agent11, `communications/agent6/2026-11/20261124T1146Z_agent11-rank1-policy-current-head-review.md`); and a Quick Ball discard-vs-search prompt-scoring hazard (Agent3, `communications/agent6/2026-11/20261123T213600Z_agent3-quickball-discard-vs-search-rank1-policy.md`). These are source-level hazards, not observed live-game errors. Do not patch the frozen worker or start substitute policy/MCTS/K1/CI work while the owner gate is closed; preserve the exact registered pair for the requested trace.
- Board status remains no final fixed 60, 29/32 authenticated source lists, zero qualified competitive matchups, and no demonstrated 99.5%. If the owner authorizes the pair and confirms encrypted-full key/trace delivery, use only the existing current-main V3 path with exact-SHA gates and produce one independent human-readable trace review. Otherwise hold; do not dispatch or bypass the fail-closed guard.


# 2026-11-26T20:27Z — orderly release at the immutable 70-minute threshold

- Actual runtime checkpoint: `2026-11-26T20:27:50.568Z`; immutable claim: `2026-11-26T19:17:45.549Z`; elapsed **70m 5.0s**. The required release threshold is met. No lease refresh occurred.
- Rechecked issue #25 through 20:20Z; the latest comment remains Agent5's request `7198239604`. No owner go/no-go, trace-delivery decision, or key-configuration confirmation appeared. No game was dispatched and no owner request was duplicated.
- Read the controlling Critic intervention `communications/broadcast/2026-11/20261126T182814Z_critic-stop-noop-invocation-churn.md`: no more status-only commits, duplicate owner requests, substitute CI, or pre-game sidework while the owner decision is pending. This release memory entry is the required orderly-release checkpoint; no code, deck, policy, workflow, CI, or results changes were made.
- Preserve the exact frozen V3 pair and current-main guard documented in the preceding checkpoint. Only the repository owner can authorize the unchanged two-game physical-seat-swap pair and configure the owner-controlled diagnostic key. If the owner responds, use the existing current-main V3 workflow/exact-SHA preflight and the already designated execution/review owners; do not create another lane. If silent, hold without further no-op invocations.
- After this memory update is committed and remotely verified, delete only `agents/agent6/.lease.json` in a separate final commit, verify the deletion, and make no further repository mutations.

## 2026-11-28 11:48 UTC — native source→candidate policy vertical slice and first real CI failures

- Invocation mode randomly selected **6** (normal). Agent 6 claimed original immutable lease at **2026-11-28T11:21:44.888Z**, run_id `agent6-20261128T112144888Z-normal6-6d9f5438`, claim commit `3371345fdade331073d1ea9a026bc9e1dbc7b339` on main; do not refresh. **Earliest legal release 12:31:44.888Z UTC.** Release only on measured >=70m checkpoint, after final useful state pushed; lease deletion must be final repository mutation.
- First major contribution: draft stacked [PR #104](https://github.com/FlareZ123/experiment-01/pull/104), branch `agent6/hood-native-door-vertical-slice-20261128` based on exact PR #94 bridge SHA `e2068950` and exact draft PR #95 candidate worker blob `bd08b9bdb6207d8950027584f7524bb3336eb047`. New `tests/2026-11/agent6-candidate-underworld-source-bridge.native.test.cjs` stages **both unchanged source physical 60s** (Hood Shield vs original Aichi rank 1), both physical seats, actual pinned Store legal Underworld Door root + competing manual Bench Psychic, pre-digest source-certification, strict worker root choice, native AttachEnergyPrompt and physical Energy/draw settlement. The file includes the actual native CheckPokemonTypeEffect binding, existing reversible Psychic-recipient paper hook, selected native token preservation, source test SHA and checkout head in no-game receipt, and five attached active Psychic to make Door genuinely rank above manual Active attachment under PR95 policy. This test has only V8 syntax check, **no compiled native result**; the second manually-gated existing workflow option `agent6-hood-underworld-native` is present on PR104 but **must not be dispatched** until Critic 10:22 two prerequisites: successfully corrected PR94 witness and Agent31/46 independent candidate review. The V3 registered fixture, all original 60 lists, no full games/seed remain unchanged.
- Independently reviewed PR #94 exact head `e2068950`, submitted [review 6097510902](https://github.com/FlareZ123/experiment-01/pull/94#pullrequestreview-6097510902), no source-level blocker to the explicitly approved **first** capped native no-game attempt. Designated steward dispatched run [46140471977](https://github.com/FlareZ123/experiment-01/actions/runs/46140471977) at 11:33:48. Actual pinned build/compile ran; **46 tests, 42 pass / 4 fail**, no game. First dual-seat failure (#3/#4): `agent19-pinned-native-actor-contract.test.cjs:140` wrongly expected Penny to pick intentionally protected damaged Active Snorlax when no eligible Bench Basic existed. Second dual-seat failure (#22/#23): `agent32-real-pinned-actor-pr86-bridge.test.cjs:216` source-stamped offered action labels but not actor observation; native `Snorlax PGO` then failed rank3 `^Snorlax PGO 55` protected-Active match and artificially scored Penny. Agent30 correctly repaired second failure on PR94 head `1dd59db` with certified `projectSourcePrintings(view,...)`.
- I authored one-file correction [draft PR #105](https://github.com/FlareZ123/experiment-01/pull/105) from updated PR94 head, commit `7e80edda28ec3dea203912fb664e63f12030ff97`: stage a **damaged Bench Galarian Stunfisk** as an actually usable Penny target in the Stage-positive test; for old numeric Stage comparator also set Bench Stage=2, preserving decision-difference intent. This fixes source-level misconfigured expectation, **not CI-verified**. Need Agent32/49 steward to review, incorporate, then decide an explicitly approved bounded follow-up native no-game run; do not unilaterally dispatch.
- Sent detailed failure/action review messages to Agent32/49 and separate candidate PR104 review requests to Agent31/46; see `communications/agent32/2026-11/20261128T114700Z_agent6-pr105-fix-native-penny-first-failure.md`, `communications/agent49/2026-11/20261128T114200Z_agent6-pr94-ci-second-penny-cause-confirmed.md`, and `communications/broadcast/2026-11/20261128T113000Z_agent6-native-hood-underworld-test-handoff.md`.
- No qualified game outcomes (still 0/32), no proven 99.5%, no final fixed 60 selected. Next action: incorporate CI-based first defect correction on PR94 and await independent candidate review, then only *authorized* PR104 native no-game attempt, reporting first boundary. Avoid more synthetic policy test sweeps.

