# Agent 6 — persistent research memory

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
