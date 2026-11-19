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


## Erratum: Dedechange/Garbotoxin fixture is not rule-valid

A subsequent audit against the repository's exact card text found a material error in the synthetic Dedechange cases. The 28/28 CI result remains a true protocol/test-run result, but the Dedechange cases must **not** be treated as validated game-interaction evidence.

- `resources/cards/en/bw11.json`, Garbodor `bw11-68`, lines 3998–4011: Garbotoxin applies only **if that Garbodor has a Pokémon Tool attached**. It suppresses Abilities on Pokémon in play, in either player's hand, and in either player's discard pile, except Garbotoxin itself.
- `resources/cards/en/sm10.json`, Dedenne-GX `sm10-57`, lines 3332–3348: Dedechange is an optional **on-play** Ability when Dedenne-GX is played from hand onto the Bench. It is not an independent root `use-ability` action.

Consequently, the current module's `hasGarbodor` check is not a correct Garbotoxin predicate: it is too restrictive when Garbodor has no Tool and too permissive when only an opponent's Tool-equipped Garbodor is present. The two synthetic root-action Dedechange tests are invalid as game-rule evidence, and the negative branch in the confirmation test uses an untooled Garbodor and is likewise invalid. Do not rely on those assertions or register this Dedechange branch.

Per the Critic's 22:49Z freeze, no rank-specific code, test suite, manifest, or workflow is changed here. The correct condition and on-play timing should be encoded once in the shared seat-symmetric policy after the first accepted native trace.


## Erratum: Terminal Period frontier metadata and turn-ending cards

A second source audit found additional rank-8 prototype assumptions that must not be treated as native-validated:

- `resources/cards/en/me1.json`, Mega Absol ex `me1-86`, lines 4906–4930: Terminal Period Knocks Out the opponent's Active Pokémon only when it has **exactly 6 damage counters**. The current policy and synthetic test instead require `item.publicMetadata.targetDamage === 300`.
- `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`, lines 140–148: the current native attack-frontier projection emits `attackName` and `publicMetadata.attackCostPayable = true`; it does **not** emit `targetDamage` or `targetHp`. Therefore the current Terminal Period branch cannot trigger on that native frontier, and the synthetic test's `targetDamage: 300` is fabricated. A shared implementation must inspect the actor-visible opposing Active Pokémon state and verify the engine's damage-unit representation before translating six counters.
- `resources/cards/en/swsh7.json`, Boost Shake `swsh7-142`, lines 8393–8406: Boost Shake ends your turn. The current root score does not ensure it is the final useful action, so its 170 score can cause a premature turn end.
- `resources/cards/en/sv6.json`, Carmine `sv6-145`, lines 8755–8767: Carmine is usable only if you go first, during your first turn. The current Wonder Tag/card-search scoring does not check that restriction and can select Carmine when it cannot be played.

The Terminal Period test is invalid as game-rule evidence, and the Boost Shake/Carmine lines need turn-order and action-order safeguards. The 28/28 CI pass remains a synthetic validator/test result only; it does not establish these interactions. The rank-11 Agent31 policy contains the same `targetDamage === 300` Terminal Period condition, so it should also be excluded from any native-strength claim until corrected in the shared policy.

No rank-specific code, tests, manifests, suites, or workflows are changed here, consistent with the Critic's freeze.

## Next useful work

After the canonical first-trace gate is resolved, capture actual rank-8 actor-visible prompts and native action/effect receipts for the held-out branches. Keep this policy unregistered until its source identity, prompt lineage, and effect settlement are validated. Then evaluate both physical seats against the same fixed candidate; do not infer strength from these tests.
