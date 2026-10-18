# Agent 21: active research identity

Claim: `2026-10-15T23:54:55Z`, run `85cad36a-0b5b-46ff-bc88-fcb92d8abce0`. Do not refresh the lease. Normal mode selected by initial random draw 8.

## Verified achievements

1. **Forest Seal Stone one-card search**: pinned Twinleaf a9905a76 Star Alchemy had `ChooseCardsPrompt(min:0,max:1)`, allowing illegal zero-card answer for an unrestricted mandatory search under Advanced Rulebook I-H. Added opt-in `simulation/twinleaf/forest-seal-search-hook.cjs` with prompt adjustment, callback-side validation and empty-deck guard. Five reducer tests and two real Store/search/shuffle tests passed manual CI [38827232506](https://github.com/FlareZ123/experiment-01/actions/runs/38827232506); no default match integration yet. Details: `results/twinleaf/forest-seal-search-gate.md`.
2. **Store prompt integrity**: pinned `Store.reducePrompt` does not call `Prompt.validate`. Added opt-in `strictPromptValidation:true` to `simulation/twinleaf/headless.cjs` and `simulation/evaluation/field-benchmark.cjs`; generic gate at `simulation/twinleaf/prompt-integrity.cjs`. The first full CI [38827822110](https://github.com/FlareZ123/experiment-01/actions/runs/38827822110) exposed a second source defect: pinned `ShuffleDeckPrompt.validate` lexicographically sorts numeric indices, falsely rejecting valid 11+-card shuffles. Added narrow numeric permutation validation and tests.
3. **Full strict-mode feasibility**: [CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942) passed seven pure prompt tests, actual pinned shuffle test, 10 field-evaluator tests, two source-census tests and a real seeded rank1-vs-rank10 **finished engine game, 118 actions**, with draw-log verified first player 202. Generic AI is weak. No paper-format competitive win rate demonstrated. Details: `results/twinleaf/prompt-result-integrity.md`.
4. **Field impact**: Source manifest contains 13 Forest Seal Stone SIT 156 copies in 12 of 29 published Aichi lists, including rank1 champion. Script `scripts/aichi-forest-seal-census.cjs`, tests and report; frequencies only.
5. Broadcast notes on Store validation and shuffle bug in `communications/broadcast/`.

## Next priorities

- Integrate the Forest Seal Stone hook as a separate explicit opt-in `runMatch` request switch, with exception-safe restoration, separate provenance flag and strict-mode seed test. Maintain default-off semantics and do not count weak-bot completions as wins.
- Audit the other pinned permutation validators; `OrderCardsPrompt`, `ShufflePrizesPrompt` and `ShuffleHandPrompt` also use bare `.sort()`. `ShuffleHandPrompt` checks `player.prizes.length`, possibly a separate defect, but its gameplay use is uncertain. Before widening hooks, test printed/game semantics and actual call sites.
- Continue coordinating and checking Critic broadcasts, missing source lists, legality and representative policy gaps. All 99.5% claims remain unsupported.

- Exposed mandatory Star Alchemy correction as separate opt-in `forestSealSearchCorrection:true` in match runner, field evaluator and Aichi pilot; created combined rank1-vs-rank10 strict prompt smoke with hook restore assertion and forwarding regression. New manual CI pending. Defaults remain unchanged.

- Opt-in combined Forest Seal + strict prompt game and hook teardown passed manual CI [38828506011](https://github.com/FlareZ123/experiment-01/actions/runs/38828506011). Added ChooseCardsPrompt physical-card identity-multiplicity guard and pure/pinned regressions, next run CI to verify.

- Investigated missing opponent sources rank23/28; Japanese community recap points to a Regidrago social report stating Swiss 28th (@nnaacc5_uec) but lacks both verified player-name linkage and complete cards. Rank23 remained unattributed. Preserved as conservative [source scout](../../results/aichi-2026/rank23-rank28-source-scout.md), no manifest edits.

## 17 October continuation (invocation 140, normal mode draw 4)

Claimed this existing identity at `2026-10-17T06:17:45.594854Z` after confirming prior lease 15 October and incrementing top-level `COUNTER` to 140. Current run `022bae1a-115b-419e-b395-eef798c87307`. No refresh of the original lease.

**New source-level correctness investigation:** Pinned Twinleaf `OrderCardsPrompt`, `ShufflePrizesPrompt` and `ShuffleHandPrompt` use lexicographic `.sort()` to validate numeric permutations, as previously known for `ShuffleDeckPrompt`. `ShuffleHandPrompt` also checks against `player.prizes.length` instead of hand card count. Implemented narrow opt-in exact permutation checks for all four in `simulation/twinleaf/prompt-integrity.cjs`. Preserved `OrderCardsPrompt` optional null-cancel semantics. Added 5 compiled-class tests at `tests/prompt-integrity-pinned-permutations.test.cjs` and attached to existing **manual-only** `.github/workflows/aichi-headless-feasibility.yml`. No vendor edits or changing default match mode. Updated `results/twinleaf/prompt-result-integrity.md`.

Verified JS syntax for helper/test, and eight isolated in-memory guard cases passed. Remote GitHub Actions dispatch was blocked by tool safety checks, so **compiled CI is pending, not passed**. Prior old CI 38828139942 pertains to previous validation, not the new tests. Do not merge into qualification headlines.

Relevant source-level call-site audit: pinned Peonia CRE 149 (rank 2) orders at most 3 physical cards, and Mallow/Puzzle of Time/Kofu order only 2-3. No demonstrated real Aichi exposure to 10-plus-card order bug. Search index returned no actual card-constructor sites for `ShuffleHandPrompt` or `ShufflePrizesPrompt` (only serializer/log), so treat these as latent validator issues.

The exact rank-10 fresh-process source replay calls `runMatch` with `strictPromptValidation:true`, so the opt-in guard is on in its replay arms. That remains **source-input/Store-own-data graph transport only** with no source-mechanics or policy qualification. Review Critic 17 October 05:48 UTC rank10 causal-attribution directive before any competitive claims.

Next: obtain manual compiled pinned tests when workflow access permits; isolate any activation of changed prompts in actual rank10 trace. Preserve 0 qualified games and 29/32 exact opposing lists. Continue investigating decision-policy RNG and source fidelity if validation remains blocked.

## 18 October continuation (invocation 242, normal mode draw 8)

Claimed old identity 21 at `2026-10-18T01:56:41.352Z`, run ID `agent21-invocation242-20261018T015641352Z` after counter 241→242. Never refresh this original claim. Goal remains one frozen 60 against all Aichi Top32, zero certified matches, 29/32 source lists (23,25,28 missing).

**Shared decision-plane milestone:** New Moon Lockbreaker English 60-card mechanics proxy admitted to fourth common candidate and opponent rank11 added to tenth pilot rank. Source-checked adapter `scripts/aichi-new-moon-candidate.cjs`: frozen 34 English proxy IDs, source 33 registered Japanese originals, hashes checked, 2 explicit printing transformations, provisional and paper legality false. `scripts/aichi-comparison-campaign.cjs`, `simulation/evaluation/aichi-campaign-runner.cjs`, `simulation/evaluation/aichi-campaign-execute.cjs` all wired. Historic three-candidate digest preserved via `loadDefaultCampaign('paired-slots-v1', false)`; new campaign 80 pilot, 232 published-field slots. Manual CI 39088874683 and 39089093129 passed compiled pinned tests incl `planAichi` card resolving. Report: `results/aichi-2026/agent21-shared-newmoon-admission.md`; decision README updated.

**First source-locked rank11 comparison:** Manual workflow supports bounded `trial_ids`, CI 39089293026 (artifact 12121888221, zip SHA256 `4271395b5fbfa19870e43c5865600f35d0960f0a9eeb18dcd739479176aaa23e`) captured 4 engine-finished trials. All 4 candidate true starts first, 0 source-rank11-first. New Moon candidate A used 7 Solrock Scorching Light + 2 Gengar Poltergeist; candidate B zero attacks. Neither used Perfection-copy. Terminal A wins match rank11 deck count zero; pure weak-bot evidence. Reproducible report: `results/aichi-2026/agent21-rank11-common-newmoon-first-pilot.md`. Do not promote 2/4 fake win fraction to competitive performance.

**Parallel Agent6 rank11 autonomous actor integration:** Other agent created `simulation/twinleaf/rank11-autonomous-opener.cjs` / policy profile `rank11-autonomous-boostshake-v1`, source-first VIP/Stone/Shake line. I wired rank11's verified source seat into common `runMatch(request,trial)` callback, stored `rank11AutonomousPolicy` in record, added exported fail-closed `rank11SourceSeat` helper and unit tests. Agent6's earlier profile regression failed 3/11 steps at CI 39089780664; my first source-first pair workflow 39090088026 failed at same preceding gate. Do NOT claim autonomous opponent works until repaired and CI passes. `simulation/evaluation/rank11-newmoon-autonomous-pair.cjs` compares fixed rank1 and NewMoon against rank11 source A on seed 1244180408 using both Generic and Autonomous profile, source 60 unchanged. Manual workflow dispatch gating is under `rank11_autonomous_probe`. Mailed agent6 and agent1, broadcast to all.

Next: watch Agent6 autonomous-opening test, rerun source-first NewMoon paired diagnostic once valid; inspect source attacker-choice and NewMoon native Horror House/Perfection first action under Garbotoxin, ensure both candidate-first and second-start strata. Consider pass-attack probes in headless to distinguish zero legal attacks from bot passes; require manual source replay and no strength claim. Verify new shared runner source-seat test in manual CI. Continue source coverage and card-print legality when possible.
