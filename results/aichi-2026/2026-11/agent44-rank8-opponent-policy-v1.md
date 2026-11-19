# Aichi 2026 rank-8 Absol/Garbodor opponent policy v1

**Status:** bounded preparation artifact; focused contract CI passed; no native game or matchup result.

## Source and candidate bindings

- Aichi Top 32 source: rank 8, Yusuke Kobayashi, Absol/Garbodor; exact 60-card row in `results/aichi-2026/full-decklists.json`.
- Source-list Git blob SHA-1: `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Rank-8 entry JSON SHA-256: `965a4a0d7bea2df491d44e7b3246d1058d676347c9521f1e3b5daaf0eecf39ad`.
- Candidate held fixed for this policy contract: `results/aichi-2026/candidate-hood-shadow-rider.json`, SHA-1 `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`, entry JSON SHA-256 `4c18dd93ba49fd8f7d88aad573249dc6941b4cf61d52b99f80309345b5d58c59`. No candidate list was changed.
- Twinleaf is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`.

## Implementation

- Policy: `simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy.cjs`.
- Tests: `tests/2026-11/agent44-rank8-absol-garbodor-opponent-policy.test.cjs`.
- Dependency manifest: `agent44-rank8-opponent-policy-v1-dependencies.json`.
- Challenge suite: `agent44-rank8-opponent-policy-v1-challenge-suite.json`.
- Worker protocol: `simulation/evaluation/2026-11/agent49-policy-worker.cjs`, blob SHA-1 `d51ea95c457d61b50a9ee114d342eb17f4350451`.
- The module is deterministic, actor-view-only, one-file compatible, and obeys the worker's empty `config: {}` initialization contract.
- The 18 development cases cover VIP Pass basic priority; Quick Ball and Ultra Ball costs and searches; VS Seeker and Wonder Tag Supporter selection; Boost Shake into Garbodor; Dark Patch recipient selection; Dedechange before/after own Garbotoxin; Squawkabilly Motivate sequencing; Terminal Period's exact 300-damage threshold; Claw of Darkness revealed-hand selection; Forest Seal Stone's Crobat V target; and fail-closed handling for unvalidated recovery/multi-target items.
- Rank-11-only Trubbish Call for Family behavior is explicitly not inherited by rank 8.

## Validation

The existing rank-7 policy contract workflow was extended to run the rank-8 suite as well; no new workflow or native runner was added.

- Latest run: [44631949020](https://github.com/FlareZ123/experiment-01/actions/runs/44631949020).
- Commit: `33e3c391d8730c5e532725f555a5f30815a577cc`.
- Result: **28/28 rank-8 tests passed; 72/72 combined rank-7 and rank-8 tests passed**.
- The tests invoke the actual worker `validateInit`, `validateRequest`, and `validateDecision` functions, not a reimplementation.
- The first attempt exposed a fixture error: a single Quick Ball choice was incorrectly marked as multi-select. The policy now recognizes only the worker's declared multi-select types; the corrected single-choice fixture and the expanded search/recovery tests passed.

## Explicit limitations

- These are synthetic actor-view policy and protocol tests, not games.
- No native Twinleaf game, native action/effect receipt, registered policy producer, matchup result, or win-rate estimate exists.
- Ten prompt families remain held out for exact source/prompt and effect-settlement validation, including Tapu Koko's two-recipient ability, Crispin's linked energy choices, Battle Compressor, Pokémon Communication, Wally, Karen, Hisuian Heavy Ball, full Secret Box search, Adventure Bag, and Field Blower.
- The published Aichi source is an English Expanded-legal diagnostic reconstruction; physical Japanese print identity remains unverified.
- This prototype does not establish opponent competence, candidate strength, or any progress toward a 99.5% win-rate claim.

## Next useful work

After the canonical first-trace gate is resolved, capture actual rank-8 actor-visible prompts and native action/effect receipts for the held-out branches. Keep this policy unregistered until its source identity, prompt lineage, and effect settlement are validated. Then evaluate both physical seats against the same fixed candidate; do not infer strength from these tests.
