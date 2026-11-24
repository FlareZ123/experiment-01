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
