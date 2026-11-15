# Agent35 — current durable memory

Last compacted: 2026-11-15T11:50:15.585Z  
Full chronological history preserved verbatim in [`memory-history-20261115.md`](memory-history-20261115.md). Read this file first; consult the archive only when a specific historical investigation is relevant.

## Identity and operating rules

- Current identity: **Agent35**, normal research mode. Current incarnation run ID: `agent35-chat-20261115T111714474Z-normal5-gpt6`; immutable lease claim: `2026-11-15T11:17:16.596Z`. Do not refresh. At every checkpoint, compare the original claim with the real system clock. Orderly release threshold: **2026-11-15T12:27:16.596Z UTC**. Release only at/after 70 minutes; push useful state first, delete the lease as the final repository mutation, then verify the deletion push.
- Repository: `FlareZ123/experiment-01`. Normal commits must start `Agent 35:`. Use one identity only. Never inspect or modify another identity's lease or memory. Normal agents may read `private/`, but no private material was needed in this incarnation.
- Primary objective remains one legal, fixed 60-card paper Expanded deck (BW onward) against the full Aichi Open League 2026 Top 32. **No 99.5% claim is supported.** No final fixed 60 is nominated; no competitive-paper-qualified games exist. Native simulation wins/terminals are not paper competitive evidence.
- Treat Critic communications as serious collective direction, not facts without evidence. Current stopline: Agent49 owns the V3 host/worker integration; Agent35 reviews acceptance; do not fork a runner, launcher, sandbox, or policy implementation. No new workflow, deck edit, fixture dispatch, or broad field audit without the owner/explicit gate. Public physical-seed reproducibility is now owner-authorized, but technical acceptance gates still block fixture dispatch.

## Current exact-head review: PR #58

- PR #58 remains draft at head `c114c15ce3a39631612bbc65bc7a56f72ddf244e`. At last check there were **no Actions runs for that exact SHA**. Agent35 did not dispatch CI, a fixture, or any seed.
- **One remaining hosted acceptance gap in the worker/protocol scope:** `tests/2026-11/agent36-docker-policy-worker.test.cjs` runs its four role/seat × two-request Docker OS canary using the test-only `agent49-docker-canary-worker.cjs`. The actual production VM worker `agent49-policy-worker.cjs` is exercised in Docker only by a one-request candidate/seat-0 smoke plus timeout coverage. Local tests separately cover roles/seats and sequential requests, but no hosted production-worker matrix composes them. Required closure: actual VM worker; distinct candidate-only/opponent-only bundles; candidate/opponent × physical seats 0/1; two ordered requests per persistent worker; host-computed digest and READY validation; stable worker/container identity; verified process/container/bundle cleanup. Keep the test-only worker for OS capability probes.
- No new workflow is needed: `.github/workflows/agent36-bilateral-competence-v9.yml` already runs the pure worker/protocol tests, Docker launcher contract, digest-pinned Docker preflight, and the Docker worker test in `contract_only`; its default no-input compile-enabled/no-fixture path includes `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs`.
- Agent3 independently confirmed the production-worker matrix gap. Agent35's exact-head review is in `communications/agent49/2026-11/20261115T112656Z_agent35-current-head-worker-review.md`; public PR comment **6893763015** supersedes the older Agent35 review at `5abe916`. If the PR head does not change, do not repeat this review. If it changes, review only the changed acceptance paths.
- **Resolved source-level items at c114c15:** closed `selectionType` ↔ `promptType` mapping and single/multi contracts; owner/target visibility with typed `isOwnerVisible` and hidden target printing/index redaction; exact pinned `native.GameError` identity and fatal propagation of unknown errors; native Item `canPlay(store,state,player)` preflight rather than blanket Item catches (Battle VIP Pass, VS Seeker, and conditional Item witnesses); compiled seat-1 Store/frontier/revalidation witness; VM resistance to Object/Reflect redefinition of globalThis, Math, and Math.random. The two-seat actor-view test checks concealed hand/deck/face-down Prize/setup Pokémon sentinels. Runner maps active physical seat to `sessionsBySeat[actorSeat]` and sends only actor observation, projected prompt, public receipt, and action frontier.
- Async path is source-checked: `driveNativeFixtureGameAsync` awaits worker decisions; physical RNG scopes are synchronous and reject thenables; async runtime module pinning restores only after the awaited callback. Worker receives no physical RNG or engine state. Candidate and opponent policy source modules are deterministic and do not call Math.random, `context.rng`, Date, process, require, timers, crypto, fetch, or console.
- Copycat correction: producer and protocol both choose the maximum eligible `barragePairIndex`; withdraw the earlier claim that a later unpaired attack invalidates a valid two-row pair. The single-choice latest eligible unpaired check is present. Live runner passes no prior-turn tracker, so Copycat remains unsupported/fail-closed.
- Stadium suppression scope: current c114 source includes a compiled native witness authored to test candidate seat 0 counter zero while only opponent seat 1 has counter 1 and a Stadium; it expects native rejection of `USE_STADIUM_ACTION` and preserves Pass. **This test has not been executed** because there are no Actions runs for c114c15. Treat the scope as source-level coverage added but pending compile-enabled/no-fixture execution; do not call it resolved until that exact-head workflow passes. The earlier Agent5/Agent36 messages overstated the evidence; corrections were sent at `communications/agent5/2026-11/20261115T115048Z_agent35-stadium-witness-execution-status-correction.md` and `communications/agent36/2026-11/20261115T115048Z_agent35-stadium-witness-execution-status-correction.md`.
- Sync correction: the deliberate main sync merge `eb9523cc3b4fa2e9c7266c4d0d0c865c5970ce6f` is already an ancestor of c114c15 (3 commits ahead / 0 behind from that merge). Later main-only changes were agent-memory/lease and communications paths with no overlap against PR code. Do **not** rebase merely to absorb communications-only commits. Correction message: `communications/agent49/2026-11/20261115T113308Z_agent35-sync-status-correction.md`.
- Fairy Zone fixture target HP=410 matches Agent36's source-backed diagnosis; source review only, no test pass claim.

## Other hard gates before any diagnostic fixture

- Issue #59 owner decisions are explicit in comment `6893903051`: **candidate-only international Expanded vs the unchanged original Aichi Japanese Extra lists**, labelled a custom cross-format challenge (not Expanded-vs-Expanded or sanctioned Expanded); and **public reproducible physical seed**. Do not substitute/drop opponent cards or reopen seed confidentiality. The owner explicitly rejected obfuscation: the bots are code, and the necessary boundary is actor-visible game state.
- The exact runner `validatePhysicalSeedDisclosureDecision` accepts `public-reproducible`, so no private-host-only implementation is needed. The public-seed choice is made; explicit environment authorization remains required at fixture dispatch.
- `V3_FIXTURE.maxActions=6000` remains wired into the async driver and decision-budget receipt. Critic's first diagnostic slice requires **no action cap**; remove it before any authorized diagnostic game.
- Current runner uses both candidate seat orientations. This is diagnostic integration, not 32-matchup performance evidence. Do not claim a winner or competitive rate from it.
- Field status under the selected custom cross-format benchmark: 29/32 original Aichi source name/count lists authenticated; ranks 23/25/28 unavailable; retain the five Japanese-only promo lists unchanged as Japanese Extra opponents. They are not Expanded-legal opponent entries; the candidate alone must be international Expanded. No final fixed 60 or competitive-paper-qualified games. See root README and issue #59.
- `results/README.md` has already been updated to record the owner-selected cross-format primary, the 24-rank strict-Expanded secondary comparison, public reproducible seeds, and the remaining action-cap/worker-matrix/acceptance gates. Do not duplicate that update.

## Key files and evidence

- Worker/protocol: `simulation/evaluation/2026-11/agent49-policy-worker.cjs`, `agent49-policy-protocol.cjs`, `agent36-async-docker-policy-session.cjs`, `agent36-docker-policy-worker.cjs`.
- Runner/frontier: `agent36-v3-runner.cjs`, `agent36-native-action-frontier.cjs`, `agent49-native-fixture-game.cjs`, `agent3-known-cap-free-action-enumerator.cjs`.
- Tests: `tests/2026-11/agent49-policy-worker.test.cjs`, `agent36-docker-policy-worker.test.cjs`, `agent36-actor-view-boundary.test.cjs`, `agent36-native-action-frontier.test.cjs`, `agent3-known-cap-free-action-enumerator-native.test.cjs`.
- Existing reviews: `results/methodology/2026-11/agent35-policy-worker-adversarial-acceptance-contract-20261114.md`, `agent5-worker-protocol-fail-closed-audit-20261114.md`, `agent36-native-frontier-rejection-matrix-20261115.md`, and Agent3's consolidated P0 checklist in `communications/agent49/2026-11/20261115T061333Z_agent3-consolidated-p0-review-checklist.md`.
- Human research map: `results/README.md`. It already contains statistical confidence-floor work; do not duplicate it. Historical deck experiments and prior Agent35 work are preserved in `memory-history-20261115.md` and detailed result files.

## Next actions

1. Continue until the measured 70-minute lease threshold. Do not exit early.
2. Monitor PR #58/Agent49 communications only when useful. If c114c15 is unchanged, do not re-audit or send duplicate checklists.
3. If a new head appears, review only the changed worker acceptance paths. Owner's intended sequence is existing `contract_only`, then default compile-enabled/no-fixture. Issue #59's format and public-seed decisions are resolved; remaining fixture gates are removal of `maxActions=6000`, production-worker matrix closure, passing both exact-head acceptance paths, and explicit public-seed environment authorization. Only then may the owner dispatch the two-seat diagnostic game.
4. Preserve useful state in this memory. At release: push all useful work, verify remote, delete `agents/agent35/.lease.json` as the final repository mutation, push and verify deletion, then stop.


### 2026-11-15T11:56:39.526Z — owner resolved issue #59

- Owner's decision comment `6893903051` selects candidate-only Expanded vs unchanged Aichi Japanese Extra opponents (custom cross-format challenge) and public reproducible physical seed. No seed obfuscation or private-host-only mode. This is an explicit owner decision; do not reopen or infer alternatives.
- Broadcast and direct messages committed: `communications/broadcast/2026-11/20261115T115550Z_agent35-owner-decisions-issue59.md`, `communications/agent49/2026-11/20261115T115550Z_agent35-owner-decisions-issue59.md`, `communications/agent3/2026-11/20261115T115550Z_agent35-owner-decisions-issue59.md`. PR #58 follow-up comment **6893937999** records the updated gate.
- The format/seed gate is resolved; the runner already supports `public-reproducible`, but explicit environment authorization remains required. Fixture remains blocked by the 6000-action cap, production-worker matrix, and exact-head `contract_only` plus compile-enabled/no-fixture acceptance. No fixture or seed was dispatched by Agent35.


### 2026-11-15T12:00:53.404Z — stale VSTAR/GX checklist findings checked

- Agent3's consolidated checklist still contained earlier “still-live P0” headings for VSTAR-used and GX-used actions, but the exact c114 source already includes `LABEL_VSTAR_USED` in `EXPECTED_REJECTIONS.USE_ABILITY_ACTION` and `LABEL_GX_USED` in `EXPECTED_REJECTIONS.ATTACK_ACTION` (`agent36-native-action-frontier.cjs`, lines 276–285).
- The compiled native test source contains corresponding witnesses: used VSTAR at lines 812–839 (Star Alchemy omitted, Pass retained) and used GX at lines 841–944 (Pale Moon-GX omitted, Night Watch and Pass retained). These are authored tests, not executed passes; c114 still has zero Actions runs.
- Sent Agent3 a correction at `communications/agent3/2026-11/20261115T120035Z_agent35-vstar-gx-checklist-correction.md` asking that the earlier headings be marked source/test-resolved, execution pending. Do not reopen those source gaps unless a new head changes the code or exact-head execution fails.


### 2026-11-15T12:01:49.394Z — stale Agent3 P0 headings corrected by exact-head source review

- At c114, `EXPECTED_REJECTIONS.ATTACK_ACTION` includes `LABEL_GX_USED`, and `EXPECTED_REJECTIONS.USE_ABILITY_ACTION` includes `LABEL_VSTAR_USED` (`agent36-native-action-frontier.cjs` lines 276–285). The compiled native test source includes used-VSTAR and used-GX witnesses (lines 812–944). The checklist's earlier “still-live P0” headings are stale; source/test fixes are present, but exact-head compiled execution remains pending. Correction sent to Agent3: `communications/agent3/2026-11/20261115T120035Z_agent35-vstar-gx-checklist-correction.md`.
- The conditional-Item source P0 is also fixed at c114: `itemCanPlayInValidationStore` is called before dispatch for every candidate; for Items it invokes the pinned `canPlay(store,state,player)` predicate, with false results preflight-rejected and no blanket `CANNOT_PLAY_THIS_CARD` catch. Compiled witnesses currently cover Battle VIP Pass and VS Seeker; broader named-card witness breadth remains incomplete. Correction sent to Agent3: `communications/agent3/2026-11/20261115T120130Z_agent35-item-preflight-checklist-correction.md`.
- These are source/test-presence findings only. There are still zero Actions runs for exact head c114; do not describe any compiled witness as passed. The hosted production-worker Docker matrix remains the distinct worker-acceptance gap.


### 2026-11-15T12:03:09.840Z — Agent3 checklist now reflects current source and owner decisions

- Agent3 updated the consolidated checklist after the correction messages. It now marks conditional Item preflight as source-fixed with broader named-card witness coverage pending; marks VSTAR-used and GX-used rejection source/test fixes present with exact-head execution pending; records the hosted production-worker matrix as the remaining worker acceptance gap; and records public reproducible seed mode as owner-authorized while fixture dispatch remains blocked by technical gates.
- Agent35's direct correction to Agent49 is committed at `communications/agent49/2026-11/20261115T120206Z_agent35-stale-p0-source-status.md`. Do not repeat those source audits unless c114 changes or exact-head tests fail.
